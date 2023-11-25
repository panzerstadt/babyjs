import { canDeclareWithValue, isValidUserValue, isValueUninitialized } from "./constants";
import { RuntimeError } from "./errors";
import { Token, _UNINITIALIZED } from "./token";
import { LoggerType } from "./types";

/**
 * NOTE: there should not be 'null' / 'nil' values in the language
 */
export class Environment {
  private strict = true;
  private debug = false;
  private identifier: string | null = null;
  logger: LoggerType = console;

  private readonly values: Map<string, Object | typeof _UNINITIALIZED> = new Map();
  readonly enclosing: Environment | null;

  public debugPrintEnvironment(op: string) {
    let store = { id: this.identifier };
    this.values.forEach((v, k) => {
      store = { ...store, [k]: v };
    });
    this.logger.environment?.(
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

  /**
   * user can only
   * - declare variable without assignment
   * - declare variable with assignment of valid value
   */
  define(name: string, value: Object | typeof _UNINITIALIZED, token?: Token) {
    const hasBeenDeclared = this.values.has(name);

    if (this.strict && hasBeenDeclared) {
      throw new RuntimeError(`Variable has already been defined.`, token);
    }

    if (!this.strict && hasBeenDeclared) {
      const prevValue = this.values.get(name);
      this.logger.info?.(
        `
hey you've already set variable "${name}" before to "${String(prevValue)}". 
I will be redefining it as "${String(value)}", just so you know.
to keep yourself sane, maybe next time reassign it instead (without using the "let" keyword), 
e.g: let my_variable = "one"; ---> my_variable = "two";
        `
      );
    }

    // variable declaration without assignment (e.g. let foo;)
    // only visitLetStmt can do this
    if (value === _UNINITIALIZED) {
      this.values.set(name, _UNINITIALIZED);
      this.debug && this.debugPrintEnvironment(this.assign.name);
      return;
    }

    // variable declaration with user value (e.g. let foo = 1;)
    if (canDeclareWithValue(value)) {
      this.values.set(name, value);
      this.debug && this.debugPrintEnvironment(this.assign.name);
      return;
    }

    throw new RuntimeError(
      `Variable '${name}' cannot be declared with '${value}'. '${value}' is not an assignable value.`
    );
  }

  /**
   * there are two modes of assignment: init and reassign
   */
  assign(name: Token, value: Object): void {
    // 1. initializes the variable
    if (isValueUninitialized(this.values.get(name.lexeme))) {
      this.values.set(name.lexeme, value);
      return;
    }

    // 2. reassigns the variable
    const prevValue = this.values.get(name.lexeme);
    // if user is sending a valid value, and there was a previous value
    if (isValidUserValue(value) && isValidUserValue(prevValue)) {
      if (this.strict) {
        // TODO: check if mut (also introduce explicit mut, like rust)
        // this.logger.info?.(
        //   `reassigning value "${name.lexeme}" to "${value}". TODO: restrict this, or make mutable variables obvious like rust's 'mut'`
        // );
      }
      this.values.set(name.lexeme, value);
      this.debug && this.debugPrintEnvironment(this.assign.name);
      return;
    }

    // 3. or this assignment is meant for a variable in parent scope
    if (this.enclosing !== null) return this.enclosing.assign(name, value);

    throw new RuntimeError(`Undefined variable '${name.lexeme}`, name);
  }

  get(name: Token): Object {
    if (this.values.has(name.lexeme)) {
      this.debug && this.debugPrintEnvironment(this.get.name);
      const value = this.values.get(name.lexeme)!;

      // if this value has not been initialized by the user, throw
      if (isValueUninitialized(value)) {
        throw new RuntimeError(`Variable '${name.lexeme}' used before assignment`, name);
      }
      return value;
    }

    if (this.enclosing !== null) return this.enclosing.get(name);

    throw new RuntimeError(`Undefined variable '${name.lexeme}'.`, name);
  }
}
