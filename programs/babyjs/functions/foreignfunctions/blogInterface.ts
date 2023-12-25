import { Callable } from "../../callable";
import { Interpreter } from "../../stages/interpreters/interpreter";

import data from "../../../blog/data.json";
import { RuntimeError } from "../../errors";

export class Ls extends Callable {
  arity(): number {
    return 0;
  }
  call(interpreter: Interpreter, _arguments: Object[]): Object {
    return data.blogposts;
  }
}

export class Visit extends Callable {
  arity(): number {
    return 1;
  }
  call(interpreter: Interpreter, _arguments: Object[]): Object {
    const path = _arguments[0];
    if (!path || typeof path !== "string") {
      throw new RuntimeError(`Please enter a blogpost path to visit.`);
    }

    interpreter.logger.visit?.(path);
    return {};
  }
}
