import { TokenType } from "./types";

/**
 * Tokens are used to represent lexemes, the 'things' that a lexer outputs
 * Tokens vs Lexemes: https://chat.openai.com/share/74296ca9-de59-45c4-9893-a28764619350
 *
 * Lexeme:
 * base form of a language's unit of meaning
 * (e.g. 'run' is a lexeme of 'running')
 * (e.g. '2' represents a unit of 'numbers')
 *
 * Token:
 * the runtime container used to represent lexemes
 */
export class Token {
  type: TokenType;
  lexeme: string;
  literal: Object;
  line: number;

  constructor(type: TokenType, lexeme: string, literal: Object, line: number) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  toString() {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}

export const keywords = {
  if: TokenType.IF,
  else: TokenType.ELSE,
  print: TokenType.PRINT,
  let: TokenType.LET,

  false: TokenType.FALSE,
  true: TokenType.TRUE,
  and: TokenType.AND,
  or: TokenType.OR,
  while: TokenType.WHILE,
  for: TokenType.FOR,
} as const;

export const accidentalKeywords = {
  null: "You're trying to use a Javascript 'null'. in BabyJS the concept of 'null' has been banned. try setting a sensible default value instead.",
} as const;

export const _UNINITIALIZED = Symbol("uninitialized"); // sentinel value

export type Keywords = Partial<keyof typeof keywords | keyof typeof accidentalKeywords>;
