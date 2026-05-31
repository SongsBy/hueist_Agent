// app/components/ToneMockup.jsx
"use client";

import { FALLBACK_FONT_STACK } from "../lib/googleFonts";

// 스마트폰 목업 화면. ToneCard(Step 2)와 결과 페이지에서 공통으로 사용해
// 시각적 일관성을 유지한다.
// NOTE: 폰트 <link> 주입은 이 컴포넌트가 책임지지 않는다. 부모가 한 번에
// 처리한다(중복 제거 + 단일 요청 + FOUT 페이드인).
//
// 폰 프레임 기준 크기(테두리 포함): 220 × 440 px.
const FRAME_WIDTH = 220;
const FRAME_HEIGHT = 440;

export default function ToneMockup({
  colors,
  typography,
  font_pairing,
  appName,
  // true면 Step 2 카드처럼 컬러 배경 + 앰비언트 워시로 감싼다.
  // false면 폰만 단독으로 노출한다(결과 페이지).
  showBackground = true,
  // 폰 프레임 배율. 내부 비율을 유지한 채 통째로 확대한다.
  scale = 1,
}) {
  if (!colors) return null;

  const {
    primary = "#111827",
    secondary = "#6B7280",
    tertiary = "#9CA3AF",
    surface = "#FFFFFF",
    background = "#F9FAFB",
  } = colors ?? {};

  const fallbackStack = typography?.fallback_stack ?? FALLBACK_FONT_STACK;
  const headingFamily = typography?.heading_font ?? font_pairing?.heading;
  const bodyFamily = typography?.body_font ?? font_pairing?.body;
  const headingFont = headingFamily
    ? `'${headingFamily}', ${fallbackStack}`
    : undefined;
  const bodyFont = bodyFamily
    ? `'${bodyFamily}', ${fallbackStack}`
    : undefined;
  const headingWeight = typography?.font_weight_map?.heading;
  const bodyWeight = typography?.font_weight_map?.body;

  const firstWord = appName?.split(" ")[0] ?? "";

  const stats = [
    { label: "Focus", value: 78, color: primary },
    { label: "Energy", value: 54, color: secondary },
  ];

  const feed = [
    { name: "Olivia", note: "Shared an artwork", time: "2m", grad: [primary, secondary] },
    { name: "Daniel", note: "Started following", time: "12m", grad: [secondary, tertiary] },
    { name: "Mira", note: "Replied to post", time: "1h", grad: [tertiary, primary] },
  ];

  // === Phone Frame === (Step 2 카드와 결과 페이지가 공유하는 본체)
  const frame = (
    <div
      className="relative h-110 w-55 rounded-[42px] border-[7px] border-gray-900 bg-gray-900 shadow-2xl transition-transform duration-500 group-hover:scale-[1.03]"
      aria-label="모바일 화면 미리보기"
    >
      {/* Notch */}
      <div className="absolute top-0 left-1/2 z-20 h-4 w-16 -translate-x-1/2 rounded-b-2xl bg-gray-900" />

      {/* === Screen === */}
      <div
        className="relative flex h-full w-full flex-col overflow-hidden rounded-[31px]"
        style={{
          backgroundColor: background,
          fontFamily: bodyFont,
          fontWeight: bodyWeight,
        }}
      >
        {/* Status bar */}
        <div
          className="flex items-center justify-between px-4 pt-3 pb-1 text-[8px] font-bold tracking-tight"
          style={{ color: primary }}
        >
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <div className="flex items-end gap-px">
              <span className="h-0.75 w-[1.5px] rounded-sm" style={{ backgroundColor: primary }} />
              <span className="h-1 w-[1.5px] rounded-sm" style={{ backgroundColor: primary }} />
              <span className="h-1.25 w-[1.5px] rounded-sm" style={{ backgroundColor: primary }} />
              <span className="h-1.5 w-[1.5px] rounded-sm" style={{ backgroundColor: primary }} />
            </div>
            <div
              className="h-1.75 w-3 rounded-xs border-[0.5px]"
              style={{ borderColor: primary }}
            >
              <div className="h-full w-2/3" style={{ backgroundColor: primary }} />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-3 pt-2">
          <div className="flex flex-col gap-0.5">
            <span
              className="text-[6px] font-semibold tracking-[0.2em] uppercase"
              style={{ color: secondary, opacity: 0.7 }}
            >
              Good morning
            </span>
            <h3
              className="truncate text-[11px] leading-tight font-black tracking-tight"
              style={{
                color: primary,
                fontFamily: headingFont,
                fontWeight: headingWeight,
              }}
            >
              {firstWord}
            </h3>
          </div>
          <div className="relative">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full shadow-sm ring-1 ring-black/5"
              style={{ backgroundColor: surface }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-2.5 w-2.5"
                style={{ color: primary }}
                aria-hidden="true"
              >
                <path d="M6 8a6 6 0 1112 0c0 7 3 8 3 8H3s3-1 3-8z" />
                <path d="M10 21a2 2 0 004 0" />
              </svg>
            </div>
            <span
              className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: "#ef4444",
                boxShadow: `0 0 0 1.5px ${surface}`,
              }}
            />
          </div>
        </div>

        {/* Ghost Search */}
        <div className="px-3 pt-2">
          <div
            className="flex items-center gap-1.5 rounded-lg border px-2 py-1.5"
            style={{
              borderColor: `${primary}1f`,
              backgroundColor: `${primary}0a`,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="h-2.5 w-2.5"
              style={{ color: secondary }}
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <span
              className="text-[7px] tracking-tight"
              style={{ color: secondary, opacity: 0.7 }}
            >
              Search...
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-1.5 px-3 pt-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex-1 rounded-lg border border-black/5 p-1.5"
              style={{ backgroundColor: surface }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[5.5px] font-semibold tracking-[0.14em] uppercase"
                  style={{ color: secondary, opacity: 0.8 }}
                >
                  {s.label}
                </span>
                <span
                  className="text-[8px] leading-none font-black"
                  style={{
                    color: primary,
                    fontFamily: headingFont,
                    fontWeight: headingWeight,
                  }}
                >
                  {s.value}%
                </span>
              </div>
              <div
                className="mt-1 h-0.75 w-full overflow-hidden rounded-full"
                style={{ backgroundColor: `${s.color}1f` }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${s.value}%`, backgroundColor: s.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Hero Card */}
        <div className="px-3 pt-2">
          <div
            className="relative overflow-hidden rounded-xl border border-black/5 shadow-sm"
            style={{ backgroundColor: surface }}
          >
            <div
              className="relative h-14 w-full"
              style={{
                backgroundImage: `linear-gradient(135deg, ${primary}, ${tertiary})`,
              }}
            >
              <span className="absolute top-1 left-1 flex items-center gap-0.5 rounded-full bg-black/35 px-1 py-px text-[5.5px] font-black tracking-[0.14em] text-white backdrop-blur-sm">
                <span className="h-0.75 w-0.75 rounded-full bg-red-400 shadow-[0_0_3px_rgba(248,113,113,0.9)]" />
                LIVE
              </span>
              <div className="absolute right-0 bottom-0 left-0 h-6 bg-linear-to-t from-black/35 to-transparent" />
              <div className="absolute top-1.5 right-1.5 flex gap-0.5 opacity-60">
                <span className="h-0.75 w-0.75 rounded-full bg-white/70" />
                <span className="h-0.75 w-0.75 rounded-full bg-white/40" />
              </div>
            </div>
            <div className="space-y-1 p-2">
              <h4
                className="text-[8px] leading-tight font-bold tracking-tight"
                style={{
                  color: primary,
                  fontFamily: headingFont,
                  fontWeight: headingWeight,
                }}
              >
                Daily Inspiration
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-[6px]" style={{ color: secondary, opacity: 0.8 }}>
                  3 min read
                </span>
                <span
                  className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[6px] font-black tracking-wide text-white"
                  style={{
                    backgroundColor: primary,
                    boxShadow: `0 3px 8px -2px ${primary}80`,
                  }}
                >
                  Read
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-1.5 w-1.5"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="flex-1 px-3 pt-2">
          <div className="mb-1 flex items-center justify-between">
            <p
              className="text-[6px] font-bold tracking-[0.16em] uppercase"
              style={{ color: secondary }}
            >
              Activity
            </p>
            <span className="text-[6px]" style={{ color: tertiary }}>
              See all
            </span>
          </div>
          <div className="space-y-1.5">
            {feed.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div
                  className="relative h-5 w-5 shrink-0 rounded-full shadow-inner ring-1 ring-black/5"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${item.grad[0]}, ${item.grad[1]})`,
                  }}
                  aria-hidden="true"
                >
                  <span className="absolute top-0.5 left-0.75 h-0.75 w-0.75 rounded-full bg-white/40" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-[7px] leading-tight font-bold tracking-tight"
                    style={{
                      color: primary,
                      fontFamily: headingFont,
                      fontWeight: headingWeight,
                    }}
                  >
                    {item.name}
                  </p>
                  <p
                    className="truncate text-[6px] leading-tight"
                    style={{ color: secondary, opacity: 0.75 }}
                  >
                    {item.note}
                  </p>
                </div>
                <span
                  className="text-[5.5px] font-semibold"
                  style={{ color: tertiary }}
                >
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Bar */}
        <div
          className="relative flex items-center justify-around border-t pt-2 pb-3"
          style={{
            backgroundColor: surface,
            borderColor: `${tertiary}22`,
          }}
        >
          {/* Home (active) */}
          <div className="flex flex-col items-center gap-0.5">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-2.5 w-2.5"
              style={{ color: primary }}
              aria-hidden="true"
            >
              <path d="M3 11.5L12 4l9 7.5V20a1 1 0 01-1 1h-4.5v-6h-7v6H4a1 1 0 01-1-1v-8.5z" />
            </svg>
            <span
              className="h-0.75 w-0.75 rounded-full"
              style={{
                backgroundColor: primary,
                boxShadow: `0 0 4px ${primary}80`,
              }}
            />
          </div>
          {/* Chart */}
          <div className="flex flex-col items-center gap-0.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              className="h-2.5 w-2.5"
              style={{ color: tertiary }}
              aria-hidden="true"
            >
              <path d="M4 20V11M10 20V4M16 20v-7M22 20H2" />
            </svg>
            <span className="h-0.75 w-0.75" />
          </div>
          {/* FAB Plus */}
          <div className="-mt-2 flex flex-col items-center gap-0.5">
            <div
              className="flex h-5 w-5 items-center justify-center rounded-full"
              style={{
                backgroundColor: primary,
                boxShadow: `0 4px 10px -2px ${primary}80`,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="h-2.5 w-2.5"
                style={{ color: surface }}
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <span className="h-0.75 w-0.75" />
          </div>
          {/* Bell */}
          <div className="flex flex-col items-center gap-0.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-2.5 w-2.5"
              style={{ color: tertiary }}
              aria-hidden="true"
            >
              <path d="M6 8a6 6 0 1112 0c0 7 3 8 3 8H3s3-1 3-8z" />
              <path d="M10 21a2 2 0 004 0" />
            </svg>
            <span className="h-0.75 w-0.75" />
          </div>
          {/* User */}
          <div className="flex flex-col items-center gap-0.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              className="h-2.5 w-2.5"
              style={{ color: tertiary }}
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0116 0" />
            </svg>
            <span className="h-0.75 w-0.75" />
          </div>
        </div>
      </div>
    </div>
  );

  // 결과 페이지: 배경 없이 폰만, scale 배율로 확대해서 노출한다.
  if (!showBackground) {
    return (
      <div
        className="relative"
        style={{
          width: `${FRAME_WIDTH * scale}px`,
          height: `${FRAME_HEIGHT * scale}px`,
        }}
      >
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{ transform: `scale(${scale})` }}
        >
          {frame}
        </div>
      </div>
    );
  }

  // Step 2 카드: 컬러 배경 + 앰비언트 워시로 감싼다.
  return (
    <div
      className="relative flex justify-center px-6 pt-10 pb-8 transition-colors duration-500"
      style={{ backgroundColor: `${primary}10` }}
    >
      {/* Ambient washes */}
      <div
        className="pointer-events-none absolute top-0 right-0 h-40 w-40 rounded-full opacity-20 blur-[80px]"
        style={{ backgroundColor: primary }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full opacity-20 blur-[80px]"
        style={{ backgroundColor: tertiary }}
      />

      {frame}
    </div>
  );
}
