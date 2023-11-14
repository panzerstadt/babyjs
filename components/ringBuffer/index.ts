/**
 * References:
 * main: https://en.wikipedia.org/wiki/Circular_buffer
 * minor: https://sites.google.com/view/algobytheroyakash/data-structures/ring-buffer
 *
 * Ring Buffer internal array size = user defined size + 1 (to tell if buffer is full)
 */
export class RingBuffer<T extends Object> {
  private array: Array<T | undefined>;
  private readIdx = 0; // read head always contains item, except when read head == write head
  private writeIdx = 0; // write head is always empty, since it always increments after writing

  constructor(size: number) {
    this.array = new Array(size + 1).fill(undefined);
    this._debug("init");
  }

  private _increment(head: "read" | "write") {
    switch (head) {
      case "read":
        this.readIdx = (this.readIdx + 1) % this.array.length;
        break;
      case "write":
        this.writeIdx = (this.writeIdx + 1) % this.array.length;
        break;
      default:
        throw new Error(`unexpected call to ${this._peek_next_idx.name}`);
    }
  }
  private _peek_next_idx(head: "read" | "write") {
    switch (head) {
      case "read":
        return (this.readIdx + 1) % this.array.length;
      case "write":
        return (this.writeIdx + 1) % this.array.length;
      default:
        throw new Error(`unexpected call to ${this._peek_next_idx.name}`);
    }
  }

  /**
   * O(1) The start and end indexes are not enough to tell buffer full or empty state
   * while also utilizing all buffer slots,[5] but can if the buffer only has a
   * maximum in-use size of Length - 1
   */
  private _is_full() {
    // if next idx is the same as read idx, then it's full
    return this._peek_next_idx("write") === this.readIdx;
  }
  private _debug(op: string) {
    const viz = this.array.map((v, i) => {
      let value = v ?? "_";

      if (i === this.writeIdx) {
        value = `${value}]`;
      }
      if (i === this.readIdx) {
        value = `[${value}`;
      }
      return value;
    });

    console.log(`op:${op} w:${this.writeIdx} r:${this.readIdx} v:${viz}`);
  }

  // O(1)
  public clear() {
    this.writeIdx = this.readIdx;
    this._debug("clear");
  }
  public values(): Array<T | undefined> {
    return this.array.slice(0, -1);
  }

  public resize(size: number): boolean {
    throw new Error("TODO");
    // if size does not fit the 'active' values, fail it

    return false;
  }

  /**
   * O(1) write to current write head, then increments write head
   * @param item item to add to array
   * @returns success / fail
   */
  public write(item: T): boolean {
    if (this._is_full()) return false;

    this.array[this.writeIdx] = item;
    this._debug(`w_idx ${this.writeIdx}`);
    this._increment("write");
    return true;
  }

  /**
   * O(1) returns item and increments read head
   * @returns item
   */
  public read(): T | undefined {
    if (this.readIdx === this.writeIdx) return undefined;

    const result = this.array[this.readIdx];
    this._debug(`r_idx ${this.readIdx}`);
    this._increment("read");

    return result;
  }

  /**
   * O(n) returns data at read head, then increments.
   * read head can never exceed write head
   * @param size number of items to read (read head increments by number of items). if size is larger than readable number of items, returns the max number of readable items.
   * @returns item, or undefined
   */
  public read_batch(count: number = 1): typeof this.array {
    let results: typeof this.array = [];

    for (let i = count; i > 0; i--) {
      const result = this.read();
      if (!result) return results;
      results.push(result);
    }

    return results;
  }
}
