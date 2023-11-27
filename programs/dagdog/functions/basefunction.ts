import { Callable } from "../callable";
import { Stmt } from "../constructs/statements";
import { Environment } from "../environment";
import { Interpreter } from "../interpreters/interpreter";
import { RETURN_EXCEPTION } from "../return";
import { _EMPTY_FN_RETURN } from "../token";

export class Function extends Callable {
  private readonly declaration: Stmt["Function"];
  private readonly closure: Environment;

  constructor(declaration: Stmt["Function"], closure: Environment) {
    super();
    this.closure = closure;
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
    const environment = new Environment(this.closure);
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
      // unwind call stack from nested function calls
      if (returnValue.name === RETURN_EXCEPTION) {
        return returnValue.value;
      } else {
        /**
         * turns out this is something that programming languages haven't really solved without
         * using throw.
         *
         * the equivalent of something that needs to properly return stack by stack is....
         * Callbacks! (js callbacks)
         * this is what happens when you need to pass the result from an
         * asynchronous process, because otherwise the machine has already
         * moved on and gone on to do other stuff
         *
         * TODO: learn how async/await is implemented
         * TODO: try supporting callback hell in my language! it might be easier than i might think.
         */
        throw returnValue;
      }
    }
    return _EMPTY_FN_RETURN;
  }

  toString() {
    return `<fn ${this.declaration.name.lexeme} (${this.declaration.params?.map(p => p?.lexeme)}) >`; // prettier-ignore
  }
}
