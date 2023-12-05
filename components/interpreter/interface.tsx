import { useEffect, useRef, useState } from "react";
import { Language, Program, StdEnvs } from "./program";
import { useHistory } from "./useHistory";
import { Tips } from "./tips";
import { useStd } from "./useStd";
import { Container } from "../terminals/Neumorphic/Container";
import { useRedirect } from "./useRedirect";

export type Line = { type: LineType; value: string };
type LineType = StdEnvs | "usr" | "usr-tmp";
const TABS = 4;
const makeIntro: (lang: Language) => Line = (lang) => ({
  type: "out",
  value: `Hello there, I'm ${lang}! try calling 'help();' for a nice intro.`,
});

interface ReplProps {
  lang: Language;
  focus?: number; // a random number to trigger a useEffect dep
  onResult?: () => void; // pipe out
}
export const Repl: React.FC<ReplProps> = ({ focus, lang }) => {
  const cursor = useRef<HTMLInputElement>(null);
  const program = useRef<Program>();

  const [userInputBuffer, setUserInputBuffer] = useState("");
  const [lines, setLines] = useState<Line[]>([makeIntro(lang)]);

  useEffect(() => { program.current = new Program(lang) }, [lang]); // prettier-ignore
  useStd(program, "out", setLines, () => scrollToBottom());
  useStd(program, "debug", setLines, () => scrollToBottom()); // vvvv
  useStd(program, "err", setLines, () => scrollToBottom(), true);
  useStd(program, "info", setLines, () => scrollToBottom(), true);
  useRedirect(program, true);

  const [userHistory, { back, forward, add, addBatch }] = useHistory();
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

  const handleSetStdoutBatch = (lines: string[], type?: LineType) => {
    setLines((p) => [...p, ...lines.map((l) => ({ type: type ?? "out", value: l }))]);
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

  const [toggledMultiline, setToggledMultiline] = useState(false);
  const handleKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey === true) {
        handleMultiline();
      } else if (toggledMultiline === true) {
        handleMultiline();
      } else {
        handleSendCode();
      }
    }
    if (e.key === "Tab") {
      if (e.shiftKey === false) {
        setUserInputBuffer((p) => p + Array(TABS + 1).join(" "));
      }
      e.preventDefault();
    }

    // switch inline/multiline modes
    if (e.key === "Shift" && e.ctrlKey === true) {
      setToggledMultiline((p) => !p);
      e.preventDefault();
    }

    // history
    if (e.key === "ArrowUp") { back(); e.preventDefault(); } // prettier-ignore
    if (e.key === "ArrowDown") { forward(); e.preventDefault(); } // prettier-ignore
  };

  const handleUserInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInputBuffer(e.target.value);
    scrollToBottom();
  };

  const handleUserPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const data = e.clipboardData.getData("text");
    const lines = data.split("\n").filter(Boolean);

    handleSetStdoutBatch(lines, "usr-tmp");
    addBatch(lines);

    e.preventDefault();
  };

  const styles: { [key in LineType]: string } = {
    out: "text-slate-300",
    debug: "text-slate-400",
    env: "text-slate-400",
    err: "text-red-500",
    usr: "text-sky-600",
    "usr-tmp": "text-sky-800",
    info: "text-orange-700 text-[11px] leading-[13px] select-none",
  };

  return (
    <Container
      key="terminal-container"
      bgColor="bg-stone-200"
      roundedClass="rounded-xl"
      distance={5}
      bordered
    >
      <div className="relative bg-stone-900 w-full h-full text-slate-300 sm:rounded-lg p-6 border border-zinc-200 text-sm font-mono">
        <div className="h-full overflow-auto flex flex-col">
          {lines
            .filter((l) => l.type !== "debug")
            .map((s, i) => {
              return (
                <code
                  key={i}
                  className={`
                ${styles[s.type]} hover:bg-slate-800
                animate-fade whitespace-break-spaces`}
                >
                  {s.value}
                </code>
              );
            })}
          {lines
            .filter((l) => l.type === "debug")
            .map((s, i) => {
              return (
                <code
                  key={i}
                  className={`
                ${styles[s.type]} hover:bg-slate-800
                animate-fade whitespace-break-spaces`}
                >
                  {s.value}
                </code>
              );
            })}
          <div className="flex items-start">
            <input
              ref={cursor}
              onChange={handleUserInput}
              onKeyDown={handleKeydown}
              onPasteCapture={handleUserPaste}
              className="bg-transparent text-sky-500 w-full outline-none pb-5"
              value={userInputBuffer}
              placeholder=">_"
            />
            {toggledMultiline && (
              <button
                onClick={() => handleSendCode()}
                className="text-sky-400 text-[10px] px-2 border border-sky-800 hover:bg-sky-400 hover:text-white rounded-md"
              >
                send
              </button>
            )}
          </div>
          <div className="-mt-4 text-[10px] leading-[10px] italic font-bold text-gray-700 select-none group">
            <span>
              <span>shift + enter to </span>
              <span className={toggledMultiline ? "text-yellow-300" : ""}>multiline</span>
              <span>, ctrl + shift to toggle</span>
            </span>
            <Tips />
          </div>
          <div onClick={() => handleFocusOnCursor()} className="flex flex-grow h-full">
            {" "}
          </div>
        </div>
      </div>
    </Container>
  );
};

interface EditorProps {
  lang: Language;
  focus?: number; // a random number to trigger a useEffect dep
  input?: Record<string, unknown>;
}

export const Editor: React.FC<EditorProps> = ({ focus, lang, input }) => {
  const cursor = useRef<HTMLInputElement>(null);
  const program = useRef<Program>();
  const [lines, setLines] = useState<Line[]>([]);
  useEffect(() => { program.current = new Program(lang) }, [lang]); // prettier-ignore
  useStd(program, "out", setLines, () => scrollToBottom(), false, "replace");
  useStd(program, "err", setLines, () => scrollToBottom(), true, "replace");

  const scrollToBottom = () => {
    // @ts-ignore
    cursor.current?.scrollIntoView({ behavior: "instant", block: "end", inline: "nearest" });
    setLines((p) => [...p, { type: "out", value: "" }]);
  };

  const [userInput, setUserInput] = useState("");
  const handleUpdateInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };
  const handleAppendStdout = (newOutput: string, type?: LineType) => {
    setLines((p) => [...p, { type: type ?? "out", value: newOutput }]);
  };

  const handleSendCode = () => {
    // interpret
    const result = program.current?.input(userInput);
    result && handleAppendStdout(result);

    scrollToBottom();
  };

  const [isShiftKeyHeld, setIsShiftKeyHeld] = useState(false);
  const handleKeydown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.shiftKey === true) {
      setIsShiftKeyHeld(true);
    }

    if (e.key === "Enter") {
      if (e.shiftKey === true) {
        handleSendCode();
        e.preventDefault();
      }
    }
  };
  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    setIsShiftKeyHeld(false);
  };

  const styles: { [key in LineType]: string } = {
    out: "text-slate-800",
    debug: "text-slate-600",
    env: "text-slate-400",
    err: "text-red-500",
    usr: "text-sky-600",
    "usr-tmp": "text-sky-800",
    info: "text-orange-700 text-[11px] leading-[13px] select-none",
  };

  return (
    <div className="flex flex-col h-full mt-1">
      <Container
        key="terminal-container"
        bgColor="bg-stone-200"
        roundedClass="rounded-xl"
        distance={5}
        bordered
      >
        <div className="bg-slate-900 h-full relative text-red-500">
          <textarea
            onKeyDownCapture={handleKeydown}
            onKeyUpCapture={handleKeyUp}
            onChange={handleUpdateInput}
            rows={10}
            className="h-full w-full bg-slate-900 p-3 text-white font-mono"
          ></textarea>
          <button
            onClick={() => handleSendCode()}
            className={`
            absolute bottom-2 right-2  text-[10px] px-2 
            border
            ${isShiftKeyHeld ? "bg-sky-500 text-sky-900" : ""}
            text-sky-400 hover:text-white
            border-sky-800 hover:bg-sky-400  
            rounded-md
            `}
          >
            send
          </button>
        </div>
      </Container>
      <div ref={cursor} className="h-8 w-full flex flex-col">
        {lines.map((s, i) => {
          return (
            <code
              key={i}
              className={`
              ${styles[s.type]} hover:bg-slate-300
                animate-fade whitespace-break-spaces`}
            >
              {s.value}
            </code>
          );
        })}
      </div>
    </div>
  );
};
