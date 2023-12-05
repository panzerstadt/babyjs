import { BabyJs } from "./babyjs";

// parse('/ \'this\' "maybe" test = 1 1.123 \n /* comment */ <cool> // some text \n "unterminated');

const baby = new BabyJs();

// const initialTest = "print 0 + 3 / (2 * 5);";
const initialTest = `let test = "hello world";`;
console.log("running initial test of: ", initialTest);
baby.repl(initialTest, true);
