import { RuntimeError } from "./errors";
import { Interpreter } from "./interpreters/interpreter";
import { Parser } from "./parser";
import { Scanner } from "./scan";
import { LoggerType } from "./types";
// import prompt from "prompt-sync";
const newPrompt = (prefix: string) => ""; // prompt()

export class BabyJs {
  hadError = false;
  hadRuntimeError = false;
  logger: Console | LoggerType = console;

  readonly interpreter = new Interpreter();

  setLogger(newLogger: LoggerType) {
    this.logger = newLogger;
    this.interpreter.setLogger(newLogger);
  }

  runtimeError(error: RuntimeError) {
    this.logger.error(`[line ${error.token.line}] token '${error.token.lexeme}': ${error.message}`);
    this.hadRuntimeError = true;
  }

  pprintStep(phase: string) {
    this.logger.log("-----------------");
    this.logger.log(phase + "...");
    this.logger.log("-----------------");
  }

  /**
   * when the interpreter stores global variables.
   * Those variables should persist throughout the REPL session.
   */
  run(code: string | null = null, debug: boolean = false, once: boolean = false) {
    if (!code) return this.nextLoop(debug, once);

    // 1. scan text, turn them into tokens that the language recognizes
    //    token = lexeme + metadata
    debug && this.pprintStep("Scanning");
    const scanner = new Scanner(code);
    scanner.setLogger(this.logger);
    const tokens = scanner.scanTokens(debug);

    if (scanner.hadError()) return this.nextLoop(debug, once);

    // 2. parse text into expressions, in the form of an AST
    debug && this.pprintStep("Parsing");
    const parser = new Parser(tokens);
    parser.setLogger(this.logger);
    const statements = parser.parse(debug);

    if (parser.hadError()) return this.nextLoop(debug, once);

    // 3. interpret expression and show result
    //       interpreter can't be new every time because
    //       we want it to have memory across repls
    debug && this.pprintStep("Interpreting");
    const error = this.interpreter.interpret(statements, debug);
    if (error) {
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

    this.run(nextCode, debug);
  }

  runFile(filepath: string) {
    // const code =
    // this.run(code)

    if (this.hadError) process.exit(65);
    if (this.hadRuntimeError) process.exit(70);
  }
}
