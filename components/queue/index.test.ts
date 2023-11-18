import { Queue } from ".";

describe("queue", () => {
  it("enqueues at the back, deques from the front, returns undefined when nothing is left", () => {
    const q = new Queue();

    q.enqueue(1);
    expect(q.deque()).toBe(1);

    q.enqueue(2);
    q.enqueue(3);
    q.enqueue(4);
    q.enqueue(5);
    expect(q.deque()).toBe(2);
    expect(q.deque()).toBe(3);
    expect(q.deque()).toBe(4);
    expect(q.deque()).toBe(5);
    expect(q.deque()).toBe(undefined);
  });
});
