import { Callable } from "../callable";
import { Stmt } from "../constructs/statements";
import { Environment } from "../environment";
import { Interpreter } from "../interpreters/interpreter";
import { RETURN_EXCEPTION } from "../return";
import { _EMPTY_FN_RETURN } from "../token";

export class Function extends Callable {
  private readonly declaration: Stmt["Function"];
  constructor(declaration: Stmt["Function"]) {
    super();
    this.declaration = declaration;
  }

  arity(): number {
    return this.declaration.params.length;
  }

  /**
   * since we don't have a null, what should we return for functions
   * that just execute side effects?
   * something that throws when accessed should be called.
   * meaning _unitialized
   */
  call(interpreter: Interpreter, _arguments: Object[]): Object {
    const environment = new Environment(interpreter.globals);
    // FIXME: unpack this concept properly in my head
    /**
     * fun count(n) {
     *   if (n > 1) count(n - 1);
     *   print n;
     * }
     *
     * count(3);
     *
     * That’s why we create a new environment at each call,
     * not at the function declaration. The call() method we
     * saw earlier does that. At the beginning of the call, it
     * creates a new environment. Then it walks the parameter
     * and argument lists in lockstep. For each pair, it creates
     * a new variable with the parameter’s name and
     * binds it to the argument’s value.
     *
     * book: https://craftinginterpreters.com/functions.html#function-objects
     */
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, _arguments[i]);
    }
    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (returnValue: any) {
      if (returnValue.name === RETURN_EXCEPTION) {
        return returnValue.value;
      } else {
        throw returnValue;
      }
    }
    return _EMPTY_FN_RETURN;
  }

  toString() {
    return `<fn ${this.declaration.name.lexeme} (${this.declaration.params?.map(p => p?.lexeme)}) >`; // prettier-ignore
  }
}
