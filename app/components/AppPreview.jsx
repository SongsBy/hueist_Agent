// app/components/AppPreview.jsx
"use client";

import { FALLBACK_FONT_STACK } from "../lib/googleFonts";

export default function AppPreview({
  colors,
  fontPairing,
  typography,
  appName = "Hueist",
}) {
  if (!colors) return null;

  const {
    primary = "#111827",
    secondary = "#6B7280",
    tertiary = "#9CA3AF",
    surface = "#FFFFFF",
    background = "#F9FAFB",
  } = colors;

  const headingFamily = typography?.heading_font ?? fontPairing?.heading;
  const bodyFamily = typography?.body_font ?? fontPairing?.body;
  const headingFont = headingFamily
    ? `'${headingFamily}', ${FALLBACK_FONT_STACK}`
    : undefined;
  const bodyFont = bodyFamily
    ? `'${bodyFamily}', ${FALLBACK_FONT_STACK}`
    : undefined;
  const headingWeight = typography?.font_weight_map?.heading;
  const bodyWeight = typography?.font_weight_map?.body;
  const emphasisWeight = typography?.font_weight_map?.emphasis;

  return (
    <div
      aria-label="앱 미리보기"
      className="relative mx-auto h-[640px] w-[320px] rounded-[44px] border-[10px] border-gray-900 bg-gray-900 shadow-2xl"
    >
      {/* Notch */}
      <div className="absolute top-0 left-1/2 z-10 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-gray-900" />

      {/* Screen */}
      <div
        className="relative flex h-full w-full flex-col overflow-hidden rounded-[32px]"
        style={{
          backgroundColor: background,
          fontFamily: bodyFont,
          fontWeight: bodyWeight,
        }}
      >
        {/* Status bar */}
        <div
          className="flex items-center justify-between px-6 pt-3 pb-1 text-[10px] font-medium"
          style={{ color: primary }}
        >
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: primary }} />
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: primary }} />
            <span className="inline-block h-1.5 w-1.5 rounded-full opacity-50" style={{ backgroundColor: primary }} />
          </span>
        </div>

        {/* Header */}
        <header className="flex items-center justify-between px-5 pt-3 pb-2">
          <div>
            <p className="text-[10px] tracking-widest uppercase" style={{ color: tertiary }}>
              Good morning
            </p>
            <h2
              className="text-xl font-bold leading-tight"
              style={{
                color: primary,
                fontFamily: headingFont,
                fontWeight: headingWeight,
              }}
            >
              {appName}
            </h2>
          </div>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
            style={{ backgroundColor: surface, color: primary }}
          >
            H
          </div>
        </header>

        {/* Hero card */}
        <div className="px-5 pt-3">
          <div
            className="rounded-2xl p-4 shadow-sm"
            style={{ backgroundColor: primary }}
          >
            <p className="text-[10px] tracking-wide uppercase opacity-70" style={{ color: background }}>
              Featured
            </p>
            <p
              className="mt-1 text-sm font-semibold leading-snug"
              style={{
                color: background,
                fontFamily: headingFont,
                fontWeight: emphasisWeight,
              }}
            >
              Discover your color story
            </p>
            <button
              type="button"
              className="mt-3 rounded-full px-3 py-1 text-[10px] font-medium"
              style={{ backgroundColor: background, color: primary }}
            >
              Explore →
            </button>
          </div>
        </div>

        {/* Section title */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h3
            className="text-xs font-semibold"
            style={{ color: primary, fontFamily: headingFont }}
          >
            Recent
          </h3>
          <span className="text-[10px]" style={{ color: secondary }}>
            See all
          </span>
        </div>

        {/* Cards list */}
        <div className="flex-1 space-y-2 overflow-hidden px-5">
          {[
            { title: "Morning brief", meta: "5 min read" },
            { title: "Design notes", meta: "Updated today" },
            { title: "Weekly digest", meta: "12 items" },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 rounded-xl p-2.5"
              style={{ backgroundColor: surface }}
            >
              <div
                className="h-9 w-9 flex-shrink-0 rounded-lg"
                style={{ backgroundColor: tertiary }}
              />
              <div className="flex-1 min-w-0">
                <p
                  className="truncate text-xs font-semibold"
                  style={{ color: primary }}
                >
                  {item.title}
                </p>
                <p className="truncate text-[10px]" style={{ color: secondary }}>
                  {item.meta}
                </p>
              </div>
              <button
                type="button"
                className="rounded-full px-2.5 py-1 text-[10px] font-medium"
                style={{ backgroundColor: primary, color: background }}
              >
                Open
              </button>
            </div>
          ))}
        </div>

        {/* Bottom navigation */}
        <nav
          className="flex items-center justify-around border-t px-5 py-3"
          style={{ backgroundColor: surface, borderColor: `${tertiary}33` }}
        >
          {[
            { label: "Home", active: true },
            { label: "Search", active: false },
            { label: "Saved", active: false },
            { label: "Profile", active: false },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: item.active ? primary : tertiary,
                  opacity: item.active ? 1 : 0.5,
                }}
              />
              <span
                className="text-[9px] font-medium"
                style={{ color: item.active ? primary : secondary }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
