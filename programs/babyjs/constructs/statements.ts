import { Token } from "../token";
import { AnyExpr } from "./expressions";

interface Expression {
  readonly type: "expression";
  readonly expression: AnyExpr;
}

const expression = (expression: AnyExpr): Expression => {
  return { type: "expression", expression };
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

export type AnyStmt = Expression | If | Print | Let | Block;
export interface Stmt {
  Expression: Expression;
  If: If;
  Print: Print;
  Let: Let;
  Block: Block;
}
export const Stmt = {
  Expression: expression,
  If: ifexpr,
  Print: print,
  Let: letStmt,
  Block: blockStmt,
};
