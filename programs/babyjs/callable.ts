import { Interpreter } from "./interpreters/interpreter";

export class Callable {
  arity(): number {
    return 0;
  }
  call(interpreter: Interpreter, _arguments: Object[]): Object {
    return {};
  }
  toString() {
    return "<native function>";
  }
}
