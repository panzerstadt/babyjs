import { Stack } from "../../../../components/Stack";
import { AnyExpr, Expr } from "../../constructs/expressions";
import { AnyStmt, Stmt } from "../../constructs/statements";
import { LoggerType, assertNever } from "../../types";
import { Interpreter } from "../interpreters/interpreter";
import { Token, _EMPTY_FN_RETURN } from "../../token";
import { ParseError, VariableResolveError } from "../../errors";
import { FunctionType } from "../../constants";

/**
Our variable resolution pass works like a sort of mini-interpreter. It walks the tree, visiting each node, but a static analysis is different from a dynamic execution:
- There are no side effects. When the static analysis visits a print statement, it doesn’t actually print anything. Calls to native functions or other operations that reach out to the outside world are stubbed out and have no effect.
- There is no control flow. Loops are visited only once. Both branches are visited in if statements. Logic operators are not short-circuited.

---
Only a few kinds of nodes are interesting when it comes to resolving variables:

- A block statement introduces a new scope for the statements it contains.
- A function declaration introduces a new scope for its body and binds its parameters in that scope.
- A variable declaration adds a new variable to the current scope.
- Variable and assignment expressions need to have their variables resolved.
 */
export class VariableResolver {
  private readonly interpreter: Interpreter;
  // @ts-ignore
  private readonly scopes = new Stack<Map<string, boolean>>(); // string = decl name, boolean = isReady
  private currentFunction = FunctionType.NONE;
  logger: LoggerType = console;
  private _error: VariableResolveError;

  public setLogger(newLogger: LoggerType) {
    this.logger = newLogger;
    this._error.setLogger(newLogger);

    // TODO: enable debug to view stack as json (so that we can view it on a terminal / ui)
  }

  hadError() {
    return this._error.hadError;
  }

  constructor(interpreter: Interpreter) {
    this.interpreter = interpreter;
    this._error = new VariableResolveError();
  }

  // resolver starts here
  public resolve(statements: AnyStmt[], debug?: boolean) {
    for (const statement of statements) {
      this._resolveStmt(statement);
    }

    if (this.hadError()) {
      this._error.printErrors();
    }
  }

  private visitBlockStmt(stmt: Stmt["Block"], debug?: boolean) {
    this.beginScope();
    this.resolve(stmt.statements);
    this.endScope();
    return null;
  }

  private beginScope() {
    this.scopes.push(new Map<string, boolean>());
  }

  private endScope() {
    this.scopes.pop();
  }

  private _resolveStmt(stmt: AnyStmt, debug?: boolean): null {
    switch (stmt.type) {
      case "expression":
        return this.visitExpressionStmt(stmt, debug);
      case "if":
        return this.visitIfStmt(stmt, debug);
      case "while":
        return this.visitWhileStmt(stmt, debug);
      case "print":
        return this.visitPrintStmt(stmt, debug);
      case "return":
        return this.visitReturnStmt(stmt, debug);
      case "function":
        return this.visitFunctionStmt(stmt, debug);
      case "let":
        return this.visitLetStmt(stmt, debug);
      case "block":
        return this.visitBlockStmt(stmt, debug);
      case "rangeFor":
        return this.visitRangeForStmt(stmt, debug);
      default:
        assertNever(stmt);
        // @ts-expect-error
        throw new Error(`NOT IMPLEMENTED: statement '${stmt?.type}' needs to be implemented`);
    }

    // unreachable
    this.logger.error(
      "resolve-variable",
      `reached unreachable code at '${this._resolveStmt.name}'!`
    );
    return null;
  }

  public visitLetStmt(stmt: Stmt["Let"], debug?: boolean) {
    this.declare(stmt.name);
    if (stmt.initializer !== null) {
      this._resolveExpr(stmt.initializer);
    }
    this.define(stmt.name);
    return null;
  }

  public visitFunctionStmt(stmt: Stmt["Function"], debug?: boolean) {
    this.declare(stmt.name);
    this.define(stmt.name);

    this.resolveFunction(stmt, FunctionType.FUNCTION);
    return null;
  }

  /**
   * Once that’s ready, it resolves the function body in that scope.
   * This is different from how the interpreter handles function declarations.
   * At runtime, declaring a function doesn’t do anything with the
   * function’s body. The body doesn’t get touched until later when
   * the function is called. In a static analysis, we immediately
   * traverse into the body right then and there.
   */
  private resolveFunction(fn: Stmt["Function"], type: FunctionType) {
    const enclosingFunction = this.currentFunction;
    this.currentFunction = type;

    this.beginScope();
    for (const param of fn.params) {
      this.declare(param);
      this.define(param);
    }
    this.resolve(fn.body);
    this.endScope();
    this.currentFunction = enclosingFunction;
  }

  public visitExpressionStmt(stmt: Stmt["Expression"], debug?: boolean) {
    this._resolveExpr(stmt.expression);
    return null;
  }

  public visitIfStmt(stmt: Stmt["If"], debug?: boolean) {
    this._resolveExpr(stmt.condition);
    this._resolveStmt(stmt.thenBranch);
    if (stmt.elseBranch !== null && stmt.elseBranch !== undefined) {
      this._resolveStmt(stmt.elseBranch!);
    }
    return null;
  }

  public visitPrintStmt(stmt: Stmt["Print"], debug?: boolean) {
    this._resolveExpr(stmt.expression);
    return null;
  }

  public visitReturnStmt(stmt: Stmt["Return"], debug?: boolean) {
    if (this.currentFunction === FunctionType.NONE) {
      this._error.error(stmt.keyword, "Can't return from top-level code.");
    }
    if (stmt.value !== null && stmt.value !== _EMPTY_FN_RETURN) {
      this._resolveExpr(stmt.value);
    }
    return null;
  }

  public visitWhileStmt(stmt: Stmt["While"], debug?: boolean) {
    this._resolveExpr(stmt.condition);
    this._resolveStmt(stmt.body);
    return null;
  }

  // FIXME: rusty for loops not working yet
  public visitRangeForStmt(stmt: Stmt["RangeFor"], debug?: boolean) {
    this._resolveExpr(stmt.start);
    this._resolveExpr(stmt.end);
    this._resolveStmt(stmt.body);
    return null;
  }

  // init, e.g. "let a;"
  private declare(name: Token) {
    if (this.scopes.isEmpty()) return;

    const scope = this.scopes.peek();
    if (scope!.has(name.lexeme)) {
      this._error.error(name, `There is already a variable with name ${name.lexeme} in this scope`);
    }
    scope!.set(name.lexeme, false);
  }
  // assign, e.g. "a = 10;"
  private define(name: Token) {
    if (this.scopes.isEmpty()) return;
    this.scopes.peek()!.set(name.lexeme, true);
  }

  private _resolveExpr(expr: AnyExpr): null {
    switch (expr.type) {
      case "ternary":
        return this.visitTernaryExpr(expr);
      case "binary":
        return this.visitBinaryExpr(expr);
      case "grouping":
        return this.visitGroupingExpr(expr);
      case "literal":
        return this.visitLiteralExpr(expr);
      case "logical":
        return this.visitLogicalExpr(expr);
      case "unary":
        return this.visitUnaryExpr(expr);
      case "call":
        return this.visitCallExpr(expr);
      case "variable":
        return this.visitVariableExpr(expr);
      case "assign":
        return this.visitAssignExpr(expr);
      default:
        assertNever(expr);
        // @ts-expect-error
        throw new Error(`NOT IMPLEMENTED: expression '${expr?.type}' needs to be implemented`);
    }

    // unreachable
    this.logger.error(
      "resolve-variable",
      `reached unreachable code at '${this._resolveExpr.name}'!`
    );
    return null;
  }

  private visitVariableExpr(expr: Expr["Variable"]) {
    if (!this.scopes.isEmpty() && this.scopes.peek()!.get(expr.name.lexeme) === false) {
      this._error.error(
        expr.name,
        `Can't read local variable in its own initializer! You are in a block (local) scope, so you might be trying to declare '${expr.name.lexeme}' by assigning it the value of a shadowed outer variable '${expr.name.lexeme}'. This might be an attempt to shadow an outer variable. Consider using the outer variable directly without redeclaration, or rename the local variable to avoid confusion.`
      );
    }

    this.resolveLocal(expr, expr.name);
    return null;
  }

  private resolveLocal(expr: AnyExpr, name: Token) {
    /**
     * e.g. btm, for a stack like the following:
     * | top  | --> top most (i.e. what you get from .peek())
     * | mid1 |
     * | mid2 |
     * | btm  | --> 'innermost'
     *  ------
     */
    for (let i = 0; i < this.scopes.size(); i++) {
      if (this.scopes.elementAt(i)?.has(name.lexeme)) {
        this.interpreter.resolve(expr, i);
        return;
      }
    }
  }

  public visitAssignExpr(expr: Expr["Assign"]) {
    this._resolveExpr(expr.value);
    this.resolveLocal(expr, expr.name);
    return null;
  }

  public visitTernaryExpr(expr: Expr["Ternary"]) {
    this._resolveExpr(expr.left);
    this._resolveExpr(expr.center);
    this._resolveExpr(expr.right);
    return null;
  }

  public visitBinaryExpr(expr: Expr["Binary"]) {
    this._resolveExpr(expr.left);
    this._resolveExpr(expr.right);
    return null;
  }

  public visitCallExpr(expr: Expr["Call"]) {
    this._resolveExpr(expr.callee);

    for (const args of expr.arguments) {
      this._resolveExpr(args);
    }

    return null;
  }

  public visitGroupingExpr(expr: Expr["Grouping"]) {
    this._resolveExpr(expr.expression);
    return null;
  }

  public visitLiteralExpr(expr: Expr["Literal"]) {
    return null;
  }

  public visitLogicalExpr(expr: Expr["Logical"]) {
    this._resolveExpr(expr.left);
    this._resolveExpr(expr.right);
    return null;
  }

  public visitUnaryExpr(expr: Expr["Unary"]) {
    this._resolveExpr(expr.right);
    return null;
  }
}
