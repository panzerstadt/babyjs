## different types of async programming (patterns/features/APIs/ways?)

- event driven programming / callbacks
  - what javascript is built around initially
  - do something in response to discrete events
- reactive programming (rxjs etc)
  - treat data as streams, observe data that gets emitted from streams, and react to those data
  - has mechanisms to handle backpressure (managing rate of data flow)
- promises (then) / futures
  - they are a specific case of callback, with more defined APIs
  - promises = callbacks where the function returns two params (resolve,reject), and can be chained with .then
- async await
- generators + yields (e.g. js)
- coroutines with cooperative multitasking (e.g. lua)
  - this is actually single threaded, (and basically similar to generator + yield)
  - `coroutine.create()` and `coroutine.yield()`
- coroutines with schedulers / mini(lightweight) threads (e.g. go)
  - kinda like virtual threads? chatgpt says they're much more efficient than traditional threads in terms of memory and setup overhead
  - i think their core value proposition is that they are super duper easy to use
    - e.g. `go somefunc()` starts a coroutine already.
    - this can technically be implemented in other ways, e.g. by actually spawning real threads
- threads (actual spawning of cpu threads) (e.g. node, python...)
- DAGs (different scope, but still about async programming)
  - multiple single-threaded programs, orchestrated in a procedural manner

### comparison

chatgpt: Below is a table summarizing the different asynchronous programming paradigms, along with a column describing how each paradigm processes asynchronous work under the hood:

| Language/Paradigm        | Async Paradigm                                   | Characteristics                                                                                     | Under-the-Hood Processing of Async Work                                                                                                                |
| ------------------------ | ------------------------------------------------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| JavaScript               | Event loops, Callbacks, Promises, Async/Await    | Single-threaded, non-blocking I/O, event-driven.                                                    | Uses an event loop and callback queue. Async tasks are offloaded to Web APIs, and their callbacks are queued for execution when the task completes.    |
| Go                       | Goroutines, Channels, sync.WaitGroup             | Multi-threaded with lightweight threads, efficient concurrency management.                          | Employs a scheduler within the Go runtime. The scheduler multiplexes goroutines onto a small number of OS threads, allowing for efficient concurrency. |
| Lua                      | Coroutines                                       | Single-threaded, cooperative multitasking with explicit yield and resume.                           | Coroutines are managed explicitly by the programmer. They yield and resume within the same thread, with no pre-emptive scheduling.                     |
| Python                   | Asyncio (async/await), Threads, Multiprocessing  | Supports both single-threaded async I/O (asyncio) and multi-threaded/multi-process parallelism.     | Uses an event loop (like `asyncio`) for async/await. Threads and multiprocessing modules are used for parallelism.                                     |
| C#                       | Async/Await, Tasks, Threads                      | Integrates async/await with the Task Parallel Library (TPL) for both I/O and CPU-bound tasks.       | Built around the TPL and TaskScheduler. Uses a thread pool for task execution, with synchronization contexts for specific threading requirements.      |
| Java                     | CompletableFuture, Threads, Reactive Streams     | Future-based concurrency, traditional multi-threading, and support for reactive programming models. | Utilizes the executor framework for managing threads. CompletableFuture for async operations and the Flow API for reactive streams.                    |
| Reactive Programming     | Observables, Data Streams, Functional Operations | Focuses on data streams and propagation of change, often with a functional programming approach.    | Typically implemented via libraries (e.g., RxJS, RxJava). Processes data streams asynchronously, handling backpressure and stream transformations.     |
| Event-Driven Programming | Events and Callbacks                             | Responds to discrete events (e.g., user actions, system signals) with callbacks.                    | Depends on the language/framework. Usually involves an event-dispatching mechanism where callbacks are invoked in response to events.                  |

This table offers a broad overview of how different languages and paradigms handle asynchronous programming, highlighting the diversity of approaches and the underlying mechanisms that enable asynchronous processing in each case.

### axes

it kinda seems like there are tradeoffs around the axes of:

- paradigm / where it is used (event driven vs async await)
- heavy vs lightweight (coroutines vs threads)
- scale of async-ness (ms/seconds vs minutes/hours)
- goals (optimizing response times / resource usage vs organizing sequences of tasks at a higher level)

### what it boils down to

is something my colleague calls 'intent driven development'.

it is the "what is the most intuitive way to deal with async work in **\_\_**? "

for example:

- the web browser: async work comes in the form of discrete events from users, that the program has to react to.
  - user events are async. dealing with events is the way to map async work to logic -> event driven programming
- the backend:
  - i'm biased, so i'm gonna say events again. every request is an event that is to be handled. but here, and also usually in the browser, this 'handling' is a bit too big, and does require some async work inside the event itself. so we add another layer of async work (fetching, file reading, )

so in this respect, event driven programming is too broad to full describe what one does when handling user events. they represent the main 'group of work', but the 'unit of work' still needs to be defined.

LARGE: there are large scale async types work

- what DAGs purport to solve, chaining long running methods together through a dependency chain
  - kinda like when an API relies on another API which relies on another API, but with more observability
- technically because time doesn't stop for sync programs, all work is async work

MID: there are two types of "groups of work" methods then:

- event driven (event handlers and such) (its.. pubsub?)
  - user event handlers (click events)
  - db event handlers (firebase events)
- coroutines?
  - firing off subroutines and either waiting for the results or not waiting

SMALL: then there are "units of work" that are done with:

- async await
- continuation-passing style (CPS) (its callbacks, but in old programmer speak)
  - where the special case is: promises and callbacks / thenables

#### there are things that...

- you fire off to do stuff and you dont care what happens: async workers / tasks / job scheduling
  - go: goroutines without waiting
  - js: running async workers without waiting for it to finish (but of course, we still)
- you fire off, but want to wait for results before doing something else: chaining logic
- you receive from somewhere in the ether (internet / streams / queues) that you need to deal with

### scale vs DAGs

In asynchronous programming, we're often dealing with I/O operations, API calls, or short-lived computational tasks. DAG workflows deal with larger tasks, which might be entire programs, scripts, or lengthy data processing jobs.

hmm i mean.. first class language support for DAGs would be cool tho. what would it look like?

### convo

so it's sorta varying degrees of control as to when to split the program control flow, as well as the interfaces used to join them back / block the control flow until a result comes back

> how much abstraction is exposed by the language huh

and then there's

- event loops, splitting tasks and polling for results until it comes back
- job scheduling, goroutines just spawn virtual threads
- actual cpu threads

can't find other types yet

## chat

https://chat.openai.com/share/1bba9134-638e-46f0-9edf-ea60c55830ec
