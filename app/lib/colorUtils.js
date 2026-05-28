// app/lib/colorUtils.js
import chroma from "chroma-js";
import ColorContrastChecker from "color-contrast-checker";
1;

const WCAG_AA_RATIO = 4.5;
const ccc = new ColorContrastChecker();

const isValidHex = (hex) =>
  typeof hex === "string" && /^#([0-9A-Fa-f]{3}){1,2}$/.test(hex);

export function checkContrast(backgroundHex, textHex) {
  if (!isValidHex(backgroundHex) || !isValidHex(textHex)) return false;
  return ccc.isLevelAA(backgroundHex, textHex, 14);
}

export function adjustColorForContrast(backgroundHex, textHex) {
  if (!isValidHex(backgroundHex) || !isValidHex(textHex)) return textHex;
  if (checkContrast(backgroundHex, textHex)) return textHex;

  const bgLuminance = chroma(backgroundHex).luminance();
  const goDarker = bgLuminance > 0.5;

  let candidate = chroma(textHex);
  const step = 0.05;
  const maxIterations = 20;

  for (let i = 0; i < maxIterations; i += 1) {
    const ratio = chroma.contrast(candidate, backgroundHex);
    if (ratio >= WCAG_AA_RATIO) return candidate.hex();

    const currentL = candidate.get("hsl.l");
    const nextL = goDarker
      ? Math.max(0, currentL - step)
      : Math.min(1, currentL + step);
    candidate = candidate.set("hsl.l", nextL);

    if (nextL === 0 || nextL === 1) break;
  }

  return goDarker ? "#000000" : "#FFFFFF";
}
