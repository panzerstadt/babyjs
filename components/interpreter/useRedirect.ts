import { MutableRefObject, useEffect } from "react";
import { Program } from "./program";

const removeTimestamp = (str: string) => {
  const length = Date.now().toString().length + ":".length;
  return str.slice(length);
};

export const useRedirect = (ref: MutableRefObject<Program | undefined>, newtab?: boolean) => {
  const currentRef = ref.current?.urlredirect;
  useEffect(() => {
    if (!currentRef) return;

    let path = removeTimestamp(currentRef);
    if (!path.startsWith("http")) {
      path = `https://${path}`;
    }
    window.open(path, newtab ? "_blank" : "_self");
  }, [currentRef, newtab]);
};
