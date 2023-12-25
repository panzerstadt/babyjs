import { Callable } from "../../callable";
import { Interpreter } from "../../stages/interpreters/interpreter";

export class Async extends Callable {
  arity(): number {
    return 1;
  }
  // what gets passed in as _arguments is a BABYJS-land primitive OR function call (a Callable class)
  async call(interpreter: Interpreter, _arguments: Object[]) {
    return new Promise((ok, err) => {
      const initTime = Date.now();
      setTimeout(() => {
        const res = `result after: ${(Date.now() - initTime) / 1000}`; // <-- the fetched result
        ok(res); // doens't actualy do anything to babyjs

        // ----babyjsland start---------
        const firstArg = _arguments[0];
        if (interpreter._isCallable(firstArg)) {
          firstArg.call(interpreter, [res]);
        }
        // just for kicks, lets pollute the global
        interpreter.globals.define("awaited", `${res}: ${_arguments[0]}`);
        // ----babyjsland end---------
      }, 3000);
    });
  }
  toString() {
    return "<native async fn>";
  }
}
