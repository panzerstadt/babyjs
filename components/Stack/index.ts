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

  private _view(resolver?: (item: T) => string) {
    if (!this.head) {
      console.log("<stack is not initialized>");
      return;
    }

    const output = [];

    let current: Node<T> | undefined = this.head;
    for (let i = 0; i < this.length; i++) {
      output.push(current?.value);
      current = current?.next;
    }
    let max_width = 3;
    const output_str = output
      .map((item) => {
        let res: string = "";
        try {
          if (!resolver) throw new Error("no resolver");
          if (!item) throw new Error("no item");
          res = resolver(item)?.toString();
        } catch (e) {
          console.error(e);
          res = item?.toString() || "(none)";
        }
        max_width = Math.max(max_width, res.length + 3);
        return [res, res.length + 3] as const;
      })
      .map(
        ([v, len], idx) =>
          `|[${idx}]${v}${Array(max_width - len)
            .fill(" ")
            .join("")}|`
      )
      .join("\n");

    // prettier-ignore
    console.log(`_${Array(max_width).fill(" ").join("")}_\n${output_str}\n ${Array(max_width).fill("-").join("")}`);
  }

  view(helperOrResolver?: Helpers | ((item: T) => string)): void {
    if (typeof helperOrResolver === "string") {
      const helper = helperOrResolver;
      switch (helper) {
        case "map":
          return this._view((r) => mapResolver(r as Map<any, any>));
        default:
          return this._view();
      }
    } else {
      const resolver = helperOrResolver;
      return this._view(resolver);
    }
  }

  push(item: T): void {
    // console.log(`op: PUSH: <${item}>`);
    const node = { value: item } as Node<T>;
    this.length++;

    const prevHead = this.head;
    this.head = node;
    this.head.next = prevHead;

    // console.table({ head: this.head, length: this.length });
  }
  pop(): T | undefined {
    if (!this.head) return undefined;

    this.length--;
    const head = this.head;
    this.head = this.head?.next;

    // console.log(`op: POP, val: ${head?.value}`);
    // console.table({ head: this.head, length: this.length });

    return head?.value;
  }
  peek(): T | undefined {
    return this.head?.value;
  }
}

type Helpers = "map";

const mapResolver = <T extends Map<any, any>>(item: T) => {
  let row = "<";
  if (item.size === 0) {
    row += "empty";
  }
  item.forEach((v, k) => {
    row += `k:${k}, v:${v} `;
  });
  row += ">";

  return row;
};
