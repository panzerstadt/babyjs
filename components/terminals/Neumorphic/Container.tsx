import React, { useEffect } from "react";
import { useSoftShadow } from "./useSoftShadow";
import { TWGrayColors, twGrayToHex } from "./utils";

interface Props {
  additionalClasses?: string;
  roundedClass:
    | "rounded"
    | "rounded-sm"
    | "rounded-md"
    | "rounded-lg"
    | "rounded-xl"
    | "rounded-2xl";
  distance: number;
  bgColor: TWGrayColors;
  bordered?: boolean;
  borderedDark?: boolean;
}

/**
 *  thanks to neumorphism: https://neumorphism.io/
 *
 */
export const Container: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  additionalClasses,
  roundedClass,
  distance,
  bgColor,
  bordered,
  borderedDark,
}) => {
  const blur = distance * 2;
  const [softShadowStyles, setColor] = useSoftShadow({
    color: twGrayToHex[bgColor],
    blur: blur,
    lightSource: { positionX: distance, positionY: distance, angle: 200 },
  });

  useEffect(() => {
    setColor(twGrayToHex[bgColor]);
  }, [bgColor]);

  return (
    <div
      key="terminal-container-outside-component"
      className={`
        rounded h-full w-full overflow-hidden
        ${bordered && " border-4 border-zinc-200"}
        ${borderedDark && " border-2 border-slate-700"}
        ${roundedClass || ""} 
        ${additionalClasses || ""}
      `}
      style={{
        ...softShadowStyles.outside,
      }}
    >
      {children}
    </div>
  );
};
