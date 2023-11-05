import { RuntimeError } from "./errors";
import { Token } from "./token";

export class Environment {
  private readonly values: Map<string, Object | null> = new Map();

  define(name: string, value: Object | null) {
    const prevValue = this.values.get(name);
    if (!!prevValue) {
      console.log(
        `
hey you've already set variable ${name} before to "${prevValue}". 
I will be redefining it as "${value}", just so you know.
to keep yourself sane, maybe next time reassign it instead (without using the 'let' keyword), 
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
