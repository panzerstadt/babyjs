import { BabyJs } from "../babyjs";

describe("babyjs", () => {
  let babyjs: BabyJs;
  const logger = {
    log: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(() => {
    logger.log.mockClear();
    logger.error.mockClear();

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
});
