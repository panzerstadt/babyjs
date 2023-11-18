import { Environment } from "../environment";
import { RuntimeError } from "../errors";
import { AnyExpr, Expr } from "../constructs/expressions";
import { AnyStmt, Stmt } from "../constructs/statements";
import { NULL_LITERAL, Token } from "../token";
import { LoggerType, TokenType, assertNever } from "../types";
import { PrintStyle, printAST } from "./pprinter";
import { isTruthy } from "../constants";

export class Interpreter {
  private loop_upper_bound = 10_000;
  private environment = new Environment();
  logger: Console | LoggerType = console;

  setLogger(newLogger: LoggerType) {
    this.logger = newLogger;
    this.environment.setLogger(newLogger);
  }

  public interpret(statements: AnyStmt[], debug?: boolean): RuntimeError | undefined {
    this.environment.setDebug(debug);
    try {
      if (statements.length === 1 && statements[0].type === "expression") {
        const statement = statements[0];
        this.visitPrintStmt({ type: "print", expression: statement.expression }, debug);
        return;
      }
      for (const statement of statements) {
        this.execute(statement, debug);
      }
    } catch (runtimeError) {
      // this.logger.log("runtime error", runtimeError);
      return runtimeError as RuntimeError;
      // lox.runtimeError(error);
    }
  }

  private execute(stmt: AnyStmt, debug?: boolean) {
    switch (stmt.type) {
      case "expression":
        return this.visitExpressionStmt(stmt, debug);
      case "if":
        return this.visitIfStmt(stmt, debug);
      case "while":
        return this.visitWhileStmt(stmt, debug);
      case "print":
        return this.visitPrintStmt(stmt, debug);
      case "let":
        return this.visitLetStmt(stmt, debug);
      case "block":
        return this.visitBlockStmt(stmt, debug);
      default:
        assertNever(stmt);
    }

    // unreachable
    this.logger.error(`reached unreachable code at '${this.evaluate.name}'!`);
    return null;
  }

  private executeBlock(statements: AnyStmt[], environment: Environment, debug?: boolean) {
    const previous = this.environment;
    try {
      this.environment = environment;
      debug && this.environment.printEnvironment("newEnv");

      for (const statement of statements) {
        this.execute(statement, debug);
      }
    } finally {
      this.environment = previous;
    }
  }

  // like printAST's process() method, is recursive
  private evaluate(expr: AnyExpr): Object {
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
      case "variable":
        return this.visitVariableExpr(expr);
      case "assign":
        return this.visitAssignExpr(expr);
      default:
        assertNever(expr);
    }

    // unreachable
    this.logger.error(`reached unreachable code at '${this.evaluate.name}'!`);
    // @ts-expect-error
    return null;
  }

  // https://chat.openai.com/share/ba09a5f7-a8a4-4401-aa24-898c91c89d40
  private isTruthy(object: Object): boolean {
    return isTruthy(object);
  }

  private isEqual(a: Object, b: Object): boolean {
    /**
     * This is one of those corners where the details of
     * how we represent Lox objects in terms of Java matter.
     * We need to correctly implement Lox’s notion of equality,
     * which may be different from Java’s.
     *
     * ^ this but javascript
     */
    return a === b;
  }

  private checkNumberOperand(operator: Token, operand: Object) {
    if (typeof operand === "number") return;
    throw new RuntimeError("Operand must be a number.", operator);
  }

  private checkNumberOperands(operator: Token, firstOperand: Object, secondOperand: Object) {
    if (typeof firstOperand === "number" && typeof secondOperand === "number") return;
    throw new RuntimeError("Operands must be numbers.", operator);
  }

  private checkDivideByZero(operator: Token, secondOperand: Object) {
    if (typeof secondOperand === "number" && secondOperand !== 0) return;
    throw new RuntimeError("Cannot divide by zero", operator);
  }

  /**
   * EXPRESSIONS (Primitives)
   */
  // literal is leaf node of the expression, it holds the value
  public visitLiteralExpr(expr: Expr["Literal"]): Object | number {
    return expr.value!;
  }

  public visitLogicalExpr(expr: Expr["Logical"]): Object {
    const left = this.evaluate(expr.left);

    // JavaScript supports C style switch case fall through,
    // which means unless there is a break specified, it will
    // continue to execute all the subsequent cases.
    switch (expr.operator.type) {
      case TokenType.OR:
        if (this.isTruthy(left)) return left;
        break;
      case TokenType.AND:
        if (!this.isTruthy(left)) return left;
        break;
    }

    return this.evaluate(expr.right);
  }

  public visitGroupingExpr(expr: Expr["Grouping"]): Object {
    return this.evaluate(expr.expression)!;
  }

  public visitUnaryExpr(expr: Expr["Unary"]): Object {
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.BANG:
        return !this.isTruthy(right!) as boolean;
      case TokenType.MINUS:
        // typecasting happening here
        // this is what makes a language dynamically typed (vs static)
        return -right! as number;
    }

    // unreachable
    // @ts-expect-error
    return null;
  }

  public visitBinaryExpr(expr: Expr["Binary"]): Object {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      // equality
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right);
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);
      // comparison
      case TokenType.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return (left > right) as boolean;
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return (left >= right) as boolean;
      case TokenType.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return (left < right) as boolean;
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return (left <= right) as boolean;
      //arithmetic
      case TokenType.MINUS:
        this.checkNumberOperand(expr.operator, right);
        // @ts-ignore
        return (left - right) as number;
      case TokenType.PLUS:
        if (typeof left === "number" && typeof right === "number") {
          return (left + right) as number;
        }
        if (typeof left === "string" && typeof right === "string") {
          return (left + right) as string;
        }
        throw new RuntimeError("Operands must be two numbers or two strings.", expr.operator);
      case TokenType.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        this.checkDivideByZero(expr.operator, right);
        // @ts-ignore
        return (left / right) as number;
      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        // @ts-ignore
        return (left * right) as number;
    }

    // unreachable
    // @ts-expect-error
    return null;
  }

  public visitTernaryExpr(expr: Expr["Ternary"]): Object {
    const left = this.evaluate(expr.left);
    const center = this.evaluate(expr.center);
    const right = this.evaluate(expr.right);

    if (expr.leftOp.type === TokenType.QUESTION && expr.rightOp.type === TokenType.COLON) {
      return this.isTruthy(left) ? center : right;
    }

    // unreachable
    // @ts-expect-error
    return null;
  }

  public visitVariableExpr(expr: Expr["Variable"]): Object {
    return this.environment.get(expr.name);
  }

  public visitAssignExpr(expr: Expr["Assign"]): Object {
    const value = this.evaluate(expr.value);
    this.environment.assign(expr.name, value);
    return value;
  }

  /**
   * STATEMENTS (Primitives)
   */
  public visitExpressionStmt(stmt: Stmt["Expression"], debug = false): void {
    debug && this._debugStatement(stmt);

    this.evaluate(stmt.expression);
  }

  public visitIfStmt(stmt: Stmt["If"], debug?: boolean) {
    debug && this._debugStatement(stmt);

    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (!!stmt.elseBranch) {
      this.execute(stmt.elseBranch);
    }
    return null;
  }

  public visitWhileStmt(stmt: Stmt["While"], debug?: boolean) {
    debug && this._debugStatement(stmt);
    let count = 0;

    while (this.isTruthy(this.evaluate(stmt.condition))) {
      if (count > this.loop_upper_bound) {
        throw new RuntimeError(`Infinite loop detected at '${stmt.type}': ${stmt.condition}`);
      }
      this.execute(stmt.body);
      count++;
    }
    return null;
  }

  public visitPrintStmt(stmt: Stmt["Print"], debug?: boolean): void {
    debug && this._debugStatement(stmt);

    const value = this.evaluate(stmt.expression);

    debug && this.logger.log("Interpreted Output:");
    this.logger.log(">>", value);
  }

  public visitLetStmt(stmt: Stmt["Let"], debug?: boolean): void {
    debug && this._debugStatement(stmt);

    let value = NULL_LITERAL as Object;
    if (stmt.initializer !== null) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value, stmt.name);
  }

  public visitBlockStmt(stmt: Stmt["Block"], debug?: boolean): void {
    debug && this._debugStatement(stmt);

    // lexical scope env setup
    const blockEnv = new Environment(this.environment);
    blockEnv.setDebug(debug);
    blockEnv.setLogger(this.logger);

    this.executeBlock(stmt.statements, blockEnv, debug);
  }

  private _debugStatement(stmt: AnyStmt) {
    // @ts-ignore
    let expr: AnyExpr = stmt.expression || stmt.initializer || stmt;

    this.logger.log("lisp-like: ", printAST(expr, PrintStyle.parenthesis));
    this.logger.log("- - - - -");
    this.logger.log("rpn      : ", printAST(expr, PrintStyle.rpn));
    this.logger.log("- - - - -");
    this.logger.log("ast      :\n", printAST(expr, PrintStyle.ast));
    this.logger.log("- - - - -");
    this.logger.log("ast(json):\n", ...JSON.stringify(printAST(expr, PrintStyle.json), null, 3).split("\n")); // prettier-ignore
    this.logger.log(" ");
  }
}
