# dagdog

the language that runs async code as a set of dags

# features

- js-like syntax (targeting the masses here)
- no async code
- turing completeness because i don't know what it want to do with it yet
  - bonus: less features over time
- OIC: Orchestrator Is Compiler
  - your compiler is... wait for it.. a dag orchestrator
- so kinda like microservices orchestrated over airflow(tm)
  - but packaged as a whole programming language
- dagdog should give you best-in-class observability, cause that's sorta the point of this language. otherwise its just a subset of javascript.
- FFIs to javascript (the web browser)
- first prototype is actually gonna just be built on next js even.
  - also i don't know how to write an orchestrator or even know what features a good orchestrator should have. but we'll sort that out when we get there.

# why

i was a bit miffed when i found out that in goroutines, the underlying implementation is literally a task scheduler.

```go
// a goroutine
go myFunc() // go scheduler spawns a lightweight thread and just stops caring about it

// wait so how does one get data from a goroutine?

// with channels, its the 'magic pipe' that connects different parts of the code together
somechannel <- sends // go sends data to some pipe
receives <- somechannel // pipe spits out data to somewhere else in the code

myFuncThatUsesReceivedData()
```

so i thought, "why are we flattening out this naturally graph-lke pattern of coding? why not keep it the way it is? why are we contorting out programming languages to fit into a text editor?"

also, started from visual programming (boxes and wires) and have been missing it ever since.

shouldn't the above code make a lot more sense like this?

```
myFunc() { <some block of logic> } ---> myFuncThatUsesReceivedData(data) { <data comes in> }
```

# but why?

the world is async. everything is async. when you write sync code, you're stopping time and performing a task that 'conceptually' takes 1 tick of time. if you want a task that actually takes a long time, you just 'stop time' (block the thread) until you're ready to resume.

now when we want to organize multiple bits of logic together, with sometimes fast, sometimes slow code, we introduce await/callbacks/coroutines. why tho?

if we take a unit of task that put it in a unit of 'program', when that task is done, we return an output.

now when you want to wire different parts of logic together that take different amounts of time, you.. well, you _wire them together_.

## what if i want to know how long my program will run for?

you don't know that anyway with current programming languages without explicitly timing your stuff.

why not let the ~~orchestrator~~ compiler do it for you?

# how would this look like in a text editor with a folder structure?

i guess it might look like a bunch of loose little handlers, kinda like _gasp_ microservices.

# is this the right abstraction?

i dunno XD microservices was an abstraction that can only really work with a ratio of 2-3 devs = 1 microservice.

one of the biggest headaches of running microservices (or anything over the network) is that it is extremely hard to debug.

maybe that's where dagdog needs to be helpful!

# hey smalltalk vibes!

i guess, i read like a tiny excerpt of what smalltalk conceptually is, then didn't manage to read the rest. so the only things that stuck are 'objects' and 'message passing'
