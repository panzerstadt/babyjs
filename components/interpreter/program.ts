import { BabyJs } from "../../programs/babyjs/babyjs";
import { LoggerType } from "../../programs/babyjs/types";

export class Program {
  verbose = false;
  interpreter: BabyJs;
  stdout = "";
  stderr = "";

  constructor() {
    this.interpreter = new BabyJs();
    this.interpreter.setLogger(this.output());
  }

  output(): LoggerType {
    return {
      log: (...strs: string[]) => {
        this.stdout += strs
          .flat(5)
          .map((s) => s + "\n")
          .join("");
      },
      error: (str: string) => {
        console.log("erroring", str);
        this.stderr += str + "\n";
      },
    };
  }

  clearStd() {
    this.stdout = "";
    this.stderr = "";
  }

  input(code: string) {
    if (code === "vvvv") {
      this.verbose = !this.verbose;
      this.stdout = this.verbose ? "i'll more verbose." : "i'll be less verbose.";
      return;
    }

    this.clearStd();
    return this.interpreter.run(code, this.verbose, true);
  }
}
