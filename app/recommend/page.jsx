// app/recommend/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Sparkles } from "lucide-react";
import { useToneStore } from "../store/useToneStore";
import ToneCard from "../components/ToneCard";
import LoadingOverlay from "../components/LoadingOverlay";
import {
  buildGoogleFontUrlForTones,
  collectFontFamiliesForTones,
} from "../lib/googleFonts";
import {
  useDynamicGoogleFont,
  useFontsReady,
} from "../lib/useDynamicGoogleFont";

export default function RecommendPage() {
  const router = useRouter();
  const recommendedTones = useToneStore((state) => state.recommendedTones);
  const isEnriching = useToneStore((state) => state.isEnriching);
  const enrichSelectedTone = useToneStore((state) => state.enrichSelectedTone);
  const setSelectedTone = useToneStore((state) => state.setSelectedTone);

  // 클릭으로 "선택"된 카드 인덱스. 선택만으로는 페이지가 넘어가지 않고,
  // 상세보기 버튼을 눌렀을 때만 보강 + 라우팅이 일어난다.
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Zustand persist는 클라이언트에서 localStorage를 비동기로 복원한다.
  // 복원 전에 redirect 판단을 내리면 정상 진입한 사용자도 홈으로 튕긴다.
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
    if (!Array.isArray(recommendedTones) || recommendedTones.length === 0) {
      router.replace("/");
    }
  }, [hasHydrated, recommendedTones, router]);

  // 추천 3개 톤의 폰트를 한 번에 로드한다. 중복 폰트는 제거되고, 모든 카드가
  // 단일 <link>로 묶여 요청 수를 줄인다. (Rules of Hooks: early return 이전 호출)
  const fontFamilies = useMemo(
    () => collectFontFamiliesForTones(recommendedTones),
    [recommendedTones],
  );
  const mergedFontUrl = useMemo(
    () => buildGoogleFontUrlForTones(recommendedTones),
    [recommendedTones],
  );
  useDynamicGoogleFont(mergedFontUrl);

  // 폰트가 준비되기 전에는 카드를 살짝 가렸다가 페이드인해 FOUT을 숨긴다.
  const fontsReady = useFontsReady(fontFamilies);

  // Hydration 복원 전에는 텍스트 폴백 없이 아무것도 렌더링하지 않아 깜빡임을 막는다.
  if (!hasHydrated) return null;

  if (!recommendedTones || recommendedTones.length === 0) {
    return null;
  }

  // 카드 클릭: 선택 상태만 전환한다. (페이지 전환 없음)
  const handleSelect = (index) => {
    setSelectedIndex((prev) => (prev === index ? null : index));
  };

  // 상세보기 버튼 클릭: 보강 API 호출 후 결과 페이지로 이동한다.
  const handleViewDetail = async (tone) => {
    // 보강 중에는 중복 호출 차단.
    if (isEnriching) return;
    try {
      await enrichSelectedTone(tone);
      router.push("/result");
    } catch (error) {
      toast.error(
        error?.message ?? "디자인 자산 보강에 실패했어요. 다시 시도해주세요.",
      );
    }
  };

  return (
    <>
      <main className="flex flex-1 flex-col items-center gap-8 p-8">
        <header className="flex flex-col items-center gap-2 text-center">
          <p className="text-xs tracking-[0.2em] text-gray-400 uppercase">
            STEP 2 — Moodboard
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            마음에 드는 분위기를 골라주세요
          </h1>
          <p className="max-w-md text-sm text-gray-500">
            카드를 선택하면 톤에 맞는 아이콘 · 폰트 · 컬러 스케일을 준비해
            드려요.
          </p>
        </header>

        <section
          aria-label="추천 톤 카드 목록"
          aria-busy={!fontsReady}
          className={`grid w-full max-w-6xl grid-cols-1 gap-6 transition-opacity duration-300 md:grid-cols-3 ${
            fontsReady ? "opacity-100" : "opacity-0"
          }`}
        >
          {recommendedTones.map((tone, index) => (
            <ToneCard
              key={`${tone?.name ?? ''}-${index}`}
              tone={tone}
              isSelected={selectedIndex === index}
              onSelect={() => handleSelect(index)}
              onViewDetail={handleViewDetail}
            />
          ))}
        </section>
      </main>

      {/* === 플로팅 CTA === 카드를 선택하면 하단에서 슬라이드업 되는 디자인 제작 버튼.
          누르면 스케치북 모달이 열린다. */}
      <div
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-7 transition-all duration-500 ease-out ${
          selectedIndex !== null
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-8 opacity-0"
        }`}
        aria-hidden={selectedIndex === null}
      >
        <button
          type="button"
          tabIndex={selectedIndex !== null ? 0 : -1}
          onClick={() => {
            if (selectedIndex === null) return;
            const tone = recommendedTones[selectedIndex];
            // store 의 selectedTone 을 세팅한 뒤 플레이그라운드로 이동한다.
            // (zustand set 은 동기라 같은 tick 에서 바로 반영되고, 이동한 화면이
            //  이 톤으로 첫 화면을 자동 생성한 뒤 채팅으로 수정까지 받는다.)
            setSelectedTone(tone);
            router.push("/mobile-playground");
          }}
          className="pointer-events-auto group inline-flex items-center gap-2.5 rounded-full bg-gray-900 py-4 pr-7 pl-6 text-base font-bold tracking-tight text-white shadow-[0_18px_45px_-12px_rgba(15,23,42,0.6)] ring-1 ring-white/10 transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.02] focus:ring-4 focus:ring-gray-900/30 focus:outline-none active:scale-[0.98]"
        >
          <Sparkles
            size={20}
            className="text-amber-300 transition-transform duration-500 group-hover:rotate-12"
            strokeWidth={2.4}
          />
          이 색상배치로 디자인 제작
          <span className="ml-1 hidden h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm transition-transform duration-200 group-hover:translate-x-0.5 sm:inline-flex">
            →
          </span>
        </button>
      </div>

      <LoadingOverlay />
    </>
  );
}
