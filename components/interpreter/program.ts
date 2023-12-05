import { DagDog } from "@/programs/dagdog/dagdog";
import { BabyJs } from "../../programs/babyjs/babyjs";
import { LoggerType, Phase } from "../../programs/babyjs/types";

type Interpreter = BabyJs | DagDog;
const interpreters = {
  babyjs: BabyJs,
  dagdog: DagDog,
};
export type Language = keyof typeof interpreters;

export type StdEnvs = "out" | "err" | "info" | "debug" | "env";

export class Program {
  verbose = false;
  interpreter: Interpreter;
  stdout = "";
  stderr = "";
  stdinfo = "";
  stddebug = "";
  stdenv = "";

  urlredirect = "";

  constructor(lang: Language = "babyjs") {
    const Intr = interpreters[lang];
    this.interpreter = new Intr();
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
      visit: (url: string) => {
        this.urlredirect = `${this.timestamp()}:${url}`;
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

    this.clearStd();
    return this.interpreter.repl(code, this.verbose, true);
  }
}
