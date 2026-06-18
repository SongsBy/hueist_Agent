// app/lib/tailwindToInline.js
//
// 3-Step UI 파이프라인의 Step 1: 결정론적 전처리기(Deterministic Preprocessor).
//
// 배경: 베이스 템플릿(app/components/templates/*.jsx)은 Tailwind 클래스로 작성돼
// 있다. 그러나 생성 런타임(react-live noInline)은 Tailwind 를 컴파일하지 못하므로,
// 지금까지는 LLM 에게 "Tailwind → 인라인 style 번역"을 매번 시켰다. 이건 토큰·지연을
// 낭비하는 비결정적 작업이다. 이 모듈이 그 번역을 빌드/요청 전에 결정론적으로 끝낸다.
//
// 핵심 동작:
//   - className="..." (정적) 과 className={`...`} (템플릿 리터럴)의 정적 클래스 토큰을
//     Tailwind 매핑 사전/파서로 인라인 style 객체로 변환한다.
//   - 같은 태그에 이미 style={{ ... }} 가 있으면 그 안에 병합한다(동적 값 `${x}` 보존).
//   - 템플릿 리터럴의 동적 ${...} 구간(대부분 상태별 색/굵기 토글)은 드롭한다 —
//     레이아웃 의도는 정적 토큰에 있고, 색은 어차피 LLM 이 톤으로 다시 칠한다.
//   - 알 수 없는 클래스는 조용히 버린다(절대 throw 하지 않는다). best-effort 변환.
//
// 산출물은 "실행 코드"가 아니라 "LLM 에게 줄 인라인-스타일 청사진"이다. 색상 값은
// 표준 Tailwind 팔레트 HEX 플레이스홀더로 박히고, LLM 이 이를 톤 토큰으로 교체한다.

// ─────────────────────────────────────────────────────────────────────────────
// 1) Tailwind 토큰 테이블
// ─────────────────────────────────────────────────────────────────────────────

// 간격 스케일(rem → px, 1단위 = 4px). 'px' = 1px.
const SPACING = {
  0: 0, px: 1, 0.5: 2, 1: 4, 1.5: 6, 2: 8, 2.5: 10, 3: 12, 3.5: 14,
  4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 9: 36, 10: 40, 11: 44, 12: 48,
  14: 56, 16: 64, 20: 80, 24: 96, 28: 112, 32: 128, 36: 144, 40: 160,
  44: 176, 48: 192, 52: 208, 56: 224, 60: 240, 64: 256, 72: 288, 80: 320, 96: 384,
};

// 표준 Tailwind v3 색 팔레트(family-shade → HEX). 색은 LLM 이 교체할 플레이스홀더다.
const PALETTE = {
  white: "#ffffff", black: "#000000",
  slate: { 50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0", 300: "#cbd5e1", 400: "#94a3b8", 500: "#64748b", 600: "#475569", 700: "#334155", 800: "#1e293b", 900: "#0f172a", 950: "#020617" },
  gray: { 50: "#f9fafb", 100: "#f3f4f6", 200: "#e5e7eb", 300: "#d1d5db", 400: "#9ca3af", 500: "#6b7280", 600: "#4b5563", 700: "#374151", 800: "#1f2937", 900: "#111827", 950: "#030712" },
  zinc: { 50: "#fafafa", 100: "#f4f4f5", 200: "#e4e4e7", 300: "#d4d4d8", 400: "#a1a1aa", 500: "#71717a", 600: "#52525b", 700: "#3f3f46", 800: "#27272a", 900: "#18181b", 950: "#09090b" },
  neutral: { 50: "#fafafa", 100: "#f5f5f5", 200: "#e5e5e5", 300: "#d4d4d4", 400: "#a3a3a3", 500: "#737373", 600: "#525252", 700: "#404040", 800: "#262626", 900: "#171717", 950: "#0a0a0a" },
  stone: { 50: "#fafaf9", 100: "#f5f5f4", 200: "#e7e5e4", 300: "#d6d3d1", 400: "#a8a29e", 500: "#78716c", 600: "#57534e", 700: "#44403c", 800: "#292524", 900: "#1c1917", 950: "#0c0a09" },
  red: { 50: "#fef2f2", 100: "#fee2e2", 200: "#fecaca", 300: "#fca5a5", 400: "#f87171", 500: "#ef4444", 600: "#dc2626", 700: "#b91c1c", 800: "#991b1b", 900: "#7f1d1d", 950: "#450a0a" },
  orange: { 50: "#fff7ed", 100: "#ffedd5", 200: "#fed7aa", 300: "#fdba74", 400: "#fb923c", 500: "#f97316", 600: "#ea580c", 700: "#c2410c", 800: "#9a3412", 900: "#7c2d12", 950: "#431407" },
  amber: { 50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d", 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706", 700: "#b45309", 800: "#92400e", 900: "#78350f", 950: "#451a03" },
  yellow: { 50: "#fefce8", 100: "#fef9c3", 200: "#fef08a", 300: "#fde047", 400: "#facc15", 500: "#eab308", 600: "#ca8a04", 700: "#a16207", 800: "#854d0e", 900: "#713f12", 950: "#422006" },
  lime: { 50: "#f7fee7", 100: "#ecfccb", 200: "#d9f99d", 300: "#bef264", 400: "#a3e635", 500: "#84cc16", 600: "#65a30d", 700: "#4d7c0f", 800: "#3f6212", 900: "#365314", 950: "#1a2e05" },
  green: { 50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 300: "#86efac", 400: "#4ade80", 500: "#22c55e", 600: "#16a34a", 700: "#15803d", 800: "#166534", 900: "#14532d", 950: "#052e16" },
  emerald: { 50: "#ecfdf5", 100: "#d1fae5", 200: "#a7f3d0", 300: "#6ee7b7", 400: "#34d399", 500: "#10b981", 600: "#059669", 700: "#047857", 800: "#065f46", 900: "#064e3b", 950: "#022c22" },
  teal: { 50: "#f0fdfa", 100: "#ccfbf1", 200: "#99f6e4", 300: "#5eead4", 400: "#2dd4bf", 500: "#14b8a6", 600: "#0d9488", 700: "#0f766e", 800: "#115e59", 900: "#134e4a", 950: "#042f2e" },
  cyan: { 50: "#ecfeff", 100: "#cffafe", 200: "#a5f3fc", 300: "#67e8f9", 400: "#22d3ee", 500: "#06b6d4", 600: "#0891b2", 700: "#0e7490", 800: "#155e75", 900: "#164e63", 950: "#083344" },
  sky: { 50: "#f0f9ff", 100: "#e0f2fe", 200: "#bae6fd", 300: "#7dd3fc", 400: "#38bdf8", 500: "#0ea5e9", 600: "#0284c7", 700: "#0369a1", 800: "#075985", 900: "#0c4a6e", 950: "#082f49" },
  blue: { 50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 300: "#93c5fd", 400: "#60a5fa", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af", 900: "#1e3a8a", 950: "#172554" },
  indigo: { 50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe", 300: "#a5b4fc", 400: "#818cf8", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca", 800: "#3730a3", 900: "#312e81", 950: "#1e1b4b" },
  violet: { 50: "#f5f3ff", 100: "#ede9fe", 200: "#ddd6fe", 300: "#c4b5fd", 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9", 800: "#5b21b6", 900: "#4c1d95", 950: "#2e1065" },
  purple: { 50: "#faf5ff", 100: "#f3e8ff", 200: "#e9d5ff", 300: "#d8b4fe", 400: "#c084fc", 500: "#a855f7", 600: "#9333ea", 700: "#7e22ce", 800: "#6b21a8", 900: "#581c87", 950: "#3b0764" },
  fuchsia: { 50: "#fdf4ff", 100: "#fae8ff", 200: "#f5d0fe", 300: "#f0abfc", 400: "#e879f9", 500: "#d946ef", 600: "#c026d3", 700: "#a21caf", 800: "#86198f", 900: "#701a75", 950: "#4a044e" },
  pink: { 50: "#fdf2f8", 100: "#fce7f3", 200: "#fbcfe8", 300: "#f9a8d4", 400: "#f472b6", 500: "#ec4899", 600: "#db2777", 700: "#be185d", 800: "#9d174d", 900: "#831843", 950: "#500724" },
  rose: { 50: "#fff1f2", 100: "#ffe4e6", 200: "#fecdd3", 300: "#fda4af", 400: "#fb7185", 500: "#f43f5e", 600: "#e11d48", 700: "#be123c", 800: "#9f1239", 900: "#881337", 950: "#4c0519" },
};

const FONT_SIZE = {
  "text-xs": [12, 16], "text-sm": [14, 20], "text-base": [16, 24], "text-lg": [18, 28],
  "text-xl": [20, 28], "text-2xl": [24, 32], "text-3xl": [30, 36], "text-4xl": [36, 40],
  "text-5xl": [48, 1], "text-6xl": [60, 1], "text-7xl": [72, 1],
};

const FONT_WEIGHT = {
  "font-thin": 100, "font-extralight": 200, "font-light": 300, "font-normal": 400,
  "font-medium": 500, "font-semibold": 600, "font-bold": 700, "font-extrabold": 800, "font-black": 900,
};

const RADIUS = { "": 4, sm: 2, md: 6, lg: 8, xl: 12, "2xl": 16, "3xl": 24, full: 9999, none: 0 };

const SHADOW = {
  "shadow-sm": "0 1px 2px 0 rgba(0,0,0,0.05)",
  shadow: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
  "shadow-md": "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
  "shadow-lg": "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
  "shadow-xl": "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
  "shadow-2xl": "0 25px 50px -12px rgba(0,0,0,0.25)",
  "shadow-inner": "inset 0 2px 4px 0 rgba(0,0,0,0.05)",
  "shadow-none": "none",
};

const BACKDROP_BLUR = {
  "backdrop-blur-none": 0, "backdrop-blur-sm": 4, "backdrop-blur": 8, "backdrop-blur-md": 12,
  "backdrop-blur-lg": 16, "backdrop-blur-xl": 24, "backdrop-blur-2xl": 40, "backdrop-blur-3xl": 64,
};

// 매개변수 없는 고정 매핑.
const STATIC = {
  // display / flex
  flex: { display: "flex" }, "inline-flex": { display: "inline-flex" },
  grid: { display: "grid" }, "inline-grid": { display: "inline-grid" },
  block: { display: "block" }, "inline-block": { display: "inline-block" },
  inline: { display: "inline" }, hidden: { display: "none" }, contents: { display: "contents" },
  "flex-row": { flexDirection: "row" }, "flex-row-reverse": { flexDirection: "row-reverse" },
  "flex-col": { flexDirection: "column" }, "flex-col-reverse": { flexDirection: "column-reverse" },
  "flex-wrap": { flexWrap: "wrap" }, "flex-nowrap": { flexWrap: "nowrap" },
  "flex-1": { flex: "1 1 0%" }, "flex-auto": { flex: "1 1 auto" }, "flex-initial": { flex: "0 1 auto" }, "flex-none": { flex: "none" },
  grow: { flexGrow: 1 }, "grow-0": { flexGrow: 0 }, shrink: { flexShrink: 1 }, "shrink-0": { flexShrink: 0 },
  // align / justify
  "items-start": { alignItems: "flex-start" }, "items-end": { alignItems: "flex-end" },
  "items-center": { alignItems: "center" }, "items-baseline": { alignItems: "baseline" }, "items-stretch": { alignItems: "stretch" },
  "justify-start": { justifyContent: "flex-start" }, "justify-end": { justifyContent: "flex-end" },
  "justify-center": { justifyContent: "center" }, "justify-between": { justifyContent: "space-between" },
  "justify-around": { justifyContent: "space-around" }, "justify-evenly": { justifyContent: "space-evenly" },
  "content-center": { alignContent: "center" }, "content-between": { alignContent: "space-between" },
  "self-start": { alignSelf: "flex-start" }, "self-end": { alignSelf: "flex-end" },
  "self-center": { alignSelf: "center" }, "self-stretch": { alignSelf: "stretch" }, "self-auto": { alignSelf: "auto" },
  // position
  static: { position: "static" }, fixed: { position: "fixed" }, absolute: { position: "absolute" },
  relative: { position: "relative" }, sticky: { position: "sticky" },
  "inset-0": { top: 0, right: 0, bottom: 0, left: 0 },
  // overflow
  "overflow-auto": { overflow: "auto" }, "overflow-hidden": { overflow: "hidden" },
  "overflow-visible": { overflow: "visible" }, "overflow-scroll": { overflow: "scroll" },
  "overflow-x-auto": { overflowX: "auto" }, "overflow-y-auto": { overflowY: "auto" },
  "overflow-x-hidden": { overflowX: "hidden" }, "overflow-y-hidden": { overflowY: "hidden" },
  "overflow-x-scroll": { overflowX: "scroll" }, "overflow-y-scroll": { overflowY: "scroll" },
  // object-fit / position
  "object-cover": { objectFit: "cover" }, "object-contain": { objectFit: "contain" },
  "object-fill": { objectFit: "fill" }, "object-none": { objectFit: "none" }, "object-scale-down": { objectFit: "scale-down" },
  "object-center": { objectPosition: "center" }, "object-top": { objectPosition: "top" }, "object-bottom": { objectPosition: "bottom" },
  // text align / transform / decoration
  "text-left": { textAlign: "left" }, "text-center": { textAlign: "center" },
  "text-right": { textAlign: "right" }, "text-justify": { textAlign: "justify" },
  uppercase: { textTransform: "uppercase" }, lowercase: { textTransform: "lowercase" },
  capitalize: { textTransform: "capitalize" }, "normal-case": { textTransform: "none" },
  underline: { textDecorationLine: "underline" }, "line-through": { textDecorationLine: "line-through" },
  "no-underline": { textDecorationLine: "none" }, italic: { fontStyle: "italic" }, "not-italic": { fontStyle: "normal" },
  // font family
  "font-sans": { fontFamily: "ui-sans-serif, system-ui, sans-serif" },
  "font-serif": { fontFamily: "ui-serif, Georgia, serif" },
  "font-mono": { fontFamily: "ui-monospace, monospace" },
  // whitespace / wrapping
  truncate: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  "whitespace-nowrap": { whiteSpace: "nowrap" }, "whitespace-normal": { whiteSpace: "normal" },
  "whitespace-pre": { whiteSpace: "pre" }, "whitespace-pre-wrap": { whiteSpace: "pre-wrap" },
  "break-words": { overflowWrap: "break-word" }, "break-all": { wordBreak: "break-all" },
  // common sizes
  "w-full": { width: "100%" }, "h-full": { height: "100%" }, "w-screen": { width: "100vw" },
  "h-screen": { height: "100vh" }, "w-auto": { width: "auto" }, "h-auto": { height: "auto" },
  "w-fit": { width: "fit-content" }, "h-fit": { height: "fit-content" },
  "min-h-screen": { minHeight: "100vh" }, "min-h-full": { minHeight: "100%" }, "min-w-0": { minWidth: 0 },
  "max-w-full": { maxWidth: "100%" }, "max-h-full": { maxHeight: "100%" },
  // auto margins
  "mx-auto": { marginLeft: "auto", marginRight: "auto" }, "my-auto": { marginTop: "auto", marginBottom: "auto" },
  "ml-auto": { marginLeft: "auto" }, "mr-auto": { marginRight: "auto" }, "m-auto": { margin: "auto" },
  // misc
  "box-border": { boxSizing: "border-box" }, "box-content": { boxSizing: "content-box" },
  "cursor-pointer": { cursor: "pointer" }, "select-none": { userSelect: "none" },
  "aspect-square": { aspectRatio: "1 / 1" }, "aspect-video": { aspectRatio: "16 / 9" },
  "fill-current": { fill: "currentColor" }, "stroke-current": { stroke: "currentColor" },
  transition: { transition: "all 200ms ease" }, "transition-all": { transition: "all 200ms ease" },
  "transition-colors": { transition: "color 200ms ease, background-color 200ms ease, border-color 200ms ease" },
  "transition-transform": { transition: "transform 200ms ease" }, "transition-opacity": { transition: "opacity 200ms ease" },
  // tracking / leading words
  "tracking-tighter": { letterSpacing: "-0.05em" }, "tracking-tight": { letterSpacing: "-0.025em" },
  "tracking-normal": { letterSpacing: "0" }, "tracking-wide": { letterSpacing: "0.025em" },
  "tracking-wider": { letterSpacing: "0.05em" }, "tracking-widest": { letterSpacing: "0.1em" },
  "leading-none": { lineHeight: 1 }, "leading-tight": { lineHeight: 1.25 }, "leading-snug": { lineHeight: 1.375 },
  "leading-normal": { lineHeight: 1.5 }, "leading-relaxed": { lineHeight: 1.625 }, "leading-loose": { lineHeight: 2 },
};

// 그라데이션 방향(bg-gradient-to-X → CSS 방향).
const GRADIENT_DIR = {
  t: "to top", tr: "to top right", r: "to right", br: "to bottom right",
  b: "to bottom", bl: "to bottom left", l: "to left", tl: "to top left",
};

// ─────────────────────────────────────────────────────────────────────────────
// 2) 값 해석 헬퍼
// ─────────────────────────────────────────────────────────────────────────────

// '[72px]' / '[3/4]' / '[#0e0f13]' 같은 임의 값에서 대괄호 안을 꺼내고 '_'→' '.
function arbitrary(token) {
  if (token.startsWith("[") && token.endsWith("]")) {
    return token.slice(1, -1).replace(/_/g, " ");
  }
  return null;
}

// '#rrggbb' + 0~100 알파 → rgba(...). 정규화 불가 시 원본 반환.
function hexWithOpacity(hex, opacity) {
  const m = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return hex;
  let body = m[1];
  if (body.length === 3) body = body.split("").map((c) => c + c).join("");
  const r = parseInt(body.slice(0, 2), 16);
  const g = parseInt(body.slice(2, 4), 16);
  const b = parseInt(body.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${Math.round((opacity / 100) * 100) / 100})`;
}

// 'gray-400' / 'white' / 'white/80' / '[#0e0f13]' / '[rgba(..)]' → CSS 색 문자열 | null.
function resolveColor(raw) {
  if (!raw) return null;

  const arb = arbitrary(raw);
  if (arb !== null) return arb; // [#0e0f13] / [rgb(...)] 등 그대로.

  // 알파 수식어: 'white/80', 'gray-900/50'.
  let opacity = null;
  let name = raw;
  const slash = raw.lastIndexOf("/");
  if (slash !== -1) {
    const op = raw.slice(slash + 1);
    if (/^\d{1,3}$/.test(op)) {
      opacity = Number(op);
      name = raw.slice(0, slash);
    }
  }

  if (name === "transparent") return "transparent";
  if (name === "current" || name === "currentColor") return "currentColor";
  if (name === "inherit") return "inherit";

  let hex = null;
  if (name === "white" || name === "black") {
    hex = PALETTE[name];
  } else {
    const dash = name.lastIndexOf("-");
    if (dash !== -1) {
      const family = name.slice(0, dash);
      const shade = name.slice(dash + 1);
      const fam = PALETTE[family];
      if (fam && typeof fam === "object" && fam[shade]) hex = fam[shade];
    }
  }
  if (!hex) return null;

  return opacity !== null ? hexWithOpacity(hex, opacity) : hex;
}

// 간격/사이즈 raw → CSS 값(px 숫자 | '50%' | 'auto' | '12px' …) | null.
function resolveSize(raw, axis /* 'x' | 'y' | undefined */) {
  const arb = arbitrary(raw);
  if (arb !== null) return arb;

  switch (raw) {
    case "full": return "100%";
    case "screen": return axis === "y" ? "100vh" : "100vw";
    case "auto": return "auto";
    case "fit": return "fit-content";
    case "min": return "min-content";
    case "max": return "max-content";
    case "px": return 1;
    default: break;
  }

  // 분수: 1/2, 2/3 …
  const frac = /^(\d+)\/(\d+)$/.exec(raw);
  if (frac) {
    const pct = (Number(frac[1]) / Number(frac[2])) * 100;
    return `${Math.round(pct * 1e4) / 1e4}%`;
  }

  if (Object.prototype.hasOwnProperty.call(SPACING, raw)) return SPACING[raw];
  return null;
}

// 변위(translate) 값 raw → CSS('-50%' | '12px' | '100%').
function resolveTranslate(raw, negative) {
  const arb = arbitrary(raw);
  if (arb !== null) return negative ? `-${arb}` : arb;
  if (raw === "full") return negative ? "-100%" : "100%";
  const frac = /^(\d+)\/(\d+)$/.exec(raw);
  if (frac) {
    const pct = (Number(frac[1]) / Number(frac[2])) * 100 * (negative ? -1 : 1);
    return `${Math.round(pct * 1e4) / 1e4}%`;
  }
  if (Object.prototype.hasOwnProperty.call(SPACING, raw)) {
    const px = SPACING[raw] * (negative ? -1 : 1);
    return `${px}px`;
  }
  return null;
}

// 사이즈 계열 prefix → 적용 함수.
const SIZE_PREFIX = {
  w: (v, o) => (o.width = v), h: (v, o) => (o.height = v),
  "min-w": (v, o) => (o.minWidth = v), "min-h": (v, o) => (o.minHeight = v),
  "max-w": (v, o) => (o.maxWidth = v), "max-h": (v, o) => (o.maxHeight = v),
};

// 패딩/마진 prefix → 적용 함수(음수 지원은 margin 계열에 한함).
function applyBox(kind /* 'padding'|'margin' */, sides, value, out) {
  const cap = kind === "padding" ? "padding" : "margin";
  const map = {
    a: [`${cap}`],
    x: [`${cap}Left`, `${cap}Right`],
    y: [`${cap}Top`, `${cap}Bottom`],
    t: [`${cap}Top`], r: [`${cap}Right`], b: [`${cap}Bottom`], l: [`${cap}Left`],
  };
  for (const prop of map[sides]) out[prop] = value;
}

const INSET_SIDES = { top: "top", right: "right", bottom: "bottom", left: "left" };

// ─────────────────────────────────────────────────────────────────────────────
// 3) 단일 클래스 → 스타일 조각
//    반환: { props } | { transform } | { gradientDir } | { gradientStop } | null
// ─────────────────────────────────────────────────────────────────────────────
function classToStyle(cls) {
  if (!cls) return null;

  // 반응형/상태 variant(md:, hover:, dark: …)는 인라인으로 표현 불가 → 마지막 세그먼트만 사용.
  // (hover 등 상태는 LLM 이 onMouseEnter/useState 로 다시 구현하므로 base 값만 남긴다.)
  if (cls.includes(":") && !cls.startsWith("[")) {
    const seg = cls.split(":");
    cls = seg[seg.length - 1];
  }

  // 음수 부호 처리.
  let negative = false;
  if (cls.startsWith("-")) {
    negative = true;
    cls = cls.slice(1);
  }

  // 0) 고정 매핑.
  if (!negative && STATIC[cls]) return { props: { ...STATIC[cls] } };
  if (!negative && FONT_WEIGHT[cls]) return { props: { fontWeight: FONT_WEIGHT[cls] } };
  if (!negative && FONT_SIZE[cls]) {
    const [size, lh] = FONT_SIZE[cls];
    return { props: { fontSize: size, lineHeight: lh } };
  }
  if (!negative && SHADOW[cls]) return { props: { boxShadow: SHADOW[cls] } };
  if (!negative && BACKDROP_BLUR[cls] !== undefined) {
    const v = `blur(${BACKDROP_BLUR[cls]}px)`;
    return { props: { backdropFilter: v, WebkitBackdropFilter: v } };
  }

  // 1) 그라데이션.
  if (!negative) {
    const gd = /^bg-gradient-to-(t|tr|r|br|b|bl|l|tl)$/.exec(cls);
    if (gd) return { gradientDir: GRADIENT_DIR[gd[1]] };
    const gs = /^(from|via|to)-(.+)$/.exec(cls);
    if (gs) {
      const color = resolveColor(gs[2]);
      if (color) return { gradientStop: { pos: gs[1], color } };
    }
  }

  // 2) 변위/회전/스케일(transform).
  const tr = /^translate-(x|y)-(.+)$/.exec(cls);
  if (tr) {
    const v = resolveTranslate(tr[2], negative);
    if (v !== null) return { transform: `translate${tr[1].toUpperCase()}(${v})` };
  }
  const rot = /^rotate-(.+)$/.exec(cls);
  if (rot) {
    const arb = arbitrary(rot[1]);
    const deg = arb !== null ? arb : `${rot[1]}deg`;
    return { transform: `rotate(${negative ? "-" : ""}${deg})` };
  }
  const scl = /^scale-(\d+)$/.exec(cls);
  if (scl && !negative) return { transform: `scale(${Number(scl[1]) / 100})` };

  // 3) 패딩/마진.
  const box = /^([pm])([xytrbl]?)-(.+)$/.exec(cls);
  if (box) {
    const kind = box[1] === "p" ? "padding" : "margin";
    const sides = box[2] || "a";
    if (kind === "padding" && negative) return null; // 음수 패딩 없음.
    let value = resolveSize(box[3]);
    if (value === null) return null;
    if (negative && typeof value === "number") value = -value;
    else if (negative && typeof value === "string" && /^[\d.]/.test(value)) value = `-${value}`;
    const out = {};
    applyBox(kind, sides, value, out);
    return { props: out };
  }

  // 4) 위치 오프셋(top/right/bottom/left/inset[-x|-y]).
  const insetXY = /^inset-(x|y)-(.+)$/.exec(cls);
  if (insetXY) {
    let value = resolveSize(insetXY[2]);
    if (value === null) return null;
    if (negative && typeof value === "number") value = -value;
    else if (negative && typeof value === "string" && /^[\d.]/.test(value)) value = `-${value}`;
    const props = insetXY[1] === "x" ? { left: value, right: value } : { top: value, bottom: value };
    return { props };
  }
  const inset = /^inset-(.+)$/.exec(cls);
  if (inset) {
    let value = resolveSize(inset[1]);
    if (value !== null) {
      if (negative && typeof value === "number") value = -value;
      else if (negative && typeof value === "string" && /^[\d.]/.test(value)) value = `-${value}`;
      return { props: { top: value, right: value, bottom: value, left: value } };
    }
  }
  const side = /^(top|right|bottom|left)-(.+)$/.exec(cls);
  if (side) {
    let value = resolveSize(side[2]);
    if (value === null) return null;
    if (negative && typeof value === "number") value = -value;
    else if (negative && typeof value === "string" && /^[\d.]/.test(value)) value = `-${value}`;
    return { props: { [INSET_SIDES[side[1]]]: value } };
  }

  if (negative) return null; // 이하 규칙은 음수를 받지 않는다.

  // 5) 사이즈(w/h/min-*/max-*).
  const sizeM = /^(min-w|max-w|min-h|max-h|w|h)-(.+)$/.exec(cls);
  if (sizeM) {
    const prefix = sizeM[1];
    const axis = prefix.includes("w") ? "x" : "y";
    const value = resolveSize(sizeM[2], axis);
    if (value !== null) {
      const out = {};
      SIZE_PREFIX[prefix](value, out);
      return { props: out };
    }
  }

  // 6) gap / space.
  const gap = /^gap-(x|y)?-?(.+)$/.exec(cls);
  if (gap && cls.startsWith("gap-")) {
    const value = resolveSize(gap[2]);
    if (value !== null) {
      if (gap[1] === "x") return { props: { columnGap: value } };
      if (gap[1] === "y") return { props: { rowGap: value } };
      return { props: { gap: value } };
    }
  }
  const spaceM = /^space-(x|y)-(.+)$/.exec(cls);
  if (spaceM) {
    // 인라인에선 자식 마진을 못 주므로 flex/grid gap 근사로 대체(비-flex 에선 무시됨).
    const value = resolveSize(spaceM[2]);
    if (value !== null) {
      return { props: spaceM[1] === "x" ? { columnGap: value } : { rowGap: value } };
    }
  }

  // 7) border-radius.
  const rounded = /^rounded(-(t|b|l|r|tl|tr|bl|br|s|e))?(-(.+))?$/.exec(cls);
  if (rounded && cls.startsWith("rounded")) {
    const sideKey = rounded[2];
    const sizeKey = rounded[4] ?? "";
    let value;
    const arb = arbitrary(sizeKey);
    if (arb !== null) value = arb;
    else if (Object.prototype.hasOwnProperty.call(RADIUS, sizeKey)) value = RADIUS[sizeKey];
    if (value !== undefined) {
      const corners = {
        t: ["borderTopLeftRadius", "borderTopRightRadius"],
        b: ["borderBottomLeftRadius", "borderBottomRightRadius"],
        l: ["borderTopLeftRadius", "borderBottomLeftRadius"],
        r: ["borderTopRightRadius", "borderBottomRightRadius"],
        tl: ["borderTopLeftRadius"], tr: ["borderTopRightRadius"],
        bl: ["borderBottomLeftRadius"], br: ["borderBottomRightRadius"],
      };
      if (!sideKey) return { props: { borderRadius: value } };
      const props = {};
      for (const p of corners[sideKey] ?? []) props[p] = value;
      if (Object.keys(props).length) return { props };
    }
  }

  // 8) 폰트 크기 임의값: text-[10px], text-[26px].
  const textArb = /^text-(\[.+\])$/.exec(cls);
  if (textArb) {
    const v = arbitrary(textArb[1]);
    if (v !== null) {
      // 길이값이면 fontSize, 그 외(예: 색)면 color.
      if (/^-?[\d.]+(px|rem|em|vw|vh|%)$/.test(v)) return { props: { fontSize: v } };
      return { props: { color: v } };
    }
  }

  // 9) letter-spacing / line-height 임의값.
  const trackArb = /^tracking-(\[.+\])$/.exec(cls);
  if (trackArb) {
    const v = arbitrary(trackArb[1]);
    if (v !== null) return { props: { letterSpacing: v } };
  }
  const leadArb = /^leading-(\[.+\]|\d+)$/.exec(cls);
  if (leadArb) {
    const v = arbitrary(leadArb[1]);
    if (v !== null) return { props: { lineHeight: v } };
    const px = resolveSize(leadArb[1]);
    if (px !== null) return { props: { lineHeight: px } };
  }

  // 10) z-index.
  const z = /^z-(\[.+\]|\d+)$/.exec(cls);
  if (z) {
    const v = arbitrary(z[1]);
    return { props: { zIndex: v !== null ? v : Number(z[1]) } };
  }

  // 11) opacity.
  const op = /^opacity-(\[.+\]|\d{1,3})$/.exec(cls);
  if (op) {
    const v = arbitrary(op[1]);
    return { props: { opacity: v !== null ? v : Number(op[1]) / 100 } };
  }

  // 12) grid columns/rows.
  const gcols = /^grid-cols-(\[.+\]|\d+)$/.exec(cls);
  if (gcols) {
    const v = arbitrary(gcols[1]);
    return { props: { gridTemplateColumns: v !== null ? v : `repeat(${gcols[1]}, minmax(0, 1fr))` } };
  }
  const grows = /^grid-rows-(\[.+\]|\d+)$/.exec(cls);
  if (grows) {
    const v = arbitrary(grows[1]);
    return { props: { gridTemplateRows: v !== null ? v : `repeat(${grows[1]}, minmax(0, 1fr))` } };
  }
  const cspan = /^col-span-(\d+)$/.exec(cls);
  if (cspan) return { props: { gridColumn: `span ${cspan[1]} / span ${cspan[1]}` } };
  const rspan = /^row-span-(\d+)$/.exec(cls);
  if (rspan) return { props: { gridRow: `span ${rspan[1]} / span ${rspan[1]}` } };

  // 13) aspect 임의값.
  const aspectArb = /^aspect-(\[.+\])$/.exec(cls);
  if (aspectArb) {
    const v = arbitrary(aspectArb[1]);
    if (v !== null) return { props: { aspectRatio: v.includes("/") ? v.replace("/", " / ") : v } };
  }

  // 14) drop-shadow 임의값 → filter.
  const dropArb = /^drop-shadow-(\[.+\])$/.exec(cls);
  if (dropArb) {
    const v = arbitrary(dropArb[1]);
    if (v !== null) return { props: { filter: `drop-shadow(${v})` } };
  }

  // 15) 테두리(border / border-2 / border-t / border-t-2 / border-COLOR).
  if (cls === "border") return { props: { borderWidth: 1, borderStyle: "solid" } };
  const borderM = /^border-(.+)$/.exec(cls);
  if (borderM) {
    const rest = borderM[1];
    const sideW = /^(t|r|b|l)(-(\d+))?$/.exec(rest);
    if (sideW) {
      const sideProp = { t: "Top", r: "Right", b: "Bottom", l: "Left" }[sideW[1]];
      const w = sideW[3] !== undefined ? Number(sideW[3]) : 1;
      return { props: { [`border${sideProp}Width`]: w, [`border${sideProp}Style`]: "solid" } };
    }
    if (/^\d+$/.test(rest)) return { props: { borderWidth: Number(rest), borderStyle: "solid" } };
    const color = resolveColor(rest);
    if (color) return { props: { borderColor: color } };
  }

  // 16) 색상(text-/bg-/fill-/stroke-/ring-).
  const colorM = /^(text|bg|fill|stroke|ring)-(.+)$/.exec(cls);
  if (colorM) {
    const color = resolveColor(colorM[2]);
    if (color) {
      switch (colorM[1]) {
        case "text": return { props: { color } };
        case "bg": return { props: { backgroundColor: color } };
        case "fill": return { props: { fill: color } };
        case "stroke": return { props: { stroke: color } };
        case "ring": return { props: { boxShadow: `0 0 0 2px ${color}` } };
        default: break;
      }
    }
  }

  // 17) line-clamp.
  const clamp = /^line-clamp-(\d+)$/.exec(cls);
  if (clamp) {
    return {
      props: {
        display: "-webkit-box", WebkitLineClamp: Number(clamp[1]),
        WebkitBoxOrient: "vertical", overflow: "hidden",
      },
    };
  }

  // 알 수 없는 클래스(animate-*, ring-offset-*, group, peer 등)는 조용히 드롭.
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4) 클래스 리스트 → 병합된 스타일 객체
// ─────────────────────────────────────────────────────────────────────────────
function classListToStyle(classes) {
  const props = {};
  const transforms = [];
  let gradientDir = null;
  const gradientStops = { from: null, via: null, to: null };

  for (const cls of classes) {
    const r = classToStyle(cls);
    if (!r) continue;
    if (r.props) Object.assign(props, r.props);
    else if (r.transform) transforms.push(r.transform);
    else if (r.gradientDir) gradientDir = r.gradientDir;
    else if (r.gradientStop) gradientStops[r.gradientStop.pos] = r.gradientStop.color;
  }

  if (transforms.length) props.transform = transforms.join(" ");

  if (gradientDir || gradientStops.from || gradientStops.to) {
    const stops = [gradientStops.from, gradientStops.via, gradientStops.to].filter(Boolean);
    if (stops.length) {
      props.backgroundImage = `linear-gradient(${gradientDir ?? "to right"}, ${stops.join(", ")})`;
    }
  }

  return props;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5) 스타일 객체 → JS 객체 리터럴 본문("paddingLeft: 20, display: 'flex'")
// ─────────────────────────────────────────────────────────────────────────────
function serializeStyle(props) {
  const entries = [];
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === "number") {
      entries.push(`${key}: ${value}`);
    } else {
      entries.push(`${key}: '${String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`);
    }
  }
  return entries.join(", ");
}

// ─────────────────────────────────────────────────────────────────────────────
// 6) JSX 여는 태그 스캐너
//    문자열('"`)과 표현식 중괄호 깊이를 추적해, 표현식 내부의 '>' 를 태그 끝으로
//    오인하지 않고 정확히 여는 태그의 '>' 를 찾는다.
// ─────────────────────────────────────────────────────────────────────────────
function findTagEnd(code, start) {
  // start 는 '<' 의 인덱스. 닫는 '>' 다음 인덱스를 반환한다.
  const stack = []; // '{', "'", '"', '`'
  for (let i = start + 1; i < code.length; i += 1) {
    const c = code[i];
    const top = stack[stack.length - 1];

    if (top === "'" || top === '"') {
      if (c === "\\") { i += 1; continue; }
      if (c === top) stack.pop();
      continue;
    }
    if (top === "`") {
      if (c === "\\") { i += 1; continue; }
      if (c === "`") stack.pop();
      else if (c === "$" && code[i + 1] === "{") { stack.push("{"); i += 1; }
      continue;
    }
    // 코드 컨텍스트(문자열 밖).
    if (c === "'" || c === '"' || c === "`") { stack.push(c); continue; }
    if (c === "{") { stack.push("{"); continue; }
    if (c === "}") { if (top === "{") stack.pop(); continue; }
    if (c === ">" && stack.length === 0) return i + 1;
  }
  return code.length;
}

// 중괄호 균형을 맞춰 닫는 '}' 인덱스를 찾는다(openIdx 는 여는 '{').
function matchBrace(str, openIdx) {
  const stack = [];
  for (let i = openIdx; i < str.length; i += 1) {
    const c = str[i];
    const top = stack[stack.length - 1];
    if (top === "'" || top === '"') {
      if (c === "\\") { i += 1; continue; }
      if (c === top) stack.pop();
      continue;
    }
    if (top === "`") {
      if (c === "\\") { i += 1; continue; }
      if (c === "`") stack.pop();
      else if (c === "$" && str[i + 1] === "{") { stack.push("{"); i += 1; }
      continue;
    }
    if (c === "'" || c === '"' || c === "`") { stack.push(c); continue; }
    if (c === "{") { stack.push("{"); continue; }
    if (c === "}") {
      if (top === "{") { stack.pop(); if (stack.length === 0) return i; }
      continue;
    }
  }
  return -1;
}

// 템플릿 리터럴 본문에서 ${...} 구간을 제거해 정적 텍스트만 남긴다.
function stripTemplateHoles(body) {
  let out = "";
  for (let i = 0; i < body.length; i += 1) {
    if (body[i] === "$" && body[i + 1] === "{") {
      const close = matchBrace(body, i + 1);
      if (close === -1) break;
      i = close; // ${...} 통째로 건너뜀.
      out += " ";
    } else {
      out += body[i];
    }
  }
  return out;
}

// className 속성값에서 정적 클래스 토큰 배열을 뽑는다.
//   - "a b c"            → [a,b,c]
//   - {'a b'} / {"a b"}  → [a,b]
//   - {`a b ${x}`}       → [a,b]  (${x} 드롭)
//   - {someExpr}         → []      (정적 토큰 없음)
function extractClasses(value, isExpr) {
  if (!isExpr) return value.split(/\s+/).filter(Boolean);

  const trimmed = value.trim();
  const q = trimmed[0];
  if (q === "'" || q === '"') {
    const end = trimmed.lastIndexOf(q);
    if (end > 0) return trimmed.slice(1, end).split(/\s+/).filter(Boolean);
    return [];
  }
  if (q === "`") {
    const end = trimmed.lastIndexOf("`");
    if (end > 0) return stripTemplateHoles(trimmed.slice(1, end)).split(/\s+/).filter(Boolean);
    return [];
  }
  return []; // 순수 표현식 className — 정적 클래스 없음.
}

// ─────────────────────────────────────────────────────────────────────────────
// 7) 단일 여는 태그 처리: className → 인라인 style 변환/병합
// ─────────────────────────────────────────────────────────────────────────────
function processTag(tag) {
  // className 속성 찾기(= 다음이 "..." 또는 {...}).
  const cnMatch = /\bclassName\s*=\s*/.exec(tag);
  if (!cnMatch) return tag;

  const valStart = cnMatch.index + cnMatch[0].length;
  const first = tag[valStart];
  let value;
  let attrEnd; // className 속성 전체의 끝(배타적).
  let isExpr = false;

  if (first === '"' || first === "'") {
    const close = tag.indexOf(first, valStart + 1);
    if (close === -1) return tag;
    value = tag.slice(valStart + 1, close);
    attrEnd = close + 1;
  } else if (first === "{") {
    const close = matchBrace(tag, valStart);
    if (close === -1) return tag;
    value = tag.slice(valStart + 1, close);
    attrEnd = close + 1;
    isExpr = true;
  } else {
    return tag;
  }

  const classes = extractClasses(value, isExpr);
  const props = classListToStyle(classes);
  const serialized = serializeStyle(props);

  // className 속성(앞 공백 1칸 포함) 제거 범위.
  let removeStart = cnMatch.index;
  if (removeStart > 0 && /\s/.test(tag[removeStart - 1])) removeStart -= 1;
  const before = tag.slice(0, removeStart);
  const after = tag.slice(attrEnd);
  const withoutClassName = before + after;

  if (!serialized) return withoutClassName; // 변환 결과 없음 → className 만 제거.

  // 이미 style={{ ... }} 가 있으면 그 안에 병합한다(동적 값 보존).
  const styleMatch = /\bstyle\s*=\s*\{\s*\{/.exec(withoutClassName);
  if (styleMatch) {
    const innerOpenIdx = withoutClassName.indexOf("{", styleMatch.index + styleMatch[0].length - 1);
    const innerClose = matchBrace(withoutClassName, innerOpenIdx);
    if (innerClose !== -1) {
      const innerBody = withoutClassName.slice(innerOpenIdx + 1, innerClose).trim();
      const mergedBody = innerBody ? `${serialized}, ${innerBody}` : serialized;
      return (
        withoutClassName.slice(0, innerOpenIdx + 1) +
        ` ${mergedBody} ` +
        withoutClassName.slice(innerClose)
      );
    }
  }

  // style 이 없으면 className 이 있던 자리에 새 style 속성을 삽입한다.
  const insert = ` style={{ ${serialized} }}`;
  return before + insert + after;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8) public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 베이스 템플릿 JSX 문자열의 Tailwind className 을 결정론적으로 인라인 style 로 변환한다.
 *
 * @param {string} templateCode - 베이스 템플릿 원문(JSX 문자열).
 * @returns {string} className 이 인라인 style 로 치환된 JSX 문자열.
 *
 * 주의:
 *  - 색상은 표준 Tailwind 팔레트 HEX 플레이스홀더로 박힌다. 이후 LLM 이 톤 토큰으로 교체한다.
 *  - lucide 아이콘 import 와 동적 ${...} 색/굵기 토글은 변환하지 않는다(LLM 책임).
 *  - 어떤 입력에도 throw 하지 않는다. 변환 실패 클래스는 조용히 드롭한다.
 */
export function preprocessTemplate(templateCode) {
  if (typeof templateCode !== "string" || templateCode.length === 0) {
    return templateCode ?? "";
  }

  let out = "";
  let i = 0;
  const n = templateCode.length;

  while (i < n) {
    const lt = templateCode.indexOf("<", i);
    if (lt === -1) {
      out += templateCode.slice(i);
      break;
    }

    out += templateCode.slice(i, lt);

    const next = templateCode[lt + 1];
    // 여는/자기닫는 태그 시작( <div / <Heart / </div )만 스캔. '<' 가 비교연산 등이면 그대로.
    if (next && /[A-Za-z/]/.test(next)) {
      const end = findTagEnd(templateCode, lt);
      const tag = templateCode.slice(lt, end);
      out += processTag(tag);
      i = end;
    } else {
      out += "<";
      i = lt + 1;
    }
  }

  return out;
}

export default preprocessTemplate;
