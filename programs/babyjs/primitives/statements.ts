import { Token } from "../token";
import { AnyExpr } from "./expressions";

interface Expression {
  readonly type: "expression";
  readonly expression: AnyExpr;
}

const expression = (expression: AnyExpr): Expression => {
  return { type: "expression", expression };
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

export type AnyStmt = Expression | Print | Let | Block;
export interface Stmt {
  Expression: Expression;
  Print: Print;
  Let: Let;
  Block: Block;
}
export const Stmt = {
  Expression: expression,
  Print: print,
  Let: letStmt,
  Block: blockStmt,
};
