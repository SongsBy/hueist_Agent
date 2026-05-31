// app/components/ToneCard.jsx
"use client";

import { FALLBACK_FONT_STACK } from "../lib/googleFonts";
import ToneMockup from "./ToneMockup";

// NOTE: 폰트 <link> 주입은 부모(recommend 페이지)가 모든 톤을 병합해 한 번에
// 처리한다(중복 제거 + 단일 요청 + FOUT 페이드인). 카드 단위로 또 로드하면
// 동일 폰트를 중복 요청하므로 여기서는 로드하지 않는다.
export default function ToneCard({
  tone,
  isSelected = false,
  onSelect,
  onViewDetail,
}) {
  if (!tone) return null;

  const { name, description, mood = [], colors, font_pairing, typography } = tone;

  const { primary = "#111827" } = colors ?? {};

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

  // 상세보기 버튼은 카드 선택 토글과 분리한다. 버블링을 막아야
  // 버튼 클릭이 카드의 onSelect(선택 해제)로 이어지지 않는다.
  const handleViewDetailClick = (event) => {
    event.stopPropagation();
    if (typeof onViewDetail === "function") onViewDetail(tone);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${name} 톤 선택`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`group flex w-full cursor-pointer flex-col overflow-hidden rounded-4xl border-4 bg-white shadow-xl transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-offset-2 ${
        isSelected
          ? "border-gray-900 ring-4 ring-gray-900/30"
          : "border-transparent hover:border-gray-200"
      }`}
    >
      {/* === Phone preview area === */}
      <ToneMockup
        colors={colors}
        typography={typography}
        font_pairing={font_pairing}
        appName={name}
      />

      {/* === Info section === */}
      <div
        className="flex flex-1 flex-col gap-5 bg-white p-7"
        style={{ fontFamily: bodyFont, fontWeight: bodyWeight }}
      >
        <header className="flex flex-col gap-2">
          <h2
            className="text-2xl font-black tracking-tight text-gray-900"
            style={{ fontFamily: headingFont, fontWeight: headingWeight }}
          >
            {name}
          </h2>
          {description ? (
            <p
              className="line-clamp-2 text-sm leading-relaxed text-gray-600"
              style={{ fontFamily: bodyFont, fontWeight: bodyWeight }}
            >
              {description}
            </p>
          ) : null}
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
                  fontFamily: bodyFont,
                }}
              >
                #{keyword}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex items-center justify-between">
          <div className="flex -space-x-2" aria-label="컬러 팔레트">
            {colors
              ? ["primary", "secondary", "tertiary", "surface", "background"].map(
                  (key) =>
                    colors[key] ? (
                      <span
                        key={key}
                        title={`${key}: ${colors[key]}`}
                        className="h-9 w-9 rounded-full border-2 border-white shadow-sm ring-1 ring-black/5"
                        style={{ backgroundColor: colors[key] }}
                      />
                    ) : null,
                )
              : null}
          </div>

          {font_pairing ? (
            <div className="text-right">
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Font Pairing
              </p>
              <p
                className="text-xs font-semibold text-gray-700"
                style={{ fontFamily: headingFont }}
              >
                {font_pairing.heading} / {font_pairing.body}
              </p>
            </div>
          ) : null}
        </div>

        {/* 선택 시에만 부드럽게 등장하는 상세보기 버튼.
            항상 마운트해두고 클래스만 토글해 fade-in + slide-up 전환을 만든다. */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-out ${
            isSelected
              ? "max-h-24 translate-y-0 opacity-100"
              : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
          }`}
          aria-hidden={!isSelected}
        >
          <button
            type="button"
            onClick={handleViewDetailClick}
            tabIndex={isSelected ? 0 : -1}
            className="w-full rounded-2xl bg-gray-900 px-5 py-3 text-sm font-bold tracking-tight text-white shadow-lg transition-colors hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-900/30"
            style={{ fontFamily: headingFont, fontWeight: headingWeight }}
          >
            상세보기
          </button>
        </div>
      </div>
    </article>
  );
}
