// uh... use push: https://dev.to/uilicious/javascript-array-push-is-945x-faster-than-array-concat-1oki
// better yet, build your own push.
// pre-allocate final size before push for blazingly fast (ish)
// TODO: linked list it (or do i want to? TODO: performance comparison)

const MAX_BUFFER_SIZE = 100;

export class Queue<T> {
  private queue: T[] = [];
  public size = 0;

  private can_enqueue() {
    console.log("size", this.size);
    if (this.size > MAX_BUFFER_SIZE) {
      console.warn(
        `max buffer reached (${this.size}/${MAX_BUFFER_SIZE}): messages will be dropped.`
      );
      return false;
    }
    return true;
  }

  public enqueue_batch(items: T[]) {
    if (!this.can_enqueue()) return;

    const batchSize = items.length;

    this.queue.length = this.size + batchSize;

    for (let i = 0; i < batchSize; i++) {
      this.queue[this.size + i] = items[i];
    }
    this.size = this.queue.length;
  }
  public enqueue(item: T) {
    if (!this.can_enqueue()) return;

    const newSize = this.queue.push(item);
    this.size = newSize;
  }
  public deque(): T | undefined {
    const item = this.queue.shift();
    this.size = this.queue.length;
    return item;
  }
}
