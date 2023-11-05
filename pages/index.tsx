import Image from "next/image";
import { Inter } from "next/font/google";
import { Interpreter } from "@/components/interpreter/interface";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center px-24 ${inter.className}`}
    >
      <Interpreter />
    </main>
  );
}
