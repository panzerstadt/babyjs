## todos

i already have a turing complete synchronous language

what i need to make this testable is:

- anytime global return is sent, we find the next function in the chain and send the data to it (as string for now)
- anytime there is an async task (e.g. the dummyasync ffi), block the function
- execute the code as a file instead of a repl, i'm getting tired of copy pasting to often for testing XD
