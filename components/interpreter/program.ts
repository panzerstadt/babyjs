import { BabyJs } from "../../programs/babyjs/babyjs";
import { LoggerType, Phase } from "../../programs/babyjs/types";

export type StdEnvs = "out" | "err" | "info" | "debug" | "env";

export class Program {
  verbose = false;
  interpreter: BabyJs;
  stdout = "";
  stderr = "";
  stdinfo = "";
  stddebug = "";
  stdenv = "";

  constructor() {
    this.interpreter = new BabyJs();
    this.interpreter.setLogger(this.output());
  }

  private timestamp() {
    return Date.now();
  }

  private to_stdout(str: string) {
    this.stdout += str
      .split("\n")
      .map((s) => `${this.timestamp()}:${s}\n`)
      .join("");
  }

  output(): LoggerType {
    return {
      log: (...strs: string[]) => {
        this.stdout += strs
          .map((s) => s.toString())
          .map((s) => s.split("\n"))
          .flat(5)
          .map((s) => `${this.timestamp()}:${s}\n`)
          .join("");
      },
      error: (phase: Phase, str: string) => {
        const strs = str.split("\n");
        this.stderr += strs.map((s) => `${this.timestamp()}:${phase}:${s}\n`).join("");
      },
      info: (...strs: string[]) => {
        this.stdinfo += strs
          .flat(5)
          .map((s) => `${this.timestamp()}:${s}\n`)
          .join("");
      },
      environment: (...strs: string[]) => {
        this.stddebug += strs
          .flat(5)
          .map((s) => `${this.timestamp()}:${s}\n`)
          .join("");
      },
      debug: (phase: Phase, ...strs: string[]) => {
        this.stddebug += strs
          .flat(5)
          .map((s) => `${this.timestamp()}:${phase}:${s}\n`)
          .join("");
      },
    };
  }

  clearStd() {
    this.stdout = "";
    this.stderr = "";
    this.stdinfo = "";
    this.stddebug = "";
    this.stdenv = "";
  }

  input(code: string) {
    if (code === "vvvv") {
      this.verbose = !this.verbose;
      this.to_stdout(this.verbose ? "i'll more verbose." : "i'll be less verbose.");
      return;
    }
    if (code === "help") {
      this.to_stdout(this.help());
      return;
    }

    this.clearStd();
    return this.interpreter.run(code, this.verbose, true);
  }

  help(): string {
    return `
hey there welcome to my toy programming language! you might notice that it looks really similar to javascript.

here are some things you can do with it right now.

-----------------

let one = 1; // variable declaration
let two = one + 2;
{ // blocks
  two = 42; // variable assignment
  print two;
}
print two;

print (2/5.5+2)-2.5; // arithmetic

// logical operators
print 1 > 2 or "result";
print 1 > 2 || "result";
print 1 > 2 and "skipped";
print 1 > 2 && "skipped";

// ternaries
let three = two == 3 ? "yes" : "no";

// control flow
if (three == "yes") print "wow";

if (1 > 2) print "nein"; else print "math checks out";

if (true) {
  print "js brackets are a go";
} else if {
  print "all the ifs";
}

let also = true;
if (also)
  print "but they're syntactic sugar";
  if (1 + 1 == 2)
    print "and you don't really need them";
  else if (2 + 2 == 4)
    print "but it might feel a bit weird";
  else
    print "but to each their own";
else
  print "also, the above white space doesn't matter";

// fibonacci
let a = 0;
let temp;

for (let b = 1; a < 10000; b = temp + b) {
  print a;
  temp = a;
  a = b;
}


// come back from time to time to see this list grow!
-----------------

here are some cli commands that have been implemented so far:

help  :  this message.
clear :  clears the terminal.
vvvv  :  toggles verbose mode. explore the innards of how a program
         gets understood by the interpreter!
    `;
  }
}
