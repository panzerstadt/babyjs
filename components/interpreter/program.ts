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

  private timestamp() {
    return Date.now();
  }

  output(): LoggerType {
    return {
      log: (...strs: string[]) => {
        this.stdout += strs
          .flat(5)
          .map((s) => `${this.timestamp()}:${s}\n`)
          .join("");
      },
      error: (str: string) => {
        const strs = str.split("\n");
        this.stderr += strs.map((s) => `${this.timestamp()}:${s}\n`).join("");
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
    if (code === "help") {
      this.stdout = `${this.timestamp()}:${this.help()}`;
      return;
    }

    this.clearStd();
    return this.interpreter.run(code, this.verbose, true);
  }

  help(): string {
    return `
    hey there welcome to my toy programming language! you might notice that it looks
    really similar to javascript.

    here are some things you can do with it right now.

    let one = 1;
    let two = one + 2;
    print two;

    print (2/5.5+2)-2.5;

    here are the other options that have been implemented so far:

    help :  this message.
    vvvv :  switches on verbose mode. explore the innards of how a program
            gets understood by the interpreter!
    `;
  }
}
