// app/page.jsx
"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useToneStore } from "./store/useToneStore";
import SurveyFlow from "./components/survey/SurveyFlow";

async function fetchRecommendedTones(survey) {
  const response = await fetch("/api/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ survey }),
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

  const handleSubmit = (survey) => {
    if (mutation.isPending) return;
    mutation.mutate(survey);
  };

  // 몰입형 헤더·배경은 SurveyFlow가 자체적으로 그린다. 페이지는 풀블리드만 제공.
  return (
    <main className="flex-1">
      <SurveyFlow onSubmit={handleSubmit} isPending={mutation.isPending} />
    </main>
  );
}
