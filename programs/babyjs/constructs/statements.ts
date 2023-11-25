import { Token } from "../token";
import { AnyExpr } from "./expressions";

interface Expression {
  readonly type: "expression";
  readonly expression: AnyExpr;
}

const expression = (expression: AnyExpr): Expression => {
  return { type: "expression", expression };
};

interface While {
  readonly type: "while";
  readonly condition: AnyExpr;
  readonly body: AnyStmt;
}

const whileexpr = (condition: AnyExpr, body: AnyStmt): While => {
  return { type: "while", condition, body };
};

interface Function {
  readonly type: "function";
  readonly name: Token;
  readonly params: Token[];
  readonly body: AnyStmt[];
}

const functionStmt = (name: Token, params: Token[], body: AnyStmt[]): Function => {
  return { type: "function", name, params, body };
};

interface If {
  readonly type: "if";
  readonly condition: AnyExpr;
  readonly thenBranch: AnyStmt;
  readonly elseBranch?: AnyStmt;
}

const ifexpr = (condition: AnyExpr, thenBranch: AnyStmt, elseBranch?: AnyStmt): If => {
  return { type: "if", condition, thenBranch, elseBranch };
};

interface Print {
  readonly type: "print";
  readonly expression: AnyExpr;
}

const print = (expression: AnyExpr): Print => {
  return { type: "print", expression };
};

interface Let {
  readonly type: "let";
  readonly name: Token;
  readonly initializer: AnyExpr;
}

const letStmt = (name: Token, initializer: AnyExpr): Let => {
  return { type: "let", name, initializer };
};

interface Block {
  readonly type: "block";
  readonly statements: AnyStmt[];
}

const blockStmt = (statements: AnyStmt[]): Block => {
  return { type: "block", statements };
};

interface RangeFor {
  readonly type: "rangeFor";
  readonly initializerName: Token; // for (<here> in 0..5) { ... }
  readonly start: AnyExpr; // for (i in <here>..5) { ... }
  readonly end: AnyExpr; // for (i in 0..<here>) { ... }
  readonly inclusive: boolean;
  readonly body: AnyStmt;
}

const rangeFor = (
  initializerName: Token,
  start: AnyExpr,
  end: AnyExpr,
  inclusive: boolean,
  body: AnyStmt
): RangeFor => {
  return { type: "rangeFor", initializerName, start, end, inclusive, body };
};

export type AnyStmt = Expression | Function | If | Print | Let | Block | While | RangeFor;
export interface Stmt {
  Expression: Expression;
  While: While;
  Function: Function;
  If: If;
  Print: Print;
  Let: Let;
  Block: Block;
  RangeFor: RangeFor;
}
export const Stmt = {
  Expression: expression,
  While: whileexpr,
  Function: functionStmt,
  If: ifexpr,
  Print: print,
  Let: letStmt,
  Block: blockStmt,
  RangeFor: rangeFor,
};
