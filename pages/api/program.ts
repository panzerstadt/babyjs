// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Program } from "@/components/interpreter/program";
import type { NextApiRequest, NextApiResponse } from "next";

const removeTimestamp = (str: string) => {
  const length = Date.now().toString().length + ":".length;
  return str.slice(length);
};

const cleanLines = (multilineStr: string): string[] => {
  return multilineStr
    .split("\n")
    .map((l) => removeTimestamp(l))
    .filter(Boolean);
};

type Data = {
  message: string;
  output: Object;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const code = req.query.code;
  if (typeof code !== "string") {
    res
      .status(400)
      .json({ message: "please send a GET request with 'code' as a string", output: {} });
    return;
  }
  console.log("code received", code);
  const program = new Program();
  program.input(code);

  const output = {
    out: cleanLines(program.stdout),
    err: cleanLines(program.stderr),
    info: cleanLines(program.stdinfo),
    debug: cleanLines(program.stddebug),
    env: cleanLines(program.stdenv),
    redirect: cleanLines(program.urlredirect),
  };

  res.status(200).json({ message: "success", output });
}
