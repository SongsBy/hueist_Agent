// app/create/page.jsx
// 홈에서 "시작하기"를 누르면 이동하는 생성 시작 화면.
// 상단 히어로 문구 + 프롬프트 입력, 그 아래에 홈의 레퍼런스(템플릿) 선택을 재사용한다.
// 제출하면 프롬프트를 survey.free_text 로 저장하고 /api/recommend 로 톤을 받아 /recommend 로 이동한다.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Sparkles } from "lucide-react";
import { useToneStore } from "../store/useToneStore";
import ReferenceGallery from "../components/home/ReferenceGallery";

export default function CreatePage() {
  const router = useRouter();
  const setSurvey = useToneStore((s) => s.setSurvey);
  const setRecommendedTones = useToneStore((s) => s.setRecommendedTones);
  const selectedTemplateId = useToneStore((s) => s.selectedTemplateId);

  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      toast.error("만들고 싶은 내용을 입력해주세요.");
      return;
    }
    if (isLoading) return;

    setIsLoading(true);
    try {
      // 프롬프트를 설문의 자유 입력으로 저장해 recommend 파이프라인에 태운다.
      setSurvey({ free_text: trimmed });

      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          survey: { free_text: trimmed },
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? "톤 추천에 실패했어요. 다시 시도해주세요.");
      }

      const { tones } = await response.json();
      if (!Array.isArray(tones) || tones.length === 0) {
        throw new Error("추천 결과가 비어 있어요. 다시 시도해주세요.");
      }

      setRecommendedTones(tones);
      router.push("/recommend");
    } catch (error) {
      toast.error(error?.message ?? "톤 추천에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 bg-white">
      {/* ── 히어로 헤더 ── */}
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-10 text-center sm:px-8 sm:pt-24">
        <p className="text-base font-semibold text-emerald-500">
          무엇이든 만들 수 있어요
        </p>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl">
          무엇을 만들고 싶으신가요?
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-gray-500 sm:text-lg">
          템플릿을 선택한 후 프롬프트를 입력해 실현시켜 보세요.
        </p>

        {/* ── 프롬프트 입력 ── */}
        <div className="mx-auto mt-8 max-w-2xl">
          <div className="relative rounded-3xl border border-gray-200 bg-white p-2 shadow-sm transition-shadow focus-within:shadow-md">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  handleSubmit();
                }
              }}
              rows={3}
              placeholder="예: 반려동물 산책 기록을 공유하는 커뮤니티 앱을 만들고 싶어요"
              className="block w-full resize-none rounded-2xl bg-transparent px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-xs text-gray-400">
                {selectedTemplateId
                  ? "템플릿이 선택되었어요"
                  : "아래에서 템플릿을 선택할 수 있어요"}
              </span>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="group inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles
                  size={16}
                  className="text-amber-300"
                  strokeWidth={2.4}
                />
                {isLoading ? "생성 중…" : "실현하기"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 레퍼런스(템플릿) 선택: 홈 갤러리를 선택 모드로 재사용 ── */}
      <ReferenceGallery selectable />
    </main>
  );
}
