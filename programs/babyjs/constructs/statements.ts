import { Token, _EMPTY_FN_RETURN } from "../token";
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

interface Class {
  readonly type: "class";
  readonly name: Token;
  readonly methods: Function[];
}

const classStmt = (name: Token, methods: Function[]): Class => {
  return { type: "class", name, methods };
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

interface Return {
  readonly type: "return";
  readonly keyword: Token;
  readonly value: AnyExpr | typeof _EMPTY_FN_RETURN;
}

const returnStmt = (keyword: Token, value: AnyExpr | typeof _EMPTY_FN_RETURN): Return => {
  return { type: "return", keyword, value };
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
  readonly initializerRef: Let; // for (<here> in 0..5) { ... }
  readonly start: AnyExpr; // for (i in <here>..5) { ... }
  readonly end: AnyExpr; // for (i in 0..<here>) { ... }
  readonly inclusive: boolean;
  readonly body: AnyStmt;
}

const rangeFor = (
  initializerRef: Let,
  start: AnyExpr,
  end: AnyExpr,
  inclusive: boolean,
  body: AnyStmt
): RangeFor => {
  return { type: "rangeFor", initializerRef, start, end, inclusive, body };
};

export type AnyStmt =
  | Expression
  | Function
  | Class
  | If
  | Print
  | Return
  | Let
  | Block
  | While
  | RangeFor;
export interface Stmt {
  Expression: Expression;
  While: While;
  Function: Function;
  Class: Class;
  If: If;
  Print: Print;
  Return: Return;
  Let: Let;
  Block: Block;
  RangeFor: RangeFor;
}
export const Stmt = {
  Expression: expression,
  While: whileexpr,
  Function: functionStmt,
  Class: classStmt,
  If: ifexpr,
  Print: print,
  Return: returnStmt,
  Let: letStmt,
  Block: blockStmt,
  RangeFor: rangeFor,
};
