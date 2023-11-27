import { Callable } from "../../callable";
import { Interpreter } from "../../interpreters/interpreter";

export class Async extends Callable {
  arity(): number {
    return 1;
  }
  async call(interpreter: Interpreter, _arguments: Object[]) {
    return new Promise((ok, err) => {
      const initTime = Date.now();
      setTimeout(() => {
        const res = `result after: ${(Date.now() - initTime) / 1000}`;
        ok(res);
        interpreter.globals.define("awaited", `${res}: ${_arguments[0]}`);
      }, 3000);
    });
  }
  toString() {
    return "<native async fn>";
  }
}
