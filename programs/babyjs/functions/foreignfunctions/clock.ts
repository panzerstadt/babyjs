import { Callable } from "../../callable";
import { Interpreter } from "../../stages/interpreters/interpreter";

export class Clock extends Callable {
  arity(): number {
    return 0;
  }
  call(interpreter: Interpreter, _arguments: Object[]) {
    return Date.now();
  }
  toString() {
    return "<native fn>";
  }
}
