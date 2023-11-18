import { RuntimeError } from "./errors";
import { NULL_LITERAL, Token } from "./token";
import { LoggerType } from "./types";

export class Environment {
  private strict = true;
  private debug = false;
  private identifier: string | null = null;
  logger: Console | LoggerType = console;

  private readonly values: Map<string, Object | null> = new Map();
  readonly enclosing: Environment | null;

  public printEnvironment(op: string) {
    let store = { id: this.identifier };
    this.values.forEach((v, k) => {
      store = { ...store, [k]: v };
    });
    this.logger.log(
      `env:${op} on ${this.identifier}: size ${this.values.size}`,
      ...JSON.stringify(store, null, 4).split("\n")
    );
  }

  constructor(enclosing?: Environment) {
    this.enclosing = enclosing || null;
    this.identifier = `scope-${(Math.random() * 100000).toFixed(0)}(${
      this.enclosing?.identifier ?? ""
    })`;
  }

  setDebug(debug?: boolean) {
    this.debug = debug ?? false;
  }

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
        throw new RuntimeError(`Variable has already been defined.`, token);
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
    this.debug && this.printEnvironment(this.assign.name);
  }

  assign(name: Token, value: Object): void {
    const prevValue = this.values.get(name.lexeme);
    if (!!prevValue) {
      if (this.strict) {
        // TODO: check if mut (also introduce explicit mut, like rust)
        this.logger.info?.(
          `reassigning value "${name.lexeme}" to "${value}". TODO: restrict this, or make mutatable variables obvious like rust's 'mut'`
        );
      }
      this.values.set(name.lexeme, value);
      this.debug && this.printEnvironment(this.assign.name);
      return;
    }

    if (this.enclosing !== null) return this.enclosing.assign(name, value);

    throw new RuntimeError(`Undefined variable '${name.lexeme}`, name);
  }

  get(name: Token): Object {
    if (this.values.has(name.lexeme)) {
      this.debug && this.printEnvironment(this.get.name);
      const value = this.values.get(name.lexeme)!;
      if (!value || value === NULL_LITERAL) {
        throw new RuntimeError(`Unassigned variable '${name.lexeme}' value?:${value}`, name);
      }
      return value;
    }

    if (this.enclosing !== null) return this.enclosing.get(name);

    throw new RuntimeError(`Undefined variable '${name.lexeme}'.`, name);
  }
}
