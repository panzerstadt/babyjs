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
    error: jest.fn((...e: string[]) => {
      console.log("err:", ...e);
    }),
  };

  beforeEach(() => {
    logger.log.mockClear();
    logger.error.mockClear();
    logger.info.mockClear();

    babyjs = new BabyJs();
    babyjs.setLogger(logger);
  });
  it("works", () => {
    const code = `let test = "hello world";`;
    babyjs.runOnce(code);
    expect(logger.log).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  describe("debug mode works", () => {
    it("works with expressions", () => {
      const code = "1+2;";
      babyjs.runOnce(code, true);
      expect(logger.error).not.toHaveBeenCalled();
    });
    it("works with assignments", () => {
      const code = "let a;";
      babyjs.runOnce(code, true);
      expect(logger.error).not.toHaveBeenCalled();
    });
    it("works with block scoping", () => {
      const code = "let a; { let a = 10; print a; } a = 5; print a;";
      babyjs.runOnce(code, true);
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  it("print works", () => {
    const code = `print 1;`;
    babyjs.runOnce(code);

    expect(logger.log).toHaveBeenCalledWith(">>", 1);
  });

  describe("expressions", () => {
    it("evaluates simple expressions", () => {
      const code = `print 1+2;`;
      babyjs.runOnce(code);

      expect(logger.log).toHaveBeenCalledWith(">>", 3);
    });
    it("evaluates complex expressions", () => {
      const code = `print ((1 / 5 + 4) / 5 + 0.2);`;
      babyjs.runOnce(code);

      expect(logger.log).toHaveBeenCalledWith(">>", 1.04);
    });
    it("evaluates pi", () => {
      const code = `print 22/7;`;
      babyjs.runOnce(code);

      expect(logger.log).toHaveBeenCalledWith(">>", 3.142857142857143);
    });
    it("performs comparisons", () => {
      const code = `print 1 == 1;`;
      babyjs.runOnce(code);

      expect(logger.log).toHaveBeenCalledWith(">>", true);
    });
    it("does not typecast in comparisons (similar to js strict equality 'a === b')", () => {
      const code = `print 1 == "1";`;
      babyjs.runOnce(code);

      expect(logger.log).toHaveBeenCalledWith(">>", false);
    });
  });

  describe("let", () => {
    it("does not identify 'nil' as a reserved word. (it was in lox. is removed in babyjs)", () => {
      const code = `let one = nil;print one;`;
      babyjs.runOnce(code);

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Undefined variable 'nil'")
      );
      expect(logger.log).not.toHaveBeenCalled();
    });
    it("cannot store nullish values: null (js:leaky)", () => {
      const code = `let one = null;print one;`;
      babyjs.runOnce(code);

      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("SCAN ERROR"));
      expect(logger.log).not.toHaveBeenCalled();
    });
    it("cannot store nullish values: undefined (js:leaky)", () => {
      // undefined is not a reserved word in babyjs, so it should be treated as an identifier.
      const code = `let one = undefined;print one;`;
      babyjs.runOnce(code);

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Undefined variable 'undefined'")
      );
      expect(logger.log).not.toHaveBeenCalled();
    });
    it("stores number", () => {
      const code = `let one = 1;print one;`;
      babyjs.runOnce(code);

      expect(logger.log).toHaveBeenCalledWith(">>", 1);
    });
    it("stores number (nullish values: 0)", () => {
      const code = `let one = 0;print one;`;
      babyjs.runOnce(code);

      expect(logger.log).toHaveBeenCalledWith(">>", 0);
    });
    it("stores boolean", () => {
      const code = `let one = true;print one;`;
      babyjs.runOnce(code);

      expect(logger.log).toHaveBeenCalledWith(">>", true);
    });
    it("stores boolean (nullish values: false)", () => {
      const code = `let one = false;print one;`;
      babyjs.runOnce(code);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith(">>", false);
    });

    it("errors when user tries to redeclare a variable", () => {
      const code = `let one = 2; let one = 1;`;
      babyjs.runOnce(code);

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Variable has already been defined")
      );
      expect(logger.log).not.toHaveBeenCalled();
    });
    it("errors when user tries to redeclare a variable (nullish values)", () => {
      const code = `let one = 0; let one = 1;`;
      babyjs.runOnce(code);

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Variable has already been defined")
      );
      expect(logger.log).not.toHaveBeenCalled();
    });

    it("reassigns number", () => {
      const code = `let one = 1;one = 2;print one;`;
      babyjs.runOnce(code);

      expect(logger.log).toHaveBeenCalledWith(">>", 2);
    });
    it("reassigns number (nullish values)", () => {
      const code = `let one = 0;one = 2;print one;`;
      babyjs.runOnce(code);

      expect(logger.log).toHaveBeenCalledWith(">>", 2);
    });

    it("stores string", () => {
      const code = `let one = "foo";print one;`;
      babyjs.runOnce(code);

      expect(logger.log).toHaveBeenCalledWith(">>", "foo");
    });
    it(`stores string (nullish values: "")`, () => {
      const code = `let one = "";print one;`;
      babyjs.runOnce(code);

      expect(logger.log).toHaveBeenCalledWith(">>", "");
    });
    it("evaluates and stores expression", () => {
      const code = `let one = 1+2;print one;`;
      babyjs.runOnce(code);

      expect(logger.log).toHaveBeenCalledWith(">>", 3);
    });

    it("warns on reassignments", () => {
      const code = `let one = 1;one = 2;`;
      babyjs.runOnce(code);

      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("reassigning value"));
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).not.toHaveBeenCalled();
    });
  });

  describe("variable assignment", () => {
    it("works", () => {
      const code = `let a = 10; a = 20; print a;`;
      babyjs.runOnce(code, true);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith(">>", 20);
    });
    it("does not allow accessing unassigned variables at runtime", () => {
      const code = `let a; print a;`;
      babyjs.runOnce(code);

      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("used before assignment"));
      expect(logger.log).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("(==) missing left hand operand for binary operator", () => {
      const code = "== 2;";
      babyjs.runOnce(code);

      expect(logger.log).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining("Expected an operand before '=='")
      );
    });
    it("(!=) missing left hand operand for binary operator", () => {
      const code = "!= 2;";
      babyjs.runOnce(code);

      expect(logger.error).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining("Expected an operand before '!='")
      );
    });
    it("(multiple) missing left hand operand for binary operator", () => {
      const code = "<= 2;==1;";
      babyjs.runOnce(code);

      expect(logger.error).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining("Expected an operand before '<='")
      );
      expect(logger.error).toHaveBeenNthCalledWith(
        4,
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

      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("Infinite loop detected"));
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

    // https://doc.rust-lang.org/reference/expressions/range-expr.html
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
      expect(logger.log).toHaveBeenCalledTimes(10);
      expect(logger.log).toHaveBeenLastCalledWith(">>", 10);
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
});
