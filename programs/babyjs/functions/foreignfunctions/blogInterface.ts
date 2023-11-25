import { Callable } from "../../callable";
import { Interpreter } from "../../interpreters/interpreter";

import data from "../../../blog/data.json";

export class Ls extends Callable {
  arity(): number {
    return 0;
  }
  call(interpreter: Interpreter, _arguments: Object[]): Object {
    return data.blogposts;
  }
}
