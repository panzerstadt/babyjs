import { useEffect, useRef, useState } from "react";
import { Program } from "./program";
import { useHistory } from "./useHistory";
import { Tips } from "./tips";
import { useStd } from "./useStd";

interface InterpreterProps {
  focus?: number; // a random number to trigger a useEffect dep
  onResult?: () => void; // pipe out
}
export type Line = { type: LineType; value: string };
type LineType = "out" | "err" | "info" | "usr" | "usr-tmp";
export const Interpreter: React.FC<InterpreterProps> = ({ focus }) => {
  const cursor = useRef<HTMLInputElement>(null);
  const terminal = useRef<HTMLDivElement>(null);
  const program = useRef<Program>();

  const [userInputBuffer, setUserInputBuffer] = useState("");
  const [lines, setLines] = useState<Line[]>([
    { type: "out", value: "Hello there. type 'help' for a nice intro." },
  ]);

  useEffect(() => {
    program.current = new Program();
  }, []);
  useStd(program, "out", setLines);
  useStd(program, "err", setLines);
  useStd(program, "info", setLines);

  const [userHistory, { back, forward, add }] = useHistory();
  useEffect(() => {
    if (!!userHistory) {
      setUserInputBuffer(userHistory);
      return;
    }

    setUserInputBuffer("");
  }, [userHistory]);

  const scrollToBottom = () => {
    // @ts-ignore
    cursor.current?.scrollIntoView({ behavior: "instant", block: "end", inline: "nearest" });
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

  const handleUpdateUsrTmp = () => {
    setLines((p) =>
      p.map((l) => {
        if (l.type !== "usr-tmp") return l;
        return { type: "usr", value: l.value };
      })
    );
  };

  const handleMultiline = () => {
    handleSetStdout(userInputBuffer, "usr-tmp");
    // record history
    add(userInputBuffer);

    setUserInputBuffer("");
  };

  const collectPrevMultilineUserInput = (currentLine: string) => {
    let lastGroupIdx = undefined;
    for (let ri = lines.length - 1; ri >= 0; ri--) {
      if (lines[ri].type !== "usr-tmp") break;
      lastGroupIdx = ri;
    }
    if (!lastGroupIdx) return currentLine;

    const multilines = lines.slice(lastGroupIdx);
    return [...multilines.map((ml) => ml.value), currentLine].join("\n").trim();
  };

  const handleSendCode = () => {
    if (userInputBuffer === "clear") {
      handleClearStdout();
      setUserInputBuffer("");
      program.current?.clearStd();
      return;
    }

    const multilineInput = collectPrevMultilineUserInput(userInputBuffer);
    handleSetStdout(userInputBuffer, "usr");

    // record history
    add(userInputBuffer);

    // interpret
    const result = program.current?.input(multilineInput);
    result && handleSetStdout(result);
    setUserInputBuffer("");
    handleUpdateUsrTmp();
    setTimeout(() => {
      scrollToBottom();
    }, 300);
  };

  const handleKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey === true) {
        handleMultiline();
      } else {
        handleSendCode();
      }
    }

    if (e.key === "ArrowUp") {
      back();
      e.preventDefault();
    }
    if (e.key === "ArrowDown") {
      forward();
      e.preventDefault();
    }
  };

  const handleUserInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInputBuffer(e.target.value);
    scrollToBottom();
  };

  return (
    <div className="relative bg-stone-900 w-full h-full text-slate-300 sm:rounded-lg p-6 border border-zinc-200 text-sm font-mono">
      <div ref={terminal} className="h-full overflow-auto flex flex-col">
        {lines.map((s, i) => {
          const styles: { [key in LineType]: string } = {
            out: "text-slate-300",
            err: "text-red-500",
            usr: "text-sky-600",
            "usr-tmp": "text-sky-800",
            info: "text-orange-700 text-[11px] leading-[13px] select-none",
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
          onKeyDown={handleKeydown}
          className="bg-transparent text-sky-500 w-full outline-none pb-1"
          value={userInputBuffer}
          placeholder=">_"
        />
        <div className="text-[10px] leading-[10px] italic font-bold text-gray-700 mt-0 select-none group">
          <span>shift to multiline</span>
          <Tips />
        </div>
        <div onClick={() => handleFocusOnCursor()} className="flex flex-grow h-full">
          {" "}
        </div>
      </div>
    </div>
  );
};
