import { Chat } from "@/pages/api/llm";
import { Callable } from "../../callable";
import { Interpreter } from "../../interpreters/interpreter";
import { _EMPTY_FN_RETURN } from "../../token";

const DUMMY_DATA = `ID,Name,Age,Email,Salary
1,John Doe,30,johndoe@example.com,50000
2,Jane Smith,28,janesmith@example,com,60000
3,Bob,--,,70000
4,Anna "Annie" O'Brien,34,annaobrien@example.com,80000
five,Mary Johnson,32,maryjohnson@example.com,90000
6,Invalid Name,40,mike@example.com,100k
7,Chris Lee,25,chrislee@example,com,110000
,,,
8,Kate Brown,thirtytwo,katebrown@example.com,120000
9,Li Wei,29,liwei@example.com,Not a number
`;

export class Csv extends Callable {
  arity(): number {
    return 0;
  }
  async call(interpreter: Interpreter, _arguments: Object[]) {
    return new Promise((ok, err) => {
      const initTime = Date.now();
      setTimeout(() => {
        const res = `result after: ${(Date.now() - initTime) / 1000}`;
        ok(res);
        interpreter.globals.define("csv_data", DUMMY_DATA);
      }, 3000);
    });
  }
  toString() {
    return "<native async fn>";
  }
}

export class Review extends Callable {
  arity(): number {
    return 1;
  }
  call(interpreter: Interpreter, _arguments: Object[]) {
    const initTime = Date.now();
    const data = _arguments[0]; // that Dummy data above

    interpreter.logger.log("checking the following data for possible data errors:\n");
    interpreter.logger.log("--------START---------");
    interpreter.logger.log(data);
    interpreter.logger.log("---------END----------");

    const chat: Chat = [
      {
        role: "system" as const,
        content:
          "You are a helper LLM, tasked with checking csv data for possible data entry errors for the given csv. given a csv, please reply in succinct, actionable items that will guide the user to clean the given csv data.",
      },
      {
        role: "user" as const,
        content: `${data}`,
      },
    ];

    fetch("api/llm", { method: "POST", body: JSON.stringify({ chat }) })
      .then((res) => res.json())
      .then((res: { output: string }) => {
        const timeTaken = (Date.now() - initTime) / 1000;
        interpreter.logger.info?.(`request took ${timeTaken} seconds.`);
        res.output.split("\n").forEach((row) => {
          interpreter.logger.log(row);
        });
      })
      .catch((e) => {
        console.log("errored");
        interpreter.logger.error("interpret", e.message);
      });

    interpreter.logger.log(
      "\nsending data to llm for a quick check.\nyou should be getting output at stdchat soon...\n"
    );
    return _EMPTY_FN_RETURN;
  }
}
