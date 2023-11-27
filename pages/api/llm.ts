import { NextApiRequest, NextApiResponse } from "next";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}
export type Chat = Message[];

type Data = {
  message: string;
  output: Object;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (!process.env.OPENAI_KEY) throw new Error("OPENAI_KEY not set");
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed", output: "" });
    return;
  }
  const { chat } = JSON.parse(req.body) as { chat: Chat };

  if (!chat) return console.warn("did not receive chat in body", req.body);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: chat,
      temperature: 0,
    }),
  }).then((res) => res.json());

  console.log("res  ", response);
  console.log("ANSWER: ", response.choices[0].message);
  return res.status(200).json({ message: "ok", output: response.choices[0].message.content });
}
