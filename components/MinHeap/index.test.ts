import { MinHeap } from "./";

test("min heap", function () {
  const heap = new MinHeap();

  expect(heap.length).toEqual(0);

  heap.insert(5, 5);
  heap.insert(3, 3);
  heap.insert(69, 69);
  heap.insert(420, 420);
  heap.insert(4, 4);
  heap.insert(1, 1);
  heap.insert(8, 8);
  heap.insert(7, 7);

  expect(heap.length).toEqual(8);
  expect(heap.delete()).toEqual(1);
  expect(heap.delete()).toEqual(3);
  expect(heap.delete()).toEqual(4);
  expect(heap.delete()).toEqual(5);
  expect(heap.length).toEqual(4);
  expect(heap.delete()).toEqual(7);
  expect(heap.delete()).toEqual(8);
  expect(heap.delete()).toEqual(69);
  expect(heap.delete()).toEqual(420);
  expect(heap.length).toEqual(0);
});

test("empty heap", () => {
  const heap = new MinHeap();
  expect(heap.delete()).toEqual(null);
});

test("duplicate elements", () => {
  const heap = new MinHeap();
  heap.insert(5, 5);
  heap.insert(5, 5);
  expect(heap.length).toEqual(2);
});

test("updating non-existent elements", () => {
  const heap = new MinHeap();
  expect(() => heap.update(1, 1)).toThrow();
});

test("server load balancing using a min heap", () => {
  type Server = { id: string; jobs: number };
  const serverA = { id: "A", jobs: 5 };
  const serverD = { id: "C", jobs: 50 };
  const serverB = { id: "B", jobs: 2 };
  const serverC = { id: "C", jobs: 10 };

  const heap = new MinHeap<Server>();
  heap.insert(serverA.jobs, serverA);
  heap.insert(serverB.jobs, serverB);
  heap.insert(serverC.jobs, serverC);
  heap.insert(serverD.jobs, serverD);

  const leastBusyServer = heap.pop()!;
  expect(leastBusyServer.id).toEqual("B"); // get the least busy server
  // give server B 4 jobs, then
  leastBusyServer.jobs = leastBusyServer.jobs + 4;
  heap.insert(leastBusyServer.jobs, leastBusyServer); // increment its task count

  const newLeastBusyServer = heap.pop()!;
  expect(newLeastBusyServer.id).toEqual("A");
  // give server new jobs
  newLeastBusyServer.jobs = newLeastBusyServer.jobs + 3;
  heap.insert(newLeastBusyServer.jobs, newLeastBusyServer);

  serverB.jobs = 99;
  heap.update(serverB, serverB.jobs);

  expect(heap.poll()?.id).toEqual("A");
});
