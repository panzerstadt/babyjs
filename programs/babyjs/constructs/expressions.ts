import { Token } from "../token";

interface Ternary {
  readonly type: "ternary";
  readonly left: AnyExpr;
  readonly leftOp: Token;
  readonly center: AnyExpr;
  readonly rightOp: Token;
  readonly right: AnyExpr;
}

const ternary = (
  left: AnyExpr,
  leftOp: Token,
  center: AnyExpr,
  rightOp: Token,
  right: AnyExpr
): Ternary => {
  return {
    type: "ternary",
    left,
    leftOp,
    center,
    rightOp,
    right,
  };
};

interface Binary {
  readonly type: "binary";
  readonly left: AnyExpr;
  readonly operator: Token;
  readonly right: AnyExpr;
  // accept?: (visitor) => void;
}

const binary = (left: AnyExpr, operator: Token, right: AnyExpr): Binary => {
  return {
    type: "binary",
    left,
    operator,
    right,
    // accepts a plugin from outside, that can execute using this object's data
    // accept: (plugin) => plugin.execute(binaryObject),
    // accept: (visitor) => visitor.visitBinaryExpr(binaryObject),
  };
};

interface Grouping {
  readonly type: "grouping";
  readonly expression: AnyExpr;
}

const grouping = (expression: AnyExpr): Grouping => {
  return { type: "grouping", expression };
};

interface Literal {
  readonly type: "literal";
  readonly value: Object;
}

const literal = (value: Object): Literal => {
  return { type: "literal", value };
};

interface Unary {
  readonly type: "unary";
  readonly operator: Token;
  readonly right: AnyExpr;
}

const unary = (operator: Token, right: AnyExpr): Unary => {
  return { type: "unary", operator, right };
};

interface Assign {
  readonly type: "assign";
  readonly name: Token;
  readonly value: AnyExpr;
}

/**
 * assign is like a unary, one op plus one value
 */
const assign = (name: Token, value: AnyExpr): Assign => {
  return { type: "assign", name, value };
};

interface Variable {
  readonly type: "variable";
  readonly name: Token;
}

const variable = (name: Token): Variable => {
  return { type: "variable", name };
};

export type AnyExpr = Ternary | Binary | Grouping | Literal | Unary | Variable | Assign;
export interface Expr {
  Ternary: Ternary;
  Binary: Binary;
  Grouping: Grouping;
  Literal: Literal;
  Unary: Unary;
  Variable: Variable;
  Assign: Assign;
}
export const Expr = {
  Ternary: ternary,
  Binary: binary,
  Grouping: grouping,
  Literal: literal,
  Unary: unary,
  Variable: variable,
  Assign: assign,
};
