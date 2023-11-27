import { Token } from "./token";
import { LoggerType, TokenType } from "./types";

// Errors in lexer are SYNTAX errors
export class ScanError {
  hadError: boolean = false;
  errors: string[];
  logger: Console | LoggerType = console;

  constructor() {
    this.errors = [];
  }

  setLogger(newLogger: LoggerType) {
    this.logger = newLogger;
  }

  error(line: number, message: string, rawLine?: string, col?: number) {
    this.report(line, `at ${col}`, message, rawLine, col);
    this.hadError = true;
  }

  private report(line: number, where: string, message: string, rawLine?: string, col?: number) {
    const simpleErrorMessage = `[line ${line}] Error ${where}: ${message}${rawLine ? `RAW:${rawLine}` : ''}`; // prettier-ignore
    if (!rawLine || !col) {
      this.errors.push(simpleErrorMessage);
      return { error: true };
    }

    const multiline = rawLine.split("\n");

    // note that the empty row has a whitespace in order to maintain the empty row
    const fullErrorMessage = `
[line ${line}] Error ${where}: ${message}
 
${line} | ${multiline[line - 1]}
${pointToErrorAt(col, line, multiline)}
    `;
    this.errors.push(fullErrorMessage);
    return { error: true };
  }

  printErrors() {
    this.logger.error("scan", "SCAN ERROR: Errors found when lexing the file.");
    this.logger.error("scan", "----------------START------------------");
    this.errors.forEach((e) => {
      this.logger.error("scan", e);
    });
    this.logger.error("scan", "-----------------END-------------------");
  }
}

const pointToErrorAt = (col: number, line: number, lines: string[]) => {
  const toStart = (line: number) => {
    const spaces = (input: string) => Array.from(input).fill(" ").join("");
    return spaces(line.toString()) + spaces(" | ");
  };

  const skip = (col: number, line: number) => {
    // line is 1 indexed, not 0 indexed
    if (line === 1) return Array(col).join(" ");

    const linesCopy = [...lines];
    // pop until the number of lines is 1 less then line number
    while (linesCopy.length >= line) {
      linesCopy.pop();
    }

    const otherCharsBeforeErrorLine = linesCopy.join("").length;
    const newCol = col - otherCharsBeforeErrorLine;
    return Array(newCol).join(" ");
  };

  return toStart(line) + skip(col, line) + "^-- Here.";
};

// Errors in parser are STATIC errors
export class ParseError {
  hadError: boolean = false;
  errors: string[];
  logger: Console | LoggerType = console;

  constructor() {
    this.errors = [];
  }

  setLogger(newLogger: LoggerType) {
    this.logger = newLogger;
  }

  error(token: Token, message: string) {
    if (token.type === TokenType.EOF) {
      this.report(token.line, " at end of file", message);
    } else {
      this.report(token.line, ` at '${token.lexeme}'`, message);
    }
    this.hadError = true;
  }

  report(line: number, where: string, message: string) {
    const simpleErrorMessage = `[line ${line}] Error${where}: ${message}`; // prettier-ignore

    this.errors.push(simpleErrorMessage);
    return { error: true };
  }

  printErrors() {
    this.logger.error(
      "parse",
      "PARSE ERROR: Errors found when parsing scanned tokens from the file."
    );
    this.logger.error("parse", "----------------START------------------");
    this.errors.forEach((e) => {
      this.logger.error("parse", e);
    });
    this.logger.error("parse", "-----------------END-------------------");
  }
}

// Errors in interpreter are DYNAMIC errors
export class RuntimeError extends Error {
  readonly token?: Token;

  constructor(message: string, token?: Token) {
    super(`RUNTIME ERROR: ${message}`);
    this.token = token;
  }
}
