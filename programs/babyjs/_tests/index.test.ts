import { time } from "console";
import { BabyJs } from "../babyjs";

describe("babyjs", () => {
  let babyjs: BabyJs;
  const logger = {
    log: jest.fn((...s: string[]) => {
      console.log("log:", ...s);
    }),
    info: jest.fn((...s: string[]) => {
      console.info("log:", ...s);
    }),
    error: jest.fn((phase: string, ...e: string[]) => {
      console.log("err:", ...e);
    }),
  };

  const this_code = (code: string) => {
    babyjs.runOnce(code);
    return {
      shouldWork: () => {
        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).not.toHaveBeenCalled();
      },
      shouldPrint: (output: any) => {
        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenLastCalledWith(">>", output);
      },
      shouldErrorAtRuntimeMentioning: (str: string) => {
        expect(logger.log).not.toHaveBeenCalled();
        expect(logger.error).toHaveBeenCalledWith("interpret", expect.stringContaining(str));
      },
      shouldErrorAtScantimeMentioning: (str: string) => {
        expect(logger.log).not.toHaveBeenCalled();
        expect(logger.error).toHaveBeenCalledWith("scan", expect.stringContaining(str));
      },
    };
  };

  beforeEach(() => {
    logger.log.mockClear();
    logger.error.mockClear();
    logger.info.mockClear();

    babyjs = new BabyJs();
    babyjs.setLogger(logger);
  });

  it("works", () => {
    this_code(`let test = "hello world";`).shouldWork();
  });

  // prettier-ignore
  describe("debug mode works", () => {
    it("works with expressions", () => this_code("1+2;").shouldWork());
    it("works with assignments", () => this_code("let a;").shouldWork());
    it("works with block scoping", () => this_code("let a; { let a = 10; print a; } a = 5; print a;").shouldPrint(5));
  });

  it("print works", () => this_code("print 1;").shouldPrint(1));

  // prettier-ignore
  describe("expressions", () => {
    it("evaluates simple expressions", () => this_code("print 1+2;").shouldPrint(3));
    it("evaluates complex expressions", () => this_code("print ((1 / 5 + 4) / 5 + 0.2);").shouldPrint(1.04));
    it("evaluates pi", () => this_code("print 22/7;").shouldPrint(3.142857142857143));
    it("performs comparisons", () => this_code("print 1==1;").shouldPrint(true));
    it("does not typecast in comparisons (similar to js strict equality 'a === b')", () => this_code(`print 1=="1";`).shouldPrint(false));
    it("should not divide by zero", () => this_code("print 1/0;").shouldErrorAtRuntimeMentioning("divide by zero"));
  });

  // prettier-ignore
  describe("let", () => {
    it("does not identify 'nil' as a reserved word. (it was in lox. is removed in babyjs)", () => this_code(`let one = nil;print one;`).shouldErrorAtRuntimeMentioning("Undefined variable 'nil'"));
    it("cannot store nullish values: null (js:leaky)", () => this_code("let one = null;print one;").shouldErrorAtScantimeMentioning("SCAN ERROR"));
    // undefined is not a reserved word in babyjs, so it should be treated as an identifier.
    it("cannot store nullish values: undefined (js:leaky)", () => this_code(`let one = undefined;print one;`).shouldErrorAtRuntimeMentioning("Undefined variable 'undefined'"));
    
    it("stores number", () => this_code(`let one = 1;print one;`).shouldPrint(1));
    it("stores number (nullish values: 0)", () => this_code(`let zero = 0;print zero;`).shouldPrint(0));
    it("stores boolean", () => this_code(`let zero = true;print zero;`).shouldPrint(true));
    it("stores boolean (nullish values: false)", () => this_code(`let zero = false;print zero;`).shouldPrint(false));

    it("errors when user tries to redeclare a variable", () => this_code(`let one = 2; let one = 1;`).shouldErrorAtRuntimeMentioning("Variable has already been defined"));
    it("errors when user tries to redeclare a variable (nullish values)", () => this_code(`let one = 0; let one = 1;`).shouldErrorAtRuntimeMentioning("Variable has already been defined"));

    it("reassigns number", () => this_code("let one = 1;one = 2;print one;").shouldPrint(2));
    it("reassigns number (nullish values)", () => this_code("let one = 0;one = 2;print one;").shouldPrint(2));

    it("stores string", () => this_code(`let one = "foo";print one;`).shouldPrint("foo"));
    it(`stores string (nullish values: "")`, () => this_code(`let one = "";print one;`).shouldPrint(""));
    it("evaluates and stores expression", () => this_code(`let one = 1+2;print one;`).shouldPrint(3));

    it.skip("warns on reassignments", () => {
      const code = `let one = 1;one = 2;`;
      babyjs.runOnce(code);

      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("reassigning value"));
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).not.toHaveBeenCalled();
    });
  });

  // prettier-ignore
  describe("variable assignment", () => {
    it("works", () => this_code(`let a = 10; a = 20; print a;`).shouldPrint(20));
    it("does not allow accessing unassigned variables at runtime", () => this_code(`let a; print a;`).shouldErrorAtRuntimeMentioning("used before assignment"));
  });

  describe("error handling", () => {
    it("(==) missing left hand operand for binary operator", () => {
      const code = "== 2;";
      babyjs.runOnce(code);

      expect(logger.log).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenNthCalledWith(
        3,
        "parse",
        expect.stringContaining("Expected an operand before '=='")
      );
    });
    it("(!=) missing left hand operand for binary operator", () => {
      const code = "!= 2;";
      babyjs.runOnce(code);

      expect(logger.error).toHaveBeenNthCalledWith(
        3,
        "parse",
        expect.stringContaining("Expected an operand before '!='")
      );
    });
    it("(multiple) missing left hand operand for binary operator", () => {
      const code = "<= 2;==1;";
      babyjs.runOnce(code);

      expect(logger.error).toHaveBeenNthCalledWith(
        3,
        "parse",
        expect.stringContaining("Expected an operand before '<='")
      );
      expect(logger.error).toHaveBeenNthCalledWith(
        4,
        "parse",
        expect.stringContaining("Expected an operand before '=='")
      );
    });
  });

  describe("if else", () => {
    it("if works", () => {
      const code = `if (true) print "GOAL";`;
      babyjs.runOnce(code);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith(">>", "GOAL");
    });
    it("if else works", () => {
      const code = `if (false) print "NOPE"; else print "GOAL";`;
      babyjs.runOnce(code);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith(">>", "GOAL");
    });
    it("if with curly braces works", () => {
      const code = `if (true) { print "GOAL"; }`;
      babyjs.runOnce(code);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith(">>", "GOAL");
    });
    it("if else with curly braces works", () => {
      const code = `if (false) { print "NOPE"; } else { print "GOAL"; }`;
      babyjs.runOnce(code);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith(">>", "GOAL");
    });
    it("chains without curly braces (but best not to do this), where else applies to closest if condition", () => {
      const code = `if (true) if (false) print "NOPE"; else print "GOAL";`;
      babyjs.runOnce(code);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith(">>", "GOAL");
    });
    it("if, else if, works with curly braces", () => {
      const code = `if (false) { print "NOPE"; } else if (true) { print "GOAL"; }`;
      babyjs.runOnce(code);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith(">>", "GOAL");
    });
    it("if, else if, else, works with curly braces", () => {
      const code = `if (false) { print "NOPE"; } else if (false) { print "NOPE"; } else { print "GOAL"; }`;
      babyjs.runOnce(code);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith(">>", "GOAL");
    });
  });

  describe("while loop", () => {
    it("works", () => {
      const code = `let a = 5; while (a > 0) { a = a - 1; print a; }`;
      babyjs.runOnce(code);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenLastCalledWith(">>", 0);
    });
    it("works without curly brackets", () => {
      const code = `let a = 5; while (a > 0) a = a - 1; print a;`;
      babyjs.runOnce(code);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenLastCalledWith(">>", 0);
    });
    it("catches infinite loops", () => {
      const code = `while (true) { }`;
      babyjs.runOnce(code);

      expect(logger.error).toHaveBeenCalledWith(
        "interpret",
        expect.stringContaining("Infinite loop detected")
      );
      expect(logger.log).not.toHaveBeenCalled();
    });
  });

  describe("for loop", () => {
    it("works", () => {
      const code = `for (let a = 0;a < 10;a=a+1) { print "GOAL"; }`;
      babyjs.runOnce(code);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledTimes(10);
      expect(logger.log).toHaveBeenLastCalledWith(">>", "GOAL");
    });
    it("doesn't leak 'for' loop variable into the parent environment", () => {
      const code = `let a = 99; for (let a = 0;a < 10;a=a+1) { print "GOAL"; } print a;`;
      babyjs.runOnce(code);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledTimes(11);
      expect(logger.log).toHaveBeenLastCalledWith(">>", 99);
    });
    it("can do fibonacci (simple)", () => {
      const code = `let a = 0;
      let temp;
      
      for (let b = 1; a < 10000; b = temp + b) {
        print a;
        temp = a;
        a = b;
      }`;
      babyjs.runOnce(code);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledTimes(21);
      expect(logger.log).toHaveBeenLastCalledWith(">>", 6765);
    });

    describe("rusty for loops (rangeFor)", () => {
      it("works using rust-style range expression (RangeExpr): start..end (start ≤ x < end)", () => {
        const code = `for (i in 0..10) { print i; }`;
        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledTimes(10);
        expect(logger.log).toHaveBeenLastCalledWith(">>", 9);
      });
      it("works using rust-style range expression (RangeInclusiveExpr): start..=end (start ≤ x ≤ end)", () => {
        const code = `for (i in 0..=10) { print i; }`;
        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledTimes(11);
        expect(logger.log).toHaveBeenLastCalledWith(">>", 10);
      });
      it("variables can be used for start and end", () => {
        const code = `let start = 0; let end = 10; for (i in start..end) { print i; }`;
        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledTimes(10);
        expect(logger.log).toHaveBeenLastCalledWith(">>", 9);
      });
      it("works when you do another for loop with the same initializer (block scoping initializer declaration)", () => {
        const code = `for (i in 0..10) { print i; } for (i in 0..10) { print i; }`;
        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledTimes(20);
        expect(logger.log).toHaveBeenLastCalledWith(">>", 9);
      });
      it("complex expressions work for start and end", () => {
        const code = `let start = 4/2 -2; for (i in start..5*2) { print i; }`;
        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledTimes(10);
        expect(logger.log).toHaveBeenLastCalledWith(">>", 9);
      });
      it("should error when start or end values do not evaluate to numbers", () => {
        const code = `let start = "foo"; for (i in start..10) { print i; }`;
        babyjs.runOnce(code);

        expect(logger.error).toHaveBeenCalledWith(
          "interpret",
          expect.stringContaining("must evaluate to numbers")
        );
        expect(logger.log).not.toHaveBeenCalled();
      });
    });
  });

  describe("logical operators", () => {
    describe("and", () => {
      it("true left expression also evaluates right expression", () => {
        const code = `print true and "GOAL";`;
        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledWith(">>", "GOAL");
      });
      it("&& is aliased to 'and'", () => {
        const code = `print true && "GOAL";`;
        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledWith(">>", "GOAL");
      });
      it("false left expression short circuits", () => {
        const code = `print false and "NOPE";`;
        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledWith(">>", false);
      });
      it("chains", () => {
        const code = `print true and true and true and "GOAL";`;
        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledWith(">>", "GOAL");
      });
    });

    describe("or", () => {
      it("if left expression is false, evaluates right", () => {
        const code = `print false or "GOAL";`;
        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledWith(">>", "GOAL");
      });
      it("|| is aliased to 'or'", () => {
        const code = `print false || "GOAL";`;
        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledWith(">>", "GOAL");
      });
      it("if left expression is true, evaluates left", () => {
        const code = `print "GOAL" or false;`;
        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledWith(">>", "GOAL");
      });
      it("chains", () => {
        const code = `print false or false or false or "GOAL";`;
        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledWith(">>", "GOAL");
      });
    });
  });

  describe("ternary operators", () => {
    /**
    const a = false; // "a";
    const b = "b";
    const c = "c";
    const d = "d";
    const e = "e";

    const out = a ? b : c ? d : e; // 'd'
    
    if js is left-associative,
    setting 'a' to falase would have meant
    that b would be returned.
    however, we see that 'd' is returned instead,
    meaning:
    - c ? d : e; is parsed first, returning 'd'
    - then, a being false, return the value
      to the right of :, which is the value of 
      (c ? d : e) = 'd'

    therefore js is right-associative, meaning
    it groups stuff from right to left:
    
    a ? b : (c ? d : e)
    */
    it("handles ternary operators", () => {
      const code = `let ternary = 1 ? true : false; print ternary;`;
      babyjs.runOnce(code);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith(">>", true);
    });

    describe("basic ternary operations", () => {
      it("returns left result for true", () => {
        const code = `let out = true ? "expected": "unexpected"; print out;`;
        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledWith(">>", "expected");
      });
      it("returns right result for false", () => {
        const code = `let out = false ? "unexpected": "expected"; print out;`;
        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledWith(">>", "expected");
      });
      it.skip("DEPRECATED - treats nil as false", () => {
        const code = `let out = nil ? "unexpected": "expected"; print out;`;
        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledWith(">>", "expected");
      });
    });

    describe("chained ternary operations", () => {
      it("true ? <goal> : c ? d : e", () => {
        const code = `let out = true ? "expected" : true ? "unexpected-1": "unexpected-2"; print out;`;
        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledWith(">>", "expected");
      });
      it("false ? b : true ? <goal> : e", () => {
        const code = `let out = false ? "unexpected-1" : true ? "expected": "unexpected-2"; print out;`;
        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledWith(">>", "expected");
      });
      it("false ? b : false ? d : <goal>", () => {
        const code = `let out = false ? "unexpected-1" : false ? "unexpected-2": "expected"; print out;`;
        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledWith(">>", "expected");
      });
      it("false ? b : false ? d : false : f : <goal>", () => {
        const code = `let out = false ? "unexpected-1" : false ? "unexpected-2": false ? "unexpected-3": "expected"; print out;`;
        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledWith(">>", "expected");
      });
      it("warns users against chaining", () => {
        const code = `let out = true ? "expected" : true ? "unexpected-1": "unexpected-2"; print out;`;
        babyjs.runOnce(code);

        expect(logger.info).toHaveBeenCalledTimes(1);
        expect(logger.info).toHaveBeenCalledWith(
          expect.stringContaining("chaining ternary operators")
        );
      });
      it("only warns once for subsequent chainings", () => {
        const code = `let out = false ? "unexpected-1" : false ? "unexpected-2": false ? "unexpected-3": "expected"; print out;`;
        babyjs.runOnce(code);

        expect(logger.info).toHaveBeenCalledTimes(1);
        expect(logger.info).toHaveBeenCalledWith(
          expect.stringContaining("chaining ternary operators")
        );
      });
    });

    // TODO: || and ?? not implemented yet
    describe.skip("conditional OR", () => {
      it("both are false", () => {
        const code = `
        let a = false;
        let b = false;
        let result = a || b ? "At least one is true" : "Both are false";
        print result;
        `;
        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledWith(">>", "Both are false");
      });
      it("left is true", () => {
        const code = `
        let a = true;
        let b = false;
        let result = a || b ? "At least one is true" : "Both are false";
        print result;
        `;
        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledWith(">>", "At least one is true");
      });
      it("right is true", () => {
        const code = `
        let a = false;
        let b = true;
        let result = a || b ? "At least one is true" : "Both are false";
        print result;
        `;
        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenCalledWith(">>", "At least one is true");
      });
    });
  });

  describe("functions", () => {
    it("works", () => {
      const code = `fn sayHi(first, last) {
        print "Hi, " + first + " " + last + "!";
      }
      
      sayHi("Dear", "Reader");`;

      babyjs.runOnce(code);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenLastCalledWith(">>", "Hi, Dear Reader!");
    });
    it("does not execute functions if not called", () => {
      const code = `fn bad() {
        print 1 / 0;
      }`;

      babyjs.runOnce(code);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).not.toHaveBeenCalled();
    });
    it("prints uncalled functions properly", () => {
      const code = "fn myFunc() {} print myFunc;";
      babyjs.runOnce(code);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenLastCalledWith(">>", "<fn myFunc () >");
    });
    it("prints uncalled functions properly (with parameters", () => {
      const code = "fn myFunc(param1, param2) {} print myFunc;";
      babyjs.runOnce(code);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenLastCalledWith(">>", "<fn myFunc (param1,param2) >");
    });
    /**
     * this is because i'm casting functions by calling toString that
     * results in the above result ^ instead of the internal object
     * and its done by looking for "<" in the stringified value
     */
    it("print things with '<' works", () => {
      const code = `print "<";`;
      babyjs.runOnce(code);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenLastCalledWith(">>", "<");
    });
    it("can do fibonacci (recursive function calls)", () => {
      const code = `
      fn fib(n) {
        if (n <= 1) return n;
        return fib(n - 2) + fib(n - 1);
      }
      
      for (let i = 0; i < 15; i = i + 1) {
        print fib(i);
      }`;
      babyjs.runOnce(code);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenLastCalledWith(">>", 377);
    });

    describe("return statements", () => {
      it("works", () => {
        const code = `fn myfunc() { return 1; } let one = myfunc(); print one;`;
        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenLastCalledWith(">>", 1);
      });
      it("does not swallow runtime exceptions when return statement has errors", () => {
        const code = `
        fn test() {
          return 1 / 0;
        }

        test();
        `;

        babyjs.runOnce(code);

        expect(logger.error).toHaveBeenCalled();
        expect(logger.error).toHaveBeenCalledWith(
          "interpret",
          expect.stringContaining("divide by zero")
        );
        expect(logger.log).not.toHaveBeenCalled();
      });
      it("does not swallow runtime exceptions when function body has errors", () => {
        const code = `
        fn test() {
          if (1/0) print "wrong";

          print "should not happen";
          return 1;
        }

        test();
        `;

        babyjs.runOnce(code);

        expect(logger.error).toHaveBeenCalled();
        expect(logger.error).toHaveBeenCalledWith(
          "interpret",
          expect.stringContaining("divide by zero")
        );
        expect(logger.log).not.toHaveBeenCalled();
      });
    });

    it("assigns return values form functions", () => {
      const code = `fn yes() { return 1; } let one = yes(); print one;`;
      babyjs.runOnce(code);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith(">>", 1);
    });
    it("return values can be part of expressions", () => {
      const code = `fn yes() { return 1; } let three = yes() + 2; print three;`;
      babyjs.runOnce(code);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith(">>", 3);
    });
    it("does not allow assignment of functions that don't return values", () => {
      const code = `fn no() { 1 + 1; } let one = no(); print one;`;

      babyjs.runOnce(code);

      expect(logger.error).toHaveBeenCalledWith(
        "interpret",
        expect.stringContaining("assigning a function with no return values to a variable")
      );
      expect(logger.log).not.toHaveBeenCalled();
    });
    it("allows mixing of returns with and without empty values", () => {
      const code = `
      fn early(num) {
        if (num != 1) return;
        return num;
      }

      // allowed
      let one = early(1); 
      print one;

      // this is allowed
      early(2);

      // not allowed
      let two = early(2);
      print two;
      `;
      babyjs.runOnce(code);

      expect(logger.log).toHaveBeenCalledWith(">>", 1); // still prints 1
      expect(logger.error).toHaveBeenCalledWith(
        "interpret",
        expect.stringContaining("assigning a function with no return values to a variable")
      );
    });

    describe("local functions and closures", () => {
      it("variables in closures should exist", () => {
        const code = `
        fn makeCounter() {
          let i = 0;
          fn count() {
            i = i + 1;
            print i;
          }
        
          return count;
        }
        
        let counter = makeCounter();
        counter(); // "1".
        counter(); // "2".`;

        babyjs.runOnce(code);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.log).toHaveBeenNthCalledWith(1, ">>", 1);
        expect(logger.log).toHaveBeenNthCalledWith(2, ">>", 2);
      });
    });
  });

  describe("async", () => {
    // should even work without actualy implementing anything new
    it("(desugared version) works", async () => {
      /**
       * desugared version of:
       * // FFI: fetches data, returns that data
       * async fn async(cb) {
       *   // waits for 3 secs, then
       *   cb("some text");
       * }
       *
       * fn processData(data) {
       *   print data;
       *   print "processing data...";
       * }
       *
       * async fn main() {
       *   print "starting";
       *   const data = await async();
       *   processData(data);
       *   print "async call complete!";
       * }
       *
       */
      const code = `
      fn processData(data) {
        print data;
        print "processing data...";
      }
      
      fn stateMachine(state, data) {
        if (state == "start") {
          fn ret(received) {
            stateMachine("dataReceived", received);
          }
          print "starting";
          async(ret); // at this point, user calls await
          return;
        }
        if (state == "dataReceived") {
          // rest of the user's code
          processData(data);
          print "async call complete!";

          // end the machine
          stateMachine("end", 0);
          return;
        }
        if (state == "end") {
          return;
        }
      }
      
      stateMachine("start", 0);
      `;
      babyjs.runOnce(code);
      // FIXME: rn, we don't have an async loop, so the callback doesn't get awaited for
      // we need a job executor OR an event loop to check every loop to see if the job is done.
      // is this how we make it sync?

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenNthCalledWith(1, ">>", "starting");
      await new Promise((r) => setTimeout(r, 3200)); // technically expected? cause babyjs doesn't adhere to js async environments?
      expect(logger.log).toHaveBeenLastCalledWith(">>", "async call complete!");
    });
  });
});
