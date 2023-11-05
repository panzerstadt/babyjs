import { MouseEventHandler, useEffect, useRef, useState } from "react";
import { Program } from "./program";

interface InterpreterProps {
  focus?: number; // a random number to trigger a useEffect dep
}
type LineType = "out" | "err" | "usr";
export const Interpreter: React.FC<InterpreterProps> = ({ focus }) => {
  const cursor = useRef<HTMLInputElement>(null);
  const terminal = useRef<HTMLDivElement>(null);
  const program = useRef<Program>();
  const [userInputBuffer, setUserInputBuffer] = useState("");
  const [lines, setLines] = useState<{ type: LineType; value: string }[]>([
    { type: "out", value: "Hello there. type 'help' for a nice intro." },
  ]);
  useEffect(() => {
    program.current = new Program();
  }, []);

  // prints non-erroring messages
  useEffect(() => {
    if (!program.current?.stdout) return;
    const stdout = program.current?.stdout
      .split("\n")
      .map((s) => ({ type: "out" as LineType, value: s || " " }));
    stdout && setLines((p) => [...p, ...stdout]);
  }, [program.current?.stdout]);

  // prints errors
  useEffect(() => {
    const stderr = program.current?.stderr
      .split("\n")
      .map((s) => ({ type: "err" as LineType, value: s }));
    stderr && setLines((p) => [...p, ...stderr]);
  }, [program.current?.stderr]);

  const scrollToBottom = () => {
    // @ts-ignore
    cursor.current?.scrollIntoView({ behavior: "instant", block: "nearest", inline: "nearest" });
  };
  const handleFocusOnCursor = () => {
    cursor.current?.focus();
  };

  useEffect(() => {
    handleFocusOnCursor();
    scrollToBottom();
  }, [cursor, focus]);

  const handleSetStdout = (newOutput: string, type?: LineType) => {
    setLines((p) => [...p, { type: type ?? "out", value: newOutput }]);
  };

  const handleClearStdout = () => {
    setLines([]);
  };

  const handleSendCode = () => {
    if (userInputBuffer === "clear") {
      handleClearStdout();
      setUserInputBuffer("");
      return;
    }

    handleSetStdout(userInputBuffer, "usr");
    const result = program.current?.input(userInputBuffer);
    result && handleSetStdout(result);
    setUserInputBuffer("");
    setTimeout(() => {
      scrollToBottom();
    }, 300);
  };

  const handleCaptureEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendCode();
    }
  };

  const handleUserInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInputBuffer(e.target.value);
    scrollToBottom();
  };

  return (
    <div className="relative bg-stone-900 w-full h-[80dvh] text-slate-300 sm:rounded-lg p-6 border border-zinc-200 text-sm font-mono">
      <div ref={terminal} className="h-full overflow-auto flex flex-col">
        {lines.map((s, i) => {
          const styles: { [key in LineType]: string } = {
            out: "text-slate-300",
            err: "text-red-500",
            usr: "text-sky-600",
          };
          return (
            <code key={i} className={`${styles[s.type]} whitespace-break-spaces`}>
              {s.value}
            </code>
          );
        })}
        <input
          ref={cursor}
          onChange={handleUserInput}
          onKeyDown={handleCaptureEnter}
          className="bg-transparent text-sky-500 w-full outline-none pb-2"
          value={userInputBuffer}
          placeholder=">_"
        />
        <div onClick={() => handleFocusOnCursor()} className="flex flex-grow h-full">
          {" "}
        </div>
      </div>
    </div>
  );
};
