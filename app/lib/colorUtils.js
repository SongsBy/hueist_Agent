// app/lib/colorUtils.js
import chroma from "chroma-js";
import ColorContrastChecker from "color-contrast-checker";

const WCAG_AA_RATIO = 4.5;
const ccc = new ColorContrastChecker();

const isValidHex = (hex) =>
  typeof hex === "string" && /^#([0-9A-Fa-f]{3}){1,2}$/.test(hex);

export function checkContrast(backgroundHex, textHex) {
  if (!isValidHex(backgroundHex) || !isValidHex(textHex)) return false;
  return ccc.isLevelAA(backgroundHex, textHex, 14);
}

const SCALE_WEIGHTS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const PALETTE_KEYS = ["primary", "secondary", "tertiary", "surface", "background"];

export function generateColorScale(baseHex) {
  if (!isValidHex(baseHex)) return null;

  const base = chroma(baseHex);
  const luminance = base.luminance();
  // Dark seeds map to 600 so the scale keeps headroom for lighter tints;
  // everything else anchors at 500 (Tailwind-style brand position).
  const anchorWeight = luminance < 0.2 ? 600 : 500;

  // Tinted off-white / off-black ends — carry a touch of the base hue
  // so the scale feels cohesive instead of bleaching to pure #fff/#000.
  const lightEnd = chroma.mix("#ffffff", base, 0.06, "lch");
  const darkEnd = chroma.mix("#000000", base, 0.12, "lch");

  const scale = chroma
    .scale([lightEnd, base, darkEnd])
    .mode("lch")
    .domain([50, anchorWeight, 950]);

  return SCALE_WEIGHTS.reduce((acc, weight) => {
    acc[weight] = scale(weight).hex();
    return acc;
  }, {});
}

export function enrichPalette(colors) {
  if (!colors || typeof colors !== "object") return {};

  return PALETTE_KEYS.reduce((acc, key) => {
    const scale = generateColorScale(colors[key]);
    if (scale) acc[key] = scale;
    return acc;
  }, {});
}

// HEX → 사람이 읽을 수 있는 색상명(한국어/영어)으로 변환한다.
// 결과 페이지 컬러 팔레트 카드의 "딥 블루 (Deep Blue)" 같은 라벨에 쓰인다.
// 동적 톤 데이터에는 색 이름이 없으므로 HSL 기반 휴리스틱으로 추론한다.
const HUE_NAMES = [
  { max: 15, ko: "레드", en: "Red" },
  { max: 40, ko: "오렌지", en: "Orange" },
  { max: 65, ko: "옐로우", en: "Yellow" },
  { max: 90, ko: "라임", en: "Lime" },
  { max: 150, ko: "그린", en: "Green" },
  { max: 185, ko: "틸", en: "Teal" },
  { max: 200, ko: "시안", en: "Cyan" },
  { max: 240, ko: "블루", en: "Blue" },
  { max: 260, ko: "인디고", en: "Indigo" },
  { max: 290, ko: "바이올렛", en: "Violet" },
  { max: 330, ko: "퍼플", en: "Purple" },
  { max: 345, ko: "핑크", en: "Pink" },
  { max: 360, ko: "레드", en: "Red" },
];

export function describeColor(hex) {
  if (!isValidHex(hex)) return { ko: "컬러", en: "Color" };

  const [h, s, l] = chroma(hex).hsl();

  // 무채색(회색 계열): 채도가 매우 낮거나 hue가 정의되지 않은 경우.
  if (Number.isNaN(h) || s < 0.12) {
    if (l < 0.28) return { ko: "차콜 그레이", en: "Charcoal Gray" };
    if (l < 0.45) return { ko: "다크 그레이", en: "Dark Gray" };
    if (l < 0.65) return { ko: "미디엄 그레이", en: "Gray" };
    if (l < 0.85) return { ko: "라이트 그레이", en: "Light Gray" };
    return { ko: "오프 화이트", en: "Off White" };
  }

  // 베이지: 노란빛 + 낮은 채도 + 높은 명도.
  if (h >= 35 && h <= 70 && s < 0.6 && l > 0.8) {
    return { ko: "라이트 베이지", en: "Light Beige" };
  }

  const hue = HUE_NAMES.find((entry) => h < entry.max) ?? HUE_NAMES.at(-1);

  let koPrefix = "";
  let enPrefix = "";
  if (l < 0.3) {
    koPrefix = "딥 ";
    enPrefix = "Deep ";
  } else if (l > 0.82) {
    koPrefix = "라이트 ";
    enPrefix = "Light ";
  } else if (s > 0.6 && l < 0.55) {
    koPrefix = "브라이트 ";
    enPrefix = "Bright ";
  }

  return {
    ko: `${koPrefix}${hue.ko}`.trim(),
    en: `${enPrefix}${hue.en}`.trim(),
  };
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
