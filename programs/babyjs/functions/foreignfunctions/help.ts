import { Callable } from "../../callable";
import { Interpreter } from "../../stages/interpreters/interpreter";

const HELP = `
hey there welcome to the babyjs language! you might notice that it looks really similar to javascript.
actually some things look like python/rust too...

here are some things you can do with it right now.

-----------------

let one = 1; // variable declaration
let two = one + 2;
{ // blocks
  two = 42; // variable assignment
  print two;
}
print two;

print (2/5.5+2)-2.5; // arithmetic

// logical operators
print 1 > 2 or "result";
print 1 > 2 || "result";
print 1 > 2 and "skipped";
print 1 > 2 && "skipped";

// ternaries
let three = two == 3 ? "yes" : "no";

// control flow
if (three == "yes") print "wow";

if (1 > 2) print "nein"; else print "math checks out";

if (true) {
  print "js brackets are a go";
} else if {
  print "all the ifs";
}

let also = true;
if (also)
  print "but they're syntactic sugar";
  if (1 + 1 == 2)
    print "and you don't really need them";
  else if (2 + 2 == 4)
    print "but it might feel a bit weird";
  else
    print "but to each their own";
else
  print "also, the above white space doesn't matter";

// loops in the c style (without the increment operator '++')
for (let i = 0, i < 10; i = i + 1) {
    print i;
}

// loops with rust-like range syntax!
// (specifically RangeExpr and RangeInclusiveExpr)
for (i in 0..10) { 
    print i; 
}

// fibonacci
let a = 0;
let temp;

for (let b = 1; a < 10000; b = temp + b) {
  print a;
  temp = a;
  a = b;
}

// no anonymous functions btw
fn thrice(param) {
  for (let i = 1; i <= 3; i = i + 1) {
    param(i);
  }
}

// this will not work
thrice(fn (a) {
  print a;
});

// you might have also realised.. uh.. there are no:
- arrays
- objects
- classes (yet)


// come back from time to time to see this list grow!
-----------------

here are some cli commands that have been implemented so far:

help  :  this message.
clear :  clears the terminal.
vvvv  :  toggles verbose mode. explore the innards of how a program
         gets understood by the interpreter!
`;

export class Help extends Callable {
  arity(): number {
    return 0;
  }
  async call(interpreter: Interpreter, _arguments: Object[]) {
    interpreter.logger.log?.(HELP);
    return HELP;
  }
  toString() {
    return "<native fn>";
  }
}
