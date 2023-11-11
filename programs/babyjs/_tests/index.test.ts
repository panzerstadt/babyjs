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
    it("does not typecast in comparisons (similar to js strict equality 'a === b'", () => {
      const code = `print 1 == "1";`;
      babyjs.runOnce(code);

      expect(logger.log).toHaveBeenCalledWith(">>", false);
    });
  });

  describe("let", () => {
    it("let statement stores number", () => {
      const code = `let one = 1;print one;`;
      babyjs.runOnce(code);

      expect(logger.log).toHaveBeenCalledWith(">>", 1);
    });
    it("let statement stores string", () => {
      const code = `let one = "foo";print one;`;
      babyjs.runOnce(code);

      expect(logger.log).toHaveBeenCalledWith(">>", "foo");
    });
    it("let statement evaluates and stores expression", () => {
      const code = `let one = 1+2;print one;`;
      babyjs.runOnce(code);

      expect(logger.log).toHaveBeenCalledWith(">>", 3);
    });
  });

  describe("variable assignment", () => {
    it.only("works", () => {
      const code = `let a = 10; a = 20; print a;`;
      babyjs.runOnce(code, true);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith(">>", 20);
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
      it("treats nil as false", () => {
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
