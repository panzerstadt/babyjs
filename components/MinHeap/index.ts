// because a heap tree is always a full tree / balanced tree
// the height of the tree is always log n
// so inserts and deletes are always O log n (O(h) which is O log n)
export class MinHeap<T> {
  public length: number;
  private data: { priority: number; value: T }[];
  mapping: Map<T, number>;

  constructor() {
    this.length = 0;
    this.data = [];
    this.mapping = new Map();
  }

  toString() {
    return `heap: ${this.data.map((d) => `\n${d.priority} -> v:${JSON.stringify(d.value)}`)}`;
  }

  // insert at the end of data, and heapify up
  insert(priority: number, value: T): void {
    this.data[this.length] = { priority, value };
    this.mapping.set(value, this.length);
    this.heapifyUp(this.length);
    this.length++;
  }
  // pop the first item, move last data to top, and heapify down
  delete(): T | null {
    if (this.length === 0) return null;

    const out = this.data[0];
    this.mapping.delete(out.value);
    if (this.length === 1) {
      this.length = 0;
      this.data = [];
      return out.value;
    }

    this.data[0] = this.data.pop()!; // put the last thing on top
    this.length--;
    this.heapifyDown(0); // swap downward
    return out.value;
  }

  update(value: T, priority: number) {
    const idx = this.mapping.get(value);
    if (idx === undefined) throw new Error("tried to update a nonexistent item");
    this.data[idx] = { priority, value };

    if (idx > 0 && this.data[idx].priority < this.data[this.parent(idx)].priority) {
      this.heapifyUp(idx);
    } else {
      this.heapifyDown(idx);
    }
  }

  // synonyms for delete
  pop() {
    return this.delete();
  }
  // non-destructive
  poll() {
    if (this.length === 0) return null;
    const out = this.data[0];
    return out.value;
  }
  peek() {
    return this.poll();
  }

  private heapifyDown(idx: number): void {
    const lIdx = this.leftChild(idx);
    const rIdx = this.rightChild(idx);

    if (idx >= this.length || lIdx >= this.length) return;

    // get both values, find the minimum one, then check if we need to swap
    const lVal = this.data[lIdx];
    const rVal = this.data[rIdx];
    const value = this.data[idx];

    // get smallest of both childs
    let minIdx = idx;
    // find smallest child idx
    if (!!lVal) {
      if (!!rVal) {
        minIdx = lVal.priority < rVal.priority ? lIdx : rIdx; // both exist. return the smaller index
      } else {
        minIdx = lIdx; // rVal doesn't exist. return left index
      }
    }

    // child must be higher or equal than current
    if (this.data[minIdx].priority < value.priority) {
      this.swap(idx, minIdx);
      this.heapifyDown(minIdx);
    }
  }

  private heapifyUp(idx: number): void {
    if (idx === 0) return;

    // get parent
    const pIdx = this.parent(idx);
    // get value
    const parentValue = this.data[pIdx];
    const value = this.data[idx];
    // if i'm smaller than my parent, i need to swap up
    if (parentValue.priority > value.priority) {
      this.swap(idx, pIdx);
      this.heapifyUp(pIdx);
    }
  }

  private swap(i: number, j: number) {
    // swap
    const temp = this.data[i];
    this.data[i] = this.data[j];
    this.data[j] = temp;
    // set the right indices to the new mappings
    this.mapping.set(this.data[i].value, i);
    this.mapping.set(this.data[j].value, j);
  }

  private parent(idx: number): number {
    return Math.floor((idx - 1) / 2);
  }
  private leftChild(idx: number): number {
    return 2 * idx + 1;
  }
  private rightChild(idx: number): number {
    return 2 * idx + 2;
  }
}
