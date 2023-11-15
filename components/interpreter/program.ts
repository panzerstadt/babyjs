import { BabyJs } from "../../programs/babyjs/babyjs";
import { LoggerType } from "../../programs/babyjs/types";

export class Program {
  verbose = false;
  interpreter: BabyJs;
  stdout = "";
  stderr = "";
  stdinfo = "";

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
      info: (...strs: string[]) => {
        this.stdinfo += strs
          .flat(5)
          .map((s) => `${this.timestamp()}:${s}\n`)
          .join("");
      },
    };
  }

  clearStd() {
    this.stdout = "";
    this.stderr = "";
    this.stdinfo = "";
  }

  input(code: string) {
    if (code === "vvvv") {
      this.verbose = !this.verbose;
      this.stdout = this.verbose ? "i'll more verbose." : "i'll be less verbose.";
      return;
    }
    if (code === "help") {
      this.stdout = `${this.help()}`;
      return;
    }

    this.clearStd();
    return this.interpreter.run(code, this.verbose, true);
  }

  help(): string {
    return `
hey there welcome to my toy programming language! you might notice that it looks really similar to javascript.

here are some things you can do with it right now.

let one = 1;
let two = one + 2;
{ // blocks
  two = 42;
  print two;
}
print two;

print (2/5.5+2)-2.5;

// ternaries
let three = two == 3 ? "yes" : "no";

// control flow
if (three == "yes") print "wow";

if (1 > 2) print "nein"; else print "math checks out";

if (true) {
  print "js brackets are a go"
}

here are some cli commands that have been implemented so far:

help  :  this message.
clear :  clears the terminal.
vvvv  :  toggles verbose mode. explore the innards of how a program
         gets understood by the interpreter!
    `

      .split("\n")
      .map((s) => `${this.timestamp()}:${s}\n`)
      .join("");
  }
}
