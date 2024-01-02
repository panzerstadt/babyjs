type Node<T> = {
  readonly value: T;
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
  size() {
    return this.length;
  }
  get(idx: number): T | undefined {
    if (idx < 0 || idx >= this.length) {
      return undefined;
    }

    let current = this.head;
    for (let i = 0; i < this.length; i++) {
      if (i === idx) {
        return current?.value;
      }
      if (!current) {
        throw new Error("Invalid linked list");
      }
      current = current.next;
    }
  }

  view(resolver?: Function): void {
    const output = [];

    let current = this.head;
    for (let i = 0; i < this.length; i++) {
      output.push(current?.value);
      current = current?.next;
    }
    let max_width = 0;
    const output_str = output
      .map((item) => {
        let res: string = "";
        try {
          if (!resolver) throw new Error("no resolver");
          res = resolver(item)?.toString();
        } catch {
          res = item?.toString() || "";
        }
        max_width = Math.max(max_width, res.length);
        return [res, res.length] as const;
      })
      .map(
        ([v, len]) =>
          `|${v}${Array(max_width - len)
            .fill(" ")
            .join("")}|`
      )
      .join("\n");

    // prettier-ignore
    console.log(`|${Array(max_width).fill(" ").join("")}|\n${output_str}\n ${Array(max_width).fill("-").join("")}`);
  }

  push(item: T): void {
    console.log(`op: PUSH: <${item}>`);
    const node = { value: item } as Node<T>;
    this.length++;

    const prevHead = this.head;
    this.head = node;
    this.head.next = prevHead;

    console.table({ head: this.head, length: this.length });
  }
  pop(): T | undefined {
    if (!this.head) return undefined;

    this.length--;
    const head = this.head;
    this.head = this.head?.next;

    console.log(`op: POP, val: ${head?.value}`);
    console.table({ head: this.head, length: this.length });

    return head?.value;
  }
  peek(): T | undefined {
    return this.head?.value;
  }
}
