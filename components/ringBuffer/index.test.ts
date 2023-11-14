import { RingBuffer } from ".";

describe("RingBuffer", () => {
  it("works", () => {
    const buffer = new RingBuffer<number>(3);

    expect(buffer.read()).toBe(undefined);

    buffer.write(1);
    buffer.write(2);
    buffer.write(3);
    buffer.write(4);
    buffer.write(5);
    buffer.write(6);

    expect(buffer.values()).toStrictEqual([1, 2, 3]);

    expect(buffer.read()).toBe(1);
    expect(buffer.read()).toBe(2);

    buffer.clear();
    expect(buffer.read()).toBe(undefined);

    buffer.write(6);
    buffer.write(7);
    expect(buffer.read_batch(100)).toStrictEqual([6, 7]);
  });
});
