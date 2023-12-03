type Node<T> = {
  value: T;
  prev?: Node<T>;
  next?: Node<T>;
};

export class DoublyLinkedList<T> {
  public length: number;
  private head?: Node<T>;
  private tail?: Node<T>;

  constructor() {
    this.length = 0;
    this.head = undefined;
    this.tail = undefined;
  }

  /**
   * a -> b -> c
   * prepend:
   * - g points to a
   * - a points to g
   * - head points to g
   */
  prepend(item: T): void {
    const newNode: Node<T> = {
      value: item,
      prev: undefined,
      next: this.head, // g points to a
    };

    this.length++;
    if (!this.head) {
      this.head = newNode; // first
      this.tail = newNode; // list with length of 1
      return;
    }

    this.head.prev = newNode; // a points to g
    this.head = newNode; // head points to g
  }
  insertAt(item: T, idx: number): void {
    if (idx > this.length) {
      throw new Error("oh no");
    } else if (idx === this.length) {
      this.append(item);
      return;
    } else if (idx === 0) {
      this.prepend(item);
      return;
    }

    const curr = this.getAt(idx) as Node<T>;
    const newNode: Node<T> = {
      value: item,
      prev: curr.prev, // f points to b
      next: curr, // f points to c
    };

    curr.prev = newNode; // c points to f
    curr.prev!.next = newNode; // b points to f
    this.length++;
  }
  append(item: T): void {
    const newNode: Node<T> = {
      value: item,
      prev: this.tail, // h points to d
      next: undefined,
    };

    this.length++;
    if (!this.tail) {
      this.head = newNode;
      this.tail = newNode;
      return;
    }
    this.tail.next = newNode; // d points to h
    this.tail = newNode; // tail points to h
  }
  // find an remove
  remove(item: T): T | undefined {
    let curr = this.head;
    for (let i = 0; curr && i < this.length; i++) {
      if (curr.value === item) {
        break;
      }
      curr = curr.next;
    }
    if (!curr) {
      return undefined;
    }
    return this.removeNode(curr);
  }
  get(idx: number): T | undefined {
    const node = this.getAt(idx);
    return node?.value;
  }
  removeAt(idx: number): T | undefined {
    const node = this.getAt(idx);
    if (!node) {
      return undefined;
    }
    return this.removeNode(node);
  }
  show() {
    let entireList = [];
    let curr = this.head;
    for (let i = 0; curr && i < this.length; i++) {
      entireList.push(curr.value);
      curr = curr.next;
    }
    console.log(entireList.map((v) => `(${v})`).join("->"));
  }

  private removeNode(node: Node<T>): T | undefined {
    this.length--;
    if (this.length === 0) {
      const out = this.head?.value;
      this.head = undefined;
      this.tail = undefined;
      return out;
    }
    // if head
    if (this.head === node) {
      this.head = node.next;
      if (node.next) {
        node.next.prev = undefined;
      }
    }
    // if tail
    if (this.tail === node) {
      this.tail = node.prev;
      if (node.prev) {
        node.prev.next = undefined;
      }
    }

    if (node.prev) {
      node.prev.next = node.next; // point b to d
    }
    if (node.next) {
      node.next.prev = node.prev; // point d to b
    }
    node.prev = undefined;
    node.next = undefined;
    return node.value;
  }
  private getAt(idx: number): Node<T> | undefined {
    let curr = this.head; // traverse the list
    for (let i = 0; curr && i < idx; i++) {
      curr = curr.next;
    }
    return curr;
  }
}
