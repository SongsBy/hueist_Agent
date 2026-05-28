// app/components/ToneCard.jsx
"use client";

import { FALLBACK_FONT_STACK } from "../lib/googleFonts";
import { useDynamicGoogleFont } from "../lib/useDynamicGoogleFont";

export default function ToneCard({ tone, isSelected = false, onSelect }) {
  // Rules of Hooks: 조기 return 전에 훅을 호출해야 한다. tone이 null이면 hook은 no-op.
  useDynamicGoogleFont(tone?.typography?.google_font_url);

  if (!tone) return null;

  const { name, description, mood = [], colors, font_pairing, typography } = tone;

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

  const handleClick = () => {
    if (typeof onSelect === "function") onSelect(tone);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${name} 톤 선택`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`group flex w-full cursor-pointer flex-col overflow-hidden rounded-[32px] border-2 bg-white shadow-xl transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-offset-2 ${
        isSelected
          ? "border-gray-900 ring-2 ring-gray-900/20"
          : "border-transparent hover:border-gray-200"
      }`}
    >
      {/* Phone preview area */}
      <div
        className="relative flex justify-center px-6 pt-10 pb-8 transition-colors duration-500"
        style={{ backgroundColor: `${primary}10` }}
      >
        {/* Decorative background gradients */}
        <div
          className="pointer-events-none absolute top-0 right-0 h-40 w-40 rounded-full opacity-20 blur-[80px]"
          style={{ backgroundColor: primary }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full opacity-20 blur-[80px]"
          style={{ backgroundColor: tertiary }}
        />

        {/* High-Fidelity Phone Frame */}
        <div
          className="relative h-[320px] w-[160px] rounded-[38px] border-[7px] border-gray-900 bg-gray-900 shadow-2xl transition-transform duration-500 group-hover:scale-[1.03]"
          aria-label="모바일 화면 미리보기"
        >
          {/* Dynamic Notch */}
          <div className="absolute top-0 left-1/2 z-20 h-4 w-16 -translate-x-1/2 rounded-b-2xl bg-gray-900" />

          {/* Screen Content */}
          <div
            className="relative flex h-full w-full flex-col overflow-hidden rounded-[31px]"
            style={{
              backgroundColor: background,
              fontFamily: bodyFont,
              fontWeight: bodyWeight,
            }}
          >
            {/* Professional Status Bar */}
            <div
              className="flex items-center justify-between px-4 pt-2.5 pb-1 text-[7px] font-bold"
              style={{ color: primary }}
            >
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-3 rounded-sm border-[0.5px]" style={{ borderColor: primary }}>
                  <div className="h-full w-2/3" style={{ backgroundColor: primary }} />
                </div>
              </div>
            </div>

            {/* Premium Header */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="h-1 w-4 rounded-full" style={{ backgroundColor: tertiary, opacity: 0.5 }} />
                  <h3
                    className="truncate text-[11px] font-black leading-tight tracking-tight"
                    style={{
                      color: primary,
                      fontFamily: headingFont,
                      fontWeight: headingWeight,
                    }}
                  >
                    {name.split(' ')[0]}
                  </h3>
                </div>
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full shadow-sm"
                  style={{ backgroundColor: surface }}
                >
                  <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: primary }} />
                </div>
              </div>
            </div>

            {/* Hero Section */}
            <div className="px-3">
              <div
                className="relative overflow-hidden rounded-2xl p-3 shadow-sm border border-black/5"
                style={{ backgroundColor: surface }}
              >
                <div
                  className="absolute -top-6 -right-6 h-14 w-14 rounded-full opacity-10"
                  style={{ backgroundColor: primary }}
                />
                <div className="relative space-y-1.5">
                  <div className="h-2 w-3/4 rounded-full" style={{ backgroundColor: primary }} />
                  <div className="h-1 w-full rounded-full opacity-30" style={{ backgroundColor: secondary }} />
                  <div className="h-1 w-1/2 rounded-full opacity-30" style={{ backgroundColor: secondary }} />
                  <div
                    className="mt-2 flex h-4.5 w-14 items-center justify-center rounded-lg text-[6.5px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: primary }}
                  >
                    Get Started
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Content List */}
            <div className="mt-4 flex-1 space-y-3 px-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div
                    className="h-10 w-10 shrink-0 rounded-2xl shadow-inner"
                    style={{ backgroundColor: i === 1 ? secondary : tertiary, opacity: 0.15 }}
                  />
                  <div className="flex-1 space-y-2">
                    <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: primary, opacity: 0.2 }} />
                    <div className="h-1 w-2/3 rounded-full" style={{ backgroundColor: secondary, opacity: 0.1 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Premium Tab Bar */}
            <div
              className="flex items-center justify-around border-t py-3"
              style={{
                backgroundColor: surface,
                borderColor: `${tertiary}15`,
              }}
            >
              {[true, false, false, false].map((active, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-0.5"
                >
                   <div
                    className="h-2 w-2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: active ? primary : `${tertiary}40`,
                      transform: active ? 'scale(1.1)' : 'scale(1)',
                    }}
                  />
                  {active && <div className="h-0.5 w-1 rounded-full" style={{ backgroundColor: primary }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info section */}
      <div className="flex flex-1 flex-col gap-5 bg-white p-7">
        <header className="flex flex-col gap-2">
          <h2
            className="text-2xl font-black tracking-tight text-gray-900"
            style={{ fontFamily: headingFont, fontWeight: headingWeight }}
          >
            {name}
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 line-clamp-2">{description}</p>
        </header>

        {mood.length > 0 ? (
          <ul className="flex flex-wrap gap-2" aria-label="분위기 키워드">
            {mood.map((keyword) => (
              <li
                key={keyword}
                className="rounded-full px-3 py-1 text-[11px] font-bold tracking-tight uppercase"
                style={{
                  color: primary,
                  backgroundColor: `${primary}10`,
                }}
              >
                #{keyword}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex items-center justify-between">
          <div
            className="flex -space-x-2"
            aria-label="컬러 팔레트"
          >
            {colors
              ? ["primary", "secondary", "tertiary", "surface", "background"].map(
                  (key) => (
                    <span
                      key={key}
                      title={`${key}: ${colors[key]}`}
                      className="h-9 w-9 rounded-full border-2 border-white shadow-sm ring-1 ring-black/5"
                      style={{ backgroundColor: colors[key] }}
                    />
                  ),
                )
              : null}
          </div>
          
          {font_pairing ? (
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Font Pairing</p>
              <p className="text-xs font-semibold text-gray-700">{font_pairing.heading} / {font_pairing.body}</p>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
