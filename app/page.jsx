// app/page.jsx
"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useToneStore } from "./store/useToneStore";

async function fetchRecommendedTones(appDescription) {
  const response = await fetch("/api/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appDescription }),
  });

  if (!response.ok) {
    const fallback = "톤 추천에 실패했어요. 잠시 후 다시 시도해주세요.";
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error ?? fallback);
  }

  return response.json();
}

export default function HomePage() {
  const router = useRouter();
  const appDescription = useToneStore((state) => state.appDescription);
  const setAppDescription = useToneStore((state) => state.setAppDescription);
  const setRecommendedTones = useToneStore(
    (state) => state.setRecommendedTones,
  );

  const mutation = useMutation({
    mutationFn: fetchRecommendedTones,
    onSuccess: (data) => {
      const tones = Array.isArray(data?.tones) ? data.tones : [];
      if (tones.length === 0) {
        toast.error("추천 결과가 비어있어요. 다시 시도해주세요.");
        return;
      }
      setRecommendedTones(tones);
      router.push("/recommend");
    },
    onError: (error) => {
      toast.error(
        error?.message ?? "톤 추천에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
    },
  });

  const trimmedDescription = appDescription.trim();
  const isPending = mutation.isPending;
  const isDisabled = trimmedDescription.length === 0 || isPending;

  const handleSubmit = () => {
    if (isDisabled) return;
    mutation.mutate(trimmedDescription);
  };

  const handleKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-bold">STEP 1 — 어떤 앱인가요?</h1>

      <label htmlFor="app-description" className="sr-only">
        앱 설명 입력
      </label>
      <textarea
        id="app-description"
        className="w-full max-w-xl rounded-lg border border-gray-300 p-4 disabled:cursor-not-allowed disabled:bg-gray-100"
        rows={4}
        placeholder="예: 사용자가 매일 마신 물 양을 기록하는 미니멀한 트래커 앱"
        value={appDescription}
        onChange={(event) => setAppDescription(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isPending}
        aria-describedby="app-description-help"
      />
      <p
        id="app-description-help"
        className="-mt-6 text-xs text-gray-500"
      >
        ⌘/Ctrl + Enter 로도 제출할 수 있어요.
      </p>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isDisabled}
        aria-busy={isPending}
        className="rounded-lg bg-black px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? "AI가 톤을 분석 중이에요..." : "톤 추천 받기 →"}
      </button>
    </main>
  );
}
