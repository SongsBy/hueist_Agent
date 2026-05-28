// app/recommend/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToneStore } from "../store/useToneStore";
import ToneCard from "../components/ToneCard";

export default function RecommendPage() {
  const router = useRouter();
  const recommendedTones = useToneStore((state) => state.recommendedTones);

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

  if (!recommendedTones || recommendedTones.length === 0) {
    return null;
  }

  const handleSelect = (tone) => {
    useToneStore.getState().setSelectedTone(tone);
    router.push("/customize");
  };

  return (
    <main className="flex flex-1 flex-col items-center gap-8 p-8">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold">STEP 2 — AI가 추천한 톤 3장</h1>
        <p className="text-sm text-gray-500">
          마음에 드는 분위기의 카드를 골라주세요.
        </p>
      </header>

      <section
        aria-label="추천 톤 카드 목록"
        className="grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-3"
      >
        {recommendedTones.map((tone, index) => (
          <ToneCard
            key={tone?.name ?? `tone-${index}`}
            tone={tone}
            onSelect={handleSelect}
          />
        ))}
      </section>
    </main>
  );
}
