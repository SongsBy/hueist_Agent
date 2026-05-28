// app/customize/page.jsx
"use client";

import { useRouter } from "next/navigation";

export default function CustomizePage() {
  const router = useRouter();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-bold">STEP 3 — 톤 선택 + 강도 조절</h1>

      <p className="text-gray-500">
        (Mock) 선택한 톤 미리보기와 강도 슬라이더가 여기에 표시됩니다.
      </p>

      <button
        type="button"
        onClick={() => router.push("/result")}
        className="rounded-lg bg-black px-6 py-3 text-white"
      >
        디자인 시스템 생성하기 →
      </button>
    </main>
  );
}
