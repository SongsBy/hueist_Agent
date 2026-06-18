// app/result/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import toast from "react-hot-toast";
import { useToneStore } from "../store/useToneStore";
import { checkContrast, describeColor } from "../lib/colorUtils";
import { FALLBACK_FONT_STACK } from "../lib/googleFonts";
import { useDynamicGoogleFont } from "../lib/useDynamicGoogleFont";
import ToneMockup from "../components/ToneMockup";



// 스크린샷 레퍼런스의 컬러 팔레트 카드 순서/역할 라벨.
// 키는 백엔드 색상 토큰에 그대로 대응한다.
const PALETTE_ROLES = [
  { key: "primary", role: "주요 색상 (Primary Color)" },
  { key: "secondary", role: "보조 색상 (Secondary Color)" },
  { key: "background", role: "배경 색상 (Background Color)" },
  { key: "tertiary", role: "강조 색상 (Accent Color)" },
  { key: "surface", role: "표면 색상 (Surface Color)" },
];

export default function ResultPage() {
  const router = useRouter();
  const selectedTone = useToneStore((state) => state.selectedTone);


  const fontHref = selectedTone?.typography?.google_font_url ?? null;
  useDynamicGoogleFont(fontHref);

  const pageFonts = useMemo(() => {
    const typography = selectedTone?.typography;
    const pairing = selectedTone?.font_pairing;
    const fallback = typography?.fallback_stack ?? FALLBACK_FONT_STACK;
    const heading = typography?.heading_font ?? pairing?.heading;
    const body = typography?.body_font ?? pairing?.body;
    return {
      headingFont: heading ? `'${heading}', ${fallback}` : undefined,
      bodyFont: body ? `'${body}', ${fallback}` : undefined,
      headingWeight: typography?.font_weight_map?.heading,
      bodyWeight: typography?.font_weight_map?.body,
    };
  }, [selectedTone]);

  const [hasHydrated, setHasHydrated] = useState(
    () => useToneStore.persist?.hasHydrated?.() ?? false,
  );

  useEffect(() => {
    const unsubscribe = useToneStore.persist?.onFinishHydration?.(() =>
      setHasHydrated(true),
    );
    if (useToneStore.persist?.hasHydrated?.()) setHasHydrated(true);
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!selectedTone) router.replace("/");
  }, [hasHydrated, selectedTone, router]);

  const hasContrastWarning = useMemo(() => {
    if (!selectedTone?.colors) return false;
    const { primary, background } = selectedTone.colors;
    if (!primary || !background) return false;
    return !checkContrast(background, primary);
  }, [selectedTone]);

  // Hydration 복원 전에는 텍스트 폴백 없이 아무것도 렌더링하지 않아 깜빡임을 막는다.
  if (!hasHydrated) return null;

  if (!selectedTone) return null;

  const {
    name,
    description,
    mood = [],
    colors,
    font_pairing,
    typography,
  } = selectedTone;

  const { primary = "#1A237E" } = colors ?? {};

  const headingFamily = font_pairing?.heading ?? typography?.heading_font;
  const bodyFamily = font_pairing?.body ?? typography?.body_font;
  const headingWeight = typography?.font_weight_map?.heading;
  const bodyWeight = typography?.font_weight_map?.body;



  return (
    <main
      className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-12"
      style={{
        fontFamily: pageFonts.bodyFont,
        fontWeight: pageFonts.bodyWeight,
      }}
    >
      {/* === Header === */}
      <header className="flex flex-col items-center gap-4 text-center">
        <p className="text-xs font-semibold tracking-[0.28em] text-gray-400 uppercase">
          STEP 4 — Final Design System
        </p>
        <h1
          className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl"
          style={{
            fontFamily: pageFonts.headingFont,
            fontWeight: pageFonts.headingWeight,
          }}
        >
          {name}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-gray-500">
            {description}
          </p>
        ) : null}

        {mood.length > 0 ? (
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-medium tracking-wide text-gray-400">
              Mood
            </span>
            <ul className="flex flex-wrap justify-center gap-2" aria-label="분위기 키워드">
              {mood.map((keyword) => (
                <li
                  key={keyword}
                  className="rounded-full px-3.5 py-1 text-xs font-medium"
                  style={{
                    color: primary,
                    backgroundColor: `${primary}0d`,
                    boxShadow: `inset 0 0 0 1px ${primary}33`,
                  }}
                >
                  {keyword}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </header>

      {/* Ghost divider — 색 대비로 경계를 만든다 (DESIGN.md No-Line Rule). */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      {/* === Phone preview + spec === */}
      <div className="grid w-full items-start gap-12 lg:grid-cols-[auto_1fr]">
        <div className="flex justify-center lg:justify-start">
          <ToneMockup
            colors={colors}
            typography={typography}
            font_pairing={font_pairing}
            appName={name}
            showBackground={false}
            scale={1.55}
          />
        </div>

        <div className="flex flex-col gap-10">
          {/* Color palette */}
          <section aria-label="컬러 팔레트">
            <h2
              className="mb-4 text-xl font-bold tracking-tight text-gray-900"
              style={{
                fontFamily: pageFonts.headingFont,
                fontWeight: pageFonts.headingWeight,
              }}
            >
              컬러 팔레트 (Color Palette)
            </h2>
            <div className="flex flex-col gap-3">
              {colors
                ? PALETTE_ROLES.map(({ key, role }) => {
                  const hex = colors[key];
                  if (!hex) return null;
                  const { ko, en } = describeColor(hex);
                  return (
                    <figure
                      key={key}
                      className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_16px_-6px_rgba(15,23,42,0.12)]"
                    >
                      <span
                        aria-hidden="true"
                        className="h-12 w-12 shrink-0 rounded-xl ring-1 ring-black/5"
                        style={{ backgroundColor: hex }}
                      />
                      <figcaption className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-bold text-gray-900">
                          {ko} ({en})
                        </span>
                        <span className="truncate text-xs text-gray-400">
                          {role}
                        </span>
                      </figcaption>
                      <span className="shrink-0 font-mono text-sm tracking-wide text-gray-400">
                        {hex.toUpperCase()}
                      </span>
                    </figure>
                  );
                })
                : null}
            </div>
          </section>

          {/* Font pairing */}
          {font_pairing ? (
            <section aria-label="폰트 조합">
              <h2
                className="mb-4 text-xl font-bold tracking-tight text-gray-900"
                style={{
                  fontFamily: pageFonts.headingFont,
                  fontWeight: pageFonts.headingWeight,
                }}
              >
                폰트 조합 (Font Pairing)
              </h2>
              <div className="flex flex-col gap-5">
                {headingFamily ? (
                  <div>
                    <h3
                      className="text-base font-bold text-gray-900"
                      style={{ fontFamily: pageFonts.headingFont, fontWeight: headingWeight }}
                    >
                      프라이머리 폰트: {headingFamily}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                      {typography?.font_rationale ??
                        `${headingFamily}은(는) 제목과 강조 텍스트에 사용되어 브랜드의 인상을 결정합니다.`}
                    </p>
                  </div>
                ) : null}
                {bodyFamily ? (
                  <div>
                    <h3
                      className="text-base font-bold text-gray-900"
                      style={{ fontFamily: pageFonts.headingFont, fontWeight: headingWeight }}
                    >
                      세컨더리 폰트: {bodyFamily}
                    </h3>
                    <p
                      className="mt-1.5 text-sm leading-relaxed text-gray-500"
                      style={{ fontFamily: pageFonts.bodyFont, fontWeight: bodyWeight }}
                    >
                      {bodyFamily}은(는) 본문 텍스트에 사용되어 가독성과 일관된
                      읽기 흐름을 만듭니다.
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>
      </div>



      {/* === Contrast warning === */}
      {hasContrastWarning ? (
        <div
          role="alert"
          className="flex w-full items-start gap-3 rounded-2xl bg-amber-50 px-5 py-4 text-sm text-amber-800 shadow-[0_2px_16px_-6px_rgba(180,83,9,0.25)]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-500"
            aria-hidden="true"
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
          <p className="leading-relaxed">
            <span className="font-semibold">주의:</span> 대비율이 낮은 색상 조합은
            웹 콘텐츠 접근성 지침(WCAG)을 준수하지 않을 수 있습니다. 디자인 시스템
            적용 시 대비율 확인이 필요합니다.
          </p>
        </div>
      ) : null}
    </main>
  );
}
