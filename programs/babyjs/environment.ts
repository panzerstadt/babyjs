import { RuntimeError } from "./errors";
import { Token } from "./token";
import { LoggerType } from "./types";

export class Environment {
  logger: Console | LoggerType = console;
  private readonly values: Map<string, Object | null> = new Map();
  private strict = true;

  setLogger(newLogger: LoggerType) {
    this.logger = newLogger;
  }

  setStrictness(strict: boolean) {
    this.strict = strict;
  }

  define(name: string, value: Object | null, token: Token) {
    const prevValue = this.values.get(name);
    if (!!prevValue) {
      if (this.strict) {
        throw new RuntimeError(token, `Variable has already been defined.`);
      }
      this.logger.info?.(
        `
hey you've already set variable "${name}" before to "${prevValue}". 
I will be redefining it as "${value}", just so you know.
to keep yourself sane, maybe next time reassign it instead (without using the "let" keyword), 
e.g: let my_variable = "one"; ---> my_variable = "two";
        `
      );
    }

    this.values.set(name, value);
  }

  get(name: Token): Object {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme)!;
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  }
}
