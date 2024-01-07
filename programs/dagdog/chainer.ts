import { AnyStmt } from "./constructs/statements";
import { Parser } from "./parser";
import { Scanner } from "./scanner";
import { LoggerType } from "./types";

type FunctionID = string;
type Args = { [key in FunctionID]: unknown[] };
type Returns = unknown[];

/**
 * the role of the chainer is to take the loop over each code block
 *
 * it first checks if the code block is at the end
 *      if yes, return the total result as a json representation of function calls
 * if not
 *      it follows the 'arrow' to the next function (or functions)
 *      it created a block scope for the function
 *      it defines the previous function's return output
 *          (whether an actual value or a EMPTY_FN_RETURN)
 *          as the 'args' variable (special variable)
 *      it parses the code to EOF
 *          by running scanner and parser
 *      it starts from the beginning again (probably use a loop instead of a recursive call)
 *
 * returns json tree for the interpreter to call
 */

// json tree
// it should be a flat list of functions, that may or may not depend on the previous function
// this way the interpreter can decide to run all the functions that are non-dependent
// while blocking until the results arrive before calling dependent functions
type ChainedProgram = {
  [key in FunctionID]: FunctionBlock;
};

interface FunctionBlock {
  // many to many
  previous: FunctionID[];
  next: FunctionID[];

  inputs: Args;
  statements: AnyStmt[]; // output from Parser
  output: Returns;
}

export class Chainer {
  private scanner: Scanner;
  private parser: Parser;

  logger: LoggerType = console;

  setLogger(newLogger: LoggerType) {
    this.logger = newLogger;
  }

  constructor(scanner: Scanner, parser: Parser) {
    this.scanner = scanner;
    this.parser = parser;
  }

  buildSingleBlock(code: string, inputs: Args, debug?: boolean): FunctionBlock["statements"] {
    // TODO: wrap it in a block, and define an arg?
    // WOW i can do a hacky version where i just add a {} to the code
    // how to i pass args tho

    // 1. scan text, turn them into tokens that the language recognizes
    //    token = lexeme + metadata
    const scanner = new Scanner(code);
    scanner.setLogger(this.logger);
    const tokens = scanner.scanTokens(debug);

    if (scanner.hadError()) {
      // TODO:
    }

    // 2. parse text into expressions, in the form of an AST
    const parser = new Parser(tokens);
    parser.setLogger(this.logger);
    const statements = parser.parse(debug);

    if (parser.hadError()) {
      // TODO:
    }

    return statements;
  }

  // build chained program
  // @ts-ignore
  build(code: string, debug: boolean = false): ChainedProgram {
    /**
     * the role of the chainer is to take the loop over each code block
     *
     * it first checks if the code block is at the end
     *      if yes, return the total result as a json representation of function calls
     * if not
     *      it follows the 'arrow' to the next function (or functions)
     *      it created a block scope for the function
     *      it defines the previous function's return output
     *          (whether an actual value or a EMPTY_FN_RETURN)
     *          as the 'args' variable (special variable)
     *      it parses the code to EOF
     *          by running scanner and parser
     *      it starts from the beginning again (probably use a loop instead of a recursive call)
     *
     * returns json tree for the interpreter to call
     */
  }
}
