type Node<T> = {
  value: T;
  next?: Node<T>;
};

export class Stack<T> {
  public length: number;
  public head?: Node<T>;

  constructor() {
    this.length = 0;
    this.head = undefined;
  }

  isEmpty() {
    return this.length === 0;
  }

  view(resolver?: Function): void {
    const output = [];

    let current = this.head;
    for (let i = 0; i < this.length; i++) {
      output.push(current?.value);
      current = current?.next;
    }
    const output_str = output
      .map((item) => {
        try {
          if (!resolver) throw new Error("no resolver");
          return resolver(item);
        } catch {
          return item;
        }
      })
      .join(" -> ");

    console.log(`[top ${output_str} base]`);
  }

  push(item: T): void {
    console.log(`op: ${this.push.name}: ${item}`);
    const node = { value: item } as Node<T>;
    this.length++;

    const prevHead = this.head;
    this.head = node;
    this.head.next = prevHead;

    console.table({ head: this.head, length: this.length });
  }
  pop(): T | undefined {
    if (!this.head) return undefined;
    console.log(`op ${this.pop.name}`);

    this.length--;
    const head = this.head;
    this.head = this.head?.next;

    console.table({ head: this.head, length: this.length });

    return head?.value;
  }
  peek(): T | undefined {
    return this.head?.value;
  }
}
