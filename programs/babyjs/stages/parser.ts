import { ParseError } from "../errors";
import { AnyExpr, Expr } from "../constructs/expressions";
import { AnyStmt, Stmt } from "../constructs/statements";
import { Token, _EMPTY_FN_RETURN } from "../token";
import { LoggerType, TokenType } from "../types";
import { MAX_PARAMETER_COUNT } from "../constants";

// TODO: fun extra challenge: support IF x THEN y ELSE z
// which is different from js ternaries (also included) as well as python ternaries (expr1 if condition else expr2)

export class Parser {
  private static ParseError = class extends Error {};
  private tokens: Token[];
  private current: number;
  private _error: ParseError;
  logger: LoggerType = console;

  constructor(tokens: Token[]) {
    this.current = 0;
    this.tokens = tokens;
    this._error = new ParseError();
  }

  setLogger(newLogger: LoggerType) {
    this.logger = newLogger;
    this._error.setLogger(newLogger);
  }

  hadError() {
    return this._error.hadError;
  }

  /**
   * match consumes the token, moving the current token one forward
   */
  private match(...types: TokenType[]) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType) {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }
  private advance() {
    if (!this.isAtEnd()) {
      this.current = this.current + 1;
    }
    return this.previous();
  }
  private isAtEnd() {
    return this.peek().type === TokenType.EOF;
  }
  private peek() {
    return this.tokens[this.current];
  }
  private previous() {
    return this.tokens[this.current - 1];
  }

  // expression -> assignment
  private expression(): AnyExpr {
    return this.assignment();
  }

  // assignment -> IDENTIFIER "=" assignemt | ternary
  private assignment(): AnyExpr {
    let expr = this.or();

    // its possible to have more than a single token lookahead
    // e.g. makeList().head.next = node;
    if (this.match(TokenType.EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();

      if (expr.type === "variable") {
        const name = expr.name;
        return Expr.Assign(name, value);
      }

      this.error(equals, `Invalid assignment target.`);
    }

    return expr;
  }

  private or() {
    let expr = this.and();

    while (this.match(TokenType.OR)) {
      const operator = this.previous();
      const right = this.and();
      expr = Expr.Logical(expr, operator, right);
    }

    return expr;
  }

  private and() {
    let expr = this.ternary();

    while (this.match(TokenType.AND)) {
      const operator = this.previous();
      const right = this.ternary();
      expr = Expr.Logical(expr, operator, right);
    }

    return expr;
  }

  private ternary(chains = 0): AnyExpr {
    let expr = this.equality();

    let count = chains;
    if (this.match(TokenType.QUESTION)) {
      count++;
      if (count === 2) {
        this.logger.info?.(
          `if looks like you're chaining ternary operators, and that might make your code harder to read. maybe try separating your comparison code into individual lines, or explicitly add parentheses to denote ordering?`
        );
      }

      const leftOp = this.previous();
      const center = this.expression();

      this.consume(TokenType.COLON, "Expect ':' after middle ternary expression.");
      const rightOp = this.previous(); // consume, then rewind to grab token

      const right = this.ternary(count++);

      expr = Expr.Ternary(expr, leftOp, center, rightOp, right);
    }

    return expr;
  }

  // equality -> comparison ( ( "!=" | "==" ) comparison )*
  private equality(): AnyExpr {
    let expr = this.comparison();

    let count = 0;
    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous(); // previous token, meaning != or ==
      const right = this.comparison();
      expr = Expr.Binary(expr, operator, right);
      count++;
    }

    if (count > 1) {
      this.logger.info?.(
        `it looks like you're chaining comparison operators, and that might make your code harder to read. maybe try separating your comparison code into individual lines, or explicitly add parentheses to denote ordering?`
      );
    }

    return expr;
  }

  // comparison -> term ( ( ">" | ">=" | "<" | "<=" ) term )*
  private comparison(): AnyExpr {
    let expr = this.term();

    while (
      this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)
    ) {
      const operator = this.previous();
      const right = this.term();
      expr = Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  // term = factor ( ( "+" | "-" ) factor )*
  private term(): AnyExpr {
    let expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.factor();
      expr = Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  // factor = unary ( ( "/" | "*" ) unary )*
  private factor(): AnyExpr {
    let expr = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous();
      const right = this.unary();
      expr = Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  // unary = ( "!" | "-" ) unary | primary
  private unary(): AnyExpr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return Expr.Unary(operator, right);
    }

    return this.call();
  }

  private call(): AnyExpr {
    let expr = this.primary();

    while (true) {
      if (this.match(TokenType.LEFT_PAREN)) {
        /**
         * it’s roughly similar to how we parse infix operators.
         * First, we parse a primary expression, the “left operand”
         * to the call. Then, each time we see a (, we call finishCall()
         * to parse the call expression using the previously parsed
         * expression as the callee. The returned expression becomes
         * the new expr and we loop to see if the result is itself called.
         */
        expr = this.finishCall(expr);
      } else {
        break;
      }
    }

    return expr;
  }

  private finishCall(callee: AnyExpr): AnyExpr {
    let _arguments: AnyExpr[] = [];
    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        // makes bytecode interpreter easier (but actually no other reason to limit)
        if (_arguments.length >= MAX_PARAMETER_COUNT) {
          this.error(this.peek(), `Can't have more than ${MAX_PARAMETER_COUNT} arguments.`);
        }
        _arguments.push(this.expression());
      } while (this.match(TokenType.COMMA));
    }

    const paren = this.consume(TokenType.RIGHT_PAREN, "Expect ')' after arguments.");

    return Expr.Call(callee, paren, _arguments);
  }

  // primary -> NUMBER | STRING | "true" | "false" | "(" expression ")"
  private primary(): AnyExpr {
    if (this.match(TokenType.FALSE)) return Expr.Literal(false);
    if (this.match(TokenType.TRUE)) return Expr.Literal(true);

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      // cause match advances, after we match it we take the previous token
      return Expr.Literal(this.previous().literal);
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return Expr.Variable(this.previous());
    }

    // if this turns out to be the start of a group
    if (this.match(TokenType.LEFT_PAREN)) {
      // make an expression
      const expr = this.expression();
      // work on the insides until you reach a right parenthesis
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      // then return it as a group
      return Expr.Grouping(expr);
    }

    /**
     * when you miss a left hand operand, first expression falls here
     * because your first token is a binary operator, and nothing
     * starts with a binary operator
     */
    const offendingToken = this.peek();
    this.error(offendingToken, `Expected an operand before '${offendingToken.lexeme}'`);

    // @ts-ignore
    return null;
    // not throwing allows broken statements,
    // but we also return hadError = true so we can collect and print all errors.
  }

  private consume(type: TokenType, expectsMessage: string): Token {
    if (this.check(type)) return this.advance();

    throw this.error(this.peek(), expectsMessage);
  }

  // these are STATIC errors: ERRORTYPE.STATIC
  error(token: Token, message: string) {
    // this.logger.error(`tokens errored: ${token.toString()} with '${message}'`);
    this._error.error(token, message); // 1. report to user
    // this._error.printErrors();
    // return new Parser.ParseError(); // 2. return exception (not throw. parser will decide whether or not to throw)
  }

  // error recovery,
  // to synchronize the token consuming logic one stack above
  // e.g. (-1 nested expression)
  private synchronize(): void {
    // It discards tokens until it thinks it has found a statement boundary.
    // After catching a ParseError, we’ll call this and then we are
    // hopefully back in sync.
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) return;

      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUNC:
        case TokenType.LET:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
  }

  private forStatement() {
    this.consume(TokenType.LEFT_PAREN, "Expect  '(' after  'for'.");

    if (this.check(TokenType.IDENTIFIER)) {
      return this.rangeForStatement();
    } else {
      return this.cForStatement();
    }
  }

  /**
   * https://doc.rust-lang.org/reference/expressions/range-expr.html
   * for (i in 0..5) { ... }
   */
  private rangeForStatement() {
    // for (<here> in 0..5) { ... }
    const initializer = this.varDeclaration(false);
    // for (i <here> 0..5) { ... }
    this.consume(TokenType.IN, "Expect 'in' in 'for' clause.");
    // for (i in <here>..5) { ... }
    const start = this.expression();
    // for (i in 0<here>5) { ... }
    this.consume(TokenType.DOT_DOT, "Expect '..' in range expression of 'for' loop");
    // for (i in 0..(=)?5) { ... } --> optionally inclusive range
    let inclusive = false;
    if (this.match(TokenType.EQUAL)) {
      inclusive = true;
    }
    // for (i in 0..<here>) { ... }
    const end = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after 'for' clauses");
    const body = this.statement();

    return Stmt.Block([initializer, Stmt.RangeFor(initializer, start, end, inclusive, body)]);
  }

  /**
   * 'desugaring', or turning syntactic sugar into its underlying implementation
   * since for loops can be made up of other statments, we can 'desugar' it
   *
      var i = 0; -> initializer part of the 'for' clause
      while (i < 10) { -> condition part of the 'for' clause
        print i; -> statement inside the body
        i = i + 1; -> increment part of the 'for' clause
      }
   */
  private cForStatement() {
    // this.consume(TokenType.LEFT_PAREN, "Expect  '(' after  'for'.");

    // for (<HERE>; i < len; i++) { ... }
    let initializer;
    if (this.match(TokenType.SEMICOLON)) {
      // e.g. https://www.quora.com/Is-it-possible-to-write-a-for-loop-in-C-without-initializing-any-variable
      initializer = null;
    } else if (this.match(TokenType.LET)) {
      initializer = this.varDeclaration();
    } else {
      initializer = this.expressionStatement();
    }

    // for (let i = 0; <HERE>; i++) { ... }
    let condition = null;
    if (!this.check(TokenType.SEMICOLON)) {
      condition = this.expression();
    }
    this.consume(TokenType.SEMICOLON, "Expect ';' after loop condition.");

    // for (let i = 0; i < len; <HERE>) { ... }
    let increment = null;
    if (!this.check(TokenType.RIGHT_PAREN)) {
      increment = this.expression();
    }
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after 'for' clauses");

    // for (let i = 0; i < len; i++) { <HERE> }
    let body = this.statement();

    // for (let i = 0; i < len; <HERE>) { ... }
    // if incr is defined, eval the body, and then eval incr
    if (increment !== null) {
      body = Stmt.Block([body, Stmt.Expression(increment)]);
    }

    // for (let i = 0; <HERE>; i++) { ... }
    // if condition is not defined, just keep going
    if (condition === null) {
      condition = Expr.Literal(true);
    }
    body = Stmt.While(condition, body);

    // for (<HERE>; i < len; i++) { ... }
    // if init exists, runs initializer before the entire loop
    if (initializer !== null) {
      body = Stmt.Block([initializer, body]);
    }

    return body;
  }

  private whileStatement() {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'while'");
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after 'while' condition");
    const body = this.statement();

    return Stmt.While(condition, body);
  }

  private ifStatement() {
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'");
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after 'if' condition");

    const thenBranch = this.statement();
    let elseBranch;
    if (this.match(TokenType.ELSE)) {
      elseBranch = this.statement();
    }

    return Stmt.If(condition, thenBranch, elseBranch);
  }

  private printStatement() {
    const value = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
    return Stmt.Print(value);
  }

  private returnStatement() {
    const keyword = this.previous();
    let value: AnyExpr | typeof _EMPTY_FN_RETURN = _EMPTY_FN_RETURN;
    if (!this.check(TokenType.SEMICOLON)) {
      value = this.expression();
    }

    this.consume(TokenType.SEMICOLON, "Expect ';' after return value");
    return Stmt.Return(keyword, value);
  }

  private expressionStatement() {
    const expr = this.expression();
    if (!expr) {
      this.logger.error("parse", "could not parse expression!");
    }
    this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
    return Stmt.Expression(expr);
  }

  private classDeclaration(): AnyStmt {
    const name: Token = this.consume(TokenType.IDENTIFIER, "Expect class name.");
    this.consume(TokenType.LEFT_BRACE, "Expect '{' before class body.");

    const methods: Stmt["Function"][] = [];
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      methods.push(this.function("method"));
    }

    this.consume(TokenType.RIGHT_BRACE, "Expect '}' after class body.");

    return Stmt.Class(name, methods);
  }

  private function(kind: string): Stmt["Function"] {
    const name = this.consume(TokenType.IDENTIFIER, `Expect ${kind} name.`);
    this.consume(TokenType.LEFT_PAREN, `Expect '(' after ${kind} name.`);
    const parameters: Token[] = [];

    /**
     * The outer if statement handles the zero parameter case, and the inner while
     * loop parses parameters as long as we find commas to separate them.
     * The result is the list of tokens for each parameter’s name.
     */
    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        if (parameters.length >= MAX_PARAMETER_COUNT) {
          this.error(this.peek(), `Can't have more than ${MAX_PARAMETER_COUNT} parameters.`);
        }

        parameters.push(this.consume(TokenType.IDENTIFIER, "Expect parameter name."));
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after parameters.");

    this.consume(TokenType.LEFT_BRACE, `Expect '{' before ${kind} body.`);
    const body = this.block();
    return Stmt.Function(name, parameters, body);
  }

  private varDeclaration(semicolons: boolean = true) {
    const name = this.consume(TokenType.IDENTIFIER, "Expect variable name");
    let initializer = null;
    if (this.match(TokenType.EQUAL)) {
      initializer = this.expression();
    }

    semicolons && this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");
    return Stmt.Let(name, initializer!);
  }

  private block() {
    let statements = [];

    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      statements.push(this.declaration());
    }

    this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");
    return statements;
  }

  private statement(): AnyStmt {
    if (this.match(TokenType.FOR)) return this.forStatement();
    if (this.match(TokenType.IF)) return this.ifStatement();
    if (this.match(TokenType.PRINT)) return this.printStatement();
    if (this.match(TokenType.RETURN)) return this.returnStatement();
    if (this.match(TokenType.WHILE)) return this.whileStatement();
    if (this.match(TokenType.LEFT_BRACE)) return Stmt.Block(this.block());

    return this.expressionStatement();
  }

  private declaration(): AnyStmt {
    try {
      if (this.match(TokenType.CLASS)) return this.classDeclaration();
      if (this.match(TokenType.FUNC)) return this.function("function");
      if (this.match(TokenType.LET)) return this.varDeclaration();

      return this.statement();
    } catch (_) {
      /**
       * Why synchronize here?
       *
       * This declaration() method is the method we call repeatedly
       * when parsing a series of statements in a block or a script,
       * so it’s the right place to synchronize when the parser goes
       * into panic mode. The whole body of this method is wrapped
       * in a try block to catch the exception thrown when the parser
       * begins error recovery. This gets it back to trying to parse
       * the beginning of the next statement or declaration.
       *
       * TLDR -> this basically tries to skip the problematic statement
       *         and try the next statement (skips till ";" then continues)
       */
      this.synchronize();
      // TODO: future: so instead of synchronize, we could add
      // a layer in front to try fix the syntax by passing
      // the offending statement to an LLM and asking for
      // suggestions. we then wait for user prompt to confirm
      // if that's what they meant. at this point, the user
      // is also allowed to fix the code themselves OR exit out
      // of the parsing phase
      // @ts-expect-error
      return null;
    }
  }

  /**
   * Parse Tree vs AST: https://chat.openai.com/share/f07650ce-da19-432a-945c-40875140b9b9
   * @returns a parse tree (NOT an AST)
   */
  parse(debug?: boolean): AnyStmt[] {
    try {
      const statements = [];
      while (!this.isAtEnd()) {
        statements.push(this.declaration());
      }

      if (debug) {
        statements.forEach((stmt) => {
          // console.log("\nCONSOLE parse tree (json):\n", JSON.stringify(stmt, null, 4));
          this.logger.debug?.(
            "parse",
            "parse tree (json):\n",
            ...JSON.stringify(stmt, null, 4).split("\n")
          );
        });
      }

      if (this.hadError()) {
        this._error.printErrors();
      }

      return statements;
    } catch (_) {
      // this.hadError handles the error later
      // @ts-expect-error
      return null;
    }
  }
}
