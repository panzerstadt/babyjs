import { useState } from "react";
import { colorLuminance } from "./utils";

interface SoftShadowClasses {
  outside: { background: string; boxShadow: string };
  inside: { boxShadow: string };
}

const colorDiff = 0.15; // ?
const distance = 20; // controls how blurred the shadow is
/**
 * possible make pos x and y controllable with a mouse pos
 */
const DEFAULT_LIGHTSOURCE = {
  positionX: distance,
  positionY: distance,
  angle: 145, // TODO: calculate angle by (posX, posY) vs current item's angle
};

export const useSoftShadow = ({
  color = "#E5E7EB",
  blur = 60,
  lightSource = DEFAULT_LIGHTSOURCE,
  gradientBG = false,
}): [SoftShadowClasses, Function] => {
  const [clr, setClr] = useState(color);
  const darkClr = colorLuminance(clr, colorDiff * -1);
  const lightClr = colorLuminance(clr, colorDiff);
  const angle = lightSource.angle;
  const firstGradientClr = colorLuminance(clr, -0.1); // TODO: flip depending on light source
  const secondGradientClr = colorLuminance(clr, 0.07); // TODO: flip depending on light source
  const X = lightSource.positionX;
  const Y = lightSource.positionY;
  const XOpposite = X * -1;
  const YOpposite = Y * -1;

  const boxShadow = `${X}px ${Y}px ${blur}px ${darkClr}, ${XOpposite}px ${YOpposite}px ${blur}px ${lightClr}`;
  const insetBoxShadow = `
  inset 
  ${X * 2}px ${Y * 2}px ${blur * 2}px ${darkClr},
  ${XOpposite * 2}px ${YOpposite * 2}px ${blur * 2}px ${lightClr}`;

  const background = gradientBG
    ? `linear-gradient(${angle}deg, ${firstGradientClr}, ${secondGradientClr})`
    : `${clr}`;

  return [
    {
      outside: { boxShadow, background },
      inside: { boxShadow: insetBoxShadow },
    } as SoftShadowClasses,
    setClr,
  ];
};
