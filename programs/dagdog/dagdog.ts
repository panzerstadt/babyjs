import { RuntimeError } from "./errors";
import { Interpreter } from "./interpreters/interpreter";
import { Parser } from "./parser";
import { Scanner } from "./scanner";
import { LoggerType, Phase } from "./types";
// import prompt from "prompt-sync";
const newPrompt = (prefix: string) => ""; // prompt()

export class DagDog {
  hadError = false;
  hadRuntimeError = false;
  logger: LoggerType = console;

  readonly interpreter = new Interpreter();

  setLogger(newLogger: LoggerType) {
    this.logger = newLogger;
    this.interpreter.setLogger(newLogger);
  }

  runtimeError(error: RuntimeError) {
    const token = error.token?.lexeme;
    const line = error.token?.line || "unknown";
    this.logger.error("interpret",`[line ${line}] ${token ? `token ${error.token?.lexeme}`: ""}: ${error.message}`); // prettier-ignore
    this.hadRuntimeError = true;
  }

  _getPhase(str: string): Phase {
    switch (str) {
      case "Scanning":
        return "scan";
      case "Parsing":
        return "parse";
      case "Interpreting":
        return "interpret";
      default:
        throw new Error("unknown phase");
    }
  }

  debugPprintStep(phase: string) {
    this.logger.debug?.(this._getPhase(phase), "-----------------");
    this.logger.debug?.(this._getPhase(phase), phase + "...");
    this.logger.debug?.(this._getPhase(phase), "-----------------");
  }

  runOnce(code: string | null, debug: boolean = false) {
    this.repl(code, debug, true);
  }
  /**
   * when the interpreter stores global variables.
   * Those variables should persist throughout the REPL session.
   */
  repl(code: string | null = null, debug: boolean = false, once: boolean = false) {
    if (!code) return this.nextLoop(debug, once);

    // 1. scan text, turn them into tokens that the language recognizes
    //    token = lexeme + metadata
    debug && this.debugPprintStep("Scanning");
    const scanner = new Scanner(code);
    scanner.setLogger(this.logger);
    const tokens = scanner.scanTokens(debug);

    if (scanner.hadError()) return this.nextLoop(debug, once);

    // 2. parse text into expressions, in the form of an AST
    debug && this.debugPprintStep("Parsing");
    const parser = new Parser(tokens);
    parser.setLogger(this.logger);
    const statements = parser.parse(debug);

    if (parser.hadError()) return this.nextLoop(debug, once);

    // 3. interpret expression and show result
    //       interpreter can't be new every time because
    //       we want it to have memory across repls
    debug && this.debugPprintStep("Interpreting");
    const error = this.interpreter.interpret(statements, debug);
    if (error) {
      // console.error(error);
      this.runtimeError(error);
    }

    this.nextLoop(debug, once);
  }

  nextLoop(debug: boolean, once: boolean) {
    if (once) return;

    const nextCode = newPrompt(">");

    if (!nextCode) {
      this.logger.log("exiting...");
      return;
    }

    this.repl(nextCode, debug);
  }

  runFile(filepath: string) {
    // const code =
    // this.run(code)

    if (this.hadError) process.exit(65);
    if (this.hadRuntimeError) process.exit(70);
  }
}
