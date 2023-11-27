import { Inter } from "next/font/google";
import { Interpreter } from "@/components/interpreter/interface";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center px-4 sm:px-24 ${inter.className}`}
    >
      <div className="h-[80dvh] w-full">
        <Interpreter lang="babyjs" />
      </div>
    </main>
  );
}
