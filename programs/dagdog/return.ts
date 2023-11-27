export const RETURN_EXCEPTION = "RETURN";

class ReturnException extends Error {
  name = RETURN_EXCEPTION;
  constructor() {
    super("Return Statement");
  }
}

export class Return extends ReturnException {
  readonly value: Object;

  constructor(value: Object) {
    super();
    this.value = value;
  }
}
