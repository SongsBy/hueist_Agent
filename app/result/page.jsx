// app/result/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToneStore } from "../store/useToneStore";
import { checkContrast } from "../lib/colorUtils";
import { FALLBACK_FONT_STACK } from "../lib/googleFonts";
import { useDynamicGoogleFont } from "../lib/useDynamicGoogleFont";
import AppPreview from "../components/AppPreview";

const COLOR_KEYS = [
  "primary",
  "secondary",
  "tertiary",
  "surface",
  "background",
];

export default function ResultPage() {
  const router = useRouter();
  const selectedTone = useToneStore((state) => state.selectedTone);
  const intensity = useToneStore((state) => state.intensity);

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

  if (!hasHydrated) {
    return (
      <main
        className="flex flex-1 items-center justify-center p-8"
        aria-busy="true"
      >
        <p className="text-gray-500">불러오는 중...</p>
      </main>
    );
  }

  if (!selectedTone) return null;

  const {
    name,
    description,
    mood = [],
    colors,
    font_pairing,
    typography,
  } = selectedTone;

  return (
    <main
      className="flex flex-1 flex-col items-center gap-10 p-8"
      style={{
        fontFamily: pageFonts.bodyFont,
        fontWeight: pageFonts.bodyWeight,
      }}
    >
      <header className="flex flex-col items-center gap-2 text-center">
        <p className="text-xs tracking-widest text-gray-400 uppercase">
          STEP 4 — Final Design System
        </p>
        <h1
          className="text-3xl font-bold"
          style={{
            fontFamily: pageFonts.headingFont,
            fontWeight: pageFonts.headingWeight,
          }}
        >
          {name}
        </h1>
        {description ? (
          <p className="max-w-xl text-sm text-gray-500">{description}</p>
        ) : null}
        <p className="text-xs text-gray-400">생성 강도 · {intensity}</p>
      </header>

      {mood.length > 0 ? (
        <ul
          className="flex flex-wrap justify-center gap-2"
          aria-label="분위기 키워드"
        >
          {mood.map((keyword) => (
            <li
              key={keyword}
              className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600"
            >
              {keyword}
            </li>
          ))}
        </ul>
      ) : null}

      {hasContrastWarning ? (
        <p
          role="alert"
          className="w-full max-w-2xl rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800"
        >
          ⚠️ 일부 색상 조합이 접근성(WCAG) 기준을 충족하지 못할 수 있어요. (자동
          보정 기능 준비 중)
        </p>
      ) : null}

      <div className="grid w-full max-w-5xl items-start gap-10 lg:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs tracking-widest text-gray-400 uppercase">
            Live App Preview
          </p>
          <AppPreview
            colors={colors}
            fontPairing={font_pairing}
            typography={typography}
            appName={name}
          />
          <p className="max-w-[20rem] text-center text-xs text-gray-500">
            선택한 컬러 시스템이 실제 앱에 적용된 모습이에요.
          </p>
        </div>

        <section
          aria-label="컬러 팔레트"
          className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-3"
        >
          {colors
            ? COLOR_KEYS.map((key) => {
                const hex = colors[key];
                if (!hex) return null;
                return (
                  <figure
                    key={key}
                    className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <span
                      aria-hidden="true"
                      className="h-24 w-24 rounded-full border border-black/10"
                      style={{ backgroundColor: hex }}
                    />
                    <figcaption className="flex flex-col items-center gap-1">
                      <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        {key}
                      </span>
                      <span className="font-mono text-sm text-gray-800">
                        {hex.toUpperCase()}
                      </span>
                    </figcaption>
                  </figure>
                );
              })
            : null}
        </section>
      </div>

      {font_pairing ? (
        <section
          aria-label="폰트 페어링"
          className="flex w-full max-w-2xl flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <h2
            className="text-lg font-semibold"
            style={{
              fontFamily: pageFonts.headingFont,
              fontWeight: pageFonts.headingWeight,
            }}
          >
            Font Pairing
          </h2>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Heading</dt>
              <dd className="font-medium text-gray-900">
                {font_pairing.heading}
                {typography?.font_weight_map?.heading ? (
                  <span className="ml-2 text-xs text-gray-400">
                    {typography.font_weight_map.heading}
                  </span>
                ) : null}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Body</dt>
              <dd className="font-medium text-gray-900">
                {font_pairing.body}
                {typography?.font_weight_map?.body ? (
                  <span className="ml-2 text-xs text-gray-400">
                    {typography.font_weight_map.body}
                  </span>
                ) : null}
              </dd>
            </div>
          </dl>
          {typography?.font_rationale ? (
            <p className="text-xs leading-relaxed text-gray-500">
              {typography.font_rationale}
            </p>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
