export const assertNever = (_variable: never): void => {};

export enum TokenType {
  // Single-character tokens.
  LEFT_BRACE = "LEFT_BRACE", // node block
  RIGHT_BRACE = "RIGHT_BRACE", // node block
  COMMA = "COMMA",
  DOT = "DOT",

  COLON = "COLON", // ternary (for now)
  SEMICOLON = "SEMICOLON", // EOL
  SLASH = "SLASH", // slash is special in zephyr's dts: https://docs.zephyrproject.org/latest/build/dts/intro-syntax-structure.html

  // One or two character tokens.
  EQUAL = "EQUAL",
  GREATER = "GREATER", // >
  LESS = "LESS", // <

  // Literals.
  IDENTIFIER = "IDENTIFIER",
  STRING = "STRING",
  NUMBER = "NUMBER",

  // dts editable values
  // KEYMAP_ENTRIES = "KEYMAP_ENTRIES",
  // Keywords.
  // IMPORT = "IMPORT",
  // KEYMAP = "KEYMAP",
  // DEFAULT_LAYER = "default_layer",
  // BINDINGS = "bindings",
  // SENSOR_BINDINGS = "sensor_bindings",
  // COMPATIBLE = "compatible",

  LEFT_PAREN = "LEFT_PAREN",
  RIGHT_PAREN = "RIGHT_PAREN",
  MINUS = "MINUS",
  STAR = "STAR",
  PLUS = "PLUS",
  BANG_EQUAL = "BANG_EQUAL",
  EQUAL_EQUAL = "EQUAL_EQUAL",
  BANG = "BANG",
  QUESTION = "QUESTION",
  GREATER_EQUAL = "GREATER_EQUAL",
  LESS_EQUAL = "LESS_EQUAL",
  FALSE = "FALSE",
  TRUE = "TRUE",
  CLASS = "CLASS",
  FUNC = "FUNC",
  LET = "LET", // because i'm offended by var
  QUESTION_QUESTION = "QUESTION_QUESTION", // ??, similar to ts

  FOR = "FOR",
  IF = "IF",
  ELSE = "ELSE",
  WHILE = "WHILE",
  PRINT = "PRINT",
  RETURN = "RETURN",

  AND = "AND",
  OR = "OR",
  // SUPER,
  // THIS,

  EOF = "EOF",

  // rust for loops
  IN = "IN",
  DOT_DOT = "DOT_DOT",
}

export interface LoggerType {
  log: Function;
  warn?: Function;
  info?: Function;
  error: (phase: Phase, str: string) => void;
  debug?: (phase: Phase, ...strs: string[]) => void;
  environment?: (...strs: string[]) => void;
  visit?: (str: string) => void;
}

export type Phase = "scan" | "parse" | "resolve-variable" | "interpret";
