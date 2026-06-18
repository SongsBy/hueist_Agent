// app/components/SketchbookModal.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import { X, RefreshCw, AlertTriangle } from "lucide-react";
import { useToneStore } from "../store/useToneStore";

// react-live 가 생성 코드 안에서 쓸 수 있는 유일한 의존성. (결과 페이지와 동일 정책)
// noInline 모드라 생성 코드는 컴포넌트를 정의하고 render(<App/>) 로 끝나야 한다.
const SCOPE = { React, useState };

// LLM 이 (금지했음에도) import/export 를 끼워 넣으면 react-live 의 sucrase 가
// 이를 require() 로 변환 → 브라우저에 require 가 없어 "require is not defined" 로
// 깨진다. 트랜스파일 직전에 모듈 구문을 싹 제거해 방어한다.
function stripModuleSyntax(code) {
  if (typeof code !== "string") return "";
  return code
    // 일부 모델이 흘리는 단독 ``` 마커 줄(언어태그 포함) 제거. 비대칭 펜스가
    // 남아오면 여기서 한 번 더 걷어내 react-live 파싱 에러를 막는다(이중 방어).
    .replace(/^\s*```[a-zA-Z]*\s*$/gm, "")
    // import X from '...'; / import { a, b } from '...'; / import '...';
    .replace(
      /import\s+(?:[\w*{}\n\r\t, ]+\s+from\s+)?['"][^'"]+['"];?/g,
      "",
    )
    // export default ... → 그냥 선언으로
    .replace(/export\s+default\s+/g, "")
    // 그 외 export 키워드 제거
    .replace(/^\s*export\s+/gm, "");
}

// 시선을 잡는 반짝이는 스켈레톤. AI가 화면을 그리는 동안 폰 내부에 표시된다.
function PreviewSkeleton() {
  return (
    <div className="h-full w-full overflow-hidden px-5 pt-6" aria-hidden="true">
      <div className="flex items-center justify-between">
        <div className="sk-shimmer h-[18px] w-2/5 rounded-lg" />
        <div className="sk-shimmer h-10 w-10 rounded-full" />
      </div>
      <div className="sk-shimmer mt-5 h-40 w-full rounded-3xl" />
      <div className="sk-shimmer mt-5 h-4 w-1/2 rounded-lg" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="mt-3 flex items-center gap-3 rounded-2xl bg-white/60 p-3">
          <div className="sk-shimmer h-11 w-11 rounded-xl" />
          <div className="flex-1">
            <div className="sk-shimmer h-3 w-2/3 rounded" />
            <div className="sk-shimmer mt-2 h-2.5 w-2/5 rounded" />
          </div>
        </div>
      ))}

      <style jsx>{`
        .sk-shimmer {
          background: linear-gradient(
            100deg,
            rgba(148, 163, 184, 0.18) 30%,
            rgba(226, 232, 240, 0.85) 50%,
            rgba(148, 163, 184, 0.18) 70%
          );
          background-size: 220% 100%;
          animation: sk-slide 1.3s ease-in-out infinite;
        }
        @keyframes sk-slide {
          0% {
            background-position: 180% 0;
          }
          100% {
            background-position: -40% 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .sk-shimmer {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

export default function SketchbookModal({ tone, onClose }) {
  // ── 실제 생성 파이프라인에 연결 ─────────────────────────────────────
  // generateUi() 는 store 의 selectedTone + survey 를 /api/generate-ui 로 보내
  // react-live 로 렌더할 JSX 코드를 받아 generatedUiCode 에 채운다.
  const generatedUiCode = useToneStore((s) => s.generatedUiCode);
  const isGeneratingUi = useToneStore((s) => s.isGeneratingUi);
  const generateUiError = useToneStore((s) => s.generateUiError);
  const generateUi = useToneStore((s) => s.generateUi);

  // 모달이 열린 직후 1회 자동 생성. (StrictMode 이중 호출 방지용 ref 가드)
  const didKickoff = useRef(false);

  const runGenerate = () => {
    if (isGeneratingUi) return;
    // 생성 호출은 fire-and-forget. 에러는 store(generateUiError) 로 노출한다.
    generateUi().catch(() => {});
  };

  useEffect(() => {
    if (didKickoff.current) return;
    didKickoff.current = true;
    // 최신 store 상태를 직접 읽어 중복 호출을 막는다. (recommend 진입 시 클릭
    // 핸들러가 이미 generateUi() 를 띄웠다면 isGeneratingUi 가 true 라 건너뛴다.)
    const s = useToneStore.getState();
    if (!s.generatedUiCode && !s.isGeneratingUi) s.generateUi().catch(() => {});
  }, []);

  // ESC 로 닫기 + 모달 열림 동안 배경 스크롤 잠금 (모달 필수 UX)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const colors = tone?.colors ?? {};
  const {
    primary = "#4F46E5",
    tertiary = "#A78BFA",
    background = "#FFFFFF",
  } = colors;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="디자인 스케치북"
      className="fixed inset-0 z-[200] flex bg-slate-950"
    >
      {/* Ambient color glows (선택한 톤 색으로 분위기) */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full opacity-25 blur-[140px]"
        style={{ backgroundColor: primary }}
      />
      <div
        className="pointer-events-none absolute -right-40 -bottom-40 h-[32rem] w-[32rem] rounded-full opacity-20 blur-[140px]"
        style={{ backgroundColor: tertiary }}
      />

      {/* ════════════════ 우측: Main Canvas ════════════════ */}
      <main className="relative z-0 flex flex-1 flex-col">
        {/* 그리드 캔버스 배경 */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
            maskImage:
              "radial-gradient(ellipse 80% 70% at 50% 45%, #000 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 70% at 50% 45%, #000 40%, transparent 100%)",
          }}
        />

        {/* Canvas toolbar */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-xs font-medium text-white/60 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            Live Preview · Mobile · 390 × 844
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={runGenerate}
              disabled={isGeneratingUi}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-xs font-medium text-white/70 backdrop-blur transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw size={13} className={isGeneratingUi ? "animate-spin" : ""} />
              다시 생성
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="스케치북 닫기"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/70 backdrop-blur transition-colors hover:bg-rose-500/20 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 표준 모바일 앱 뷰포트 (390 × 844). 장식용 폰 목업을 걷어내고
            실제 앱이 도는 듯한 깔끔한 표준 사이즈 프레임으로 렌더한다. */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-6 pb-10">
          <div
            className="hueist-app-viewport relative flex h-[min(844px,calc(100vh-9rem))] w-[390px] flex-col overflow-hidden rounded-[1.75rem] ring-1 ring-black/10 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.06)]"
            style={{ backgroundColor: background }}
          >
            {/* 스크롤 뷰: 앱 내부에서만 스크롤. 톤 배경색으로 채워 콘텐츠가
                짧아도 화면 전체가 앱처럼 보이게 한다. */}
            <div className="h-full w-full overflow-y-auto overscroll-contain">
              {isGeneratingUi ? (
                  <PreviewSkeleton />
                ) : generateUiError ? (
                  <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                      <AlertTriangle size={26} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        화면 생성에 실패했어요
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        {generateUiError}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={runGenerate}
                      className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
                      style={{ backgroundColor: primary }}
                    >
                      다시 시도
                    </button>
                  </div>
                ) : generatedUiCode ? (
                  <LiveProvider
                    code={generatedUiCode}
                    scope={SCOPE}
                    transformCode={stripModuleSyntax}
                    noInline
                  >
                    <LivePreview style={{ display: "block", minHeight: "100%", width: "100%" }} />
                    <LiveError className="m-3 rounded-xl bg-red-50 p-3 font-mono text-[11px] whitespace-pre-wrap text-red-700" />
                  </LiveProvider>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
                    <p className="text-sm font-medium text-slate-500">
                      이 톤으로 화면을 생성할 준비가 됐어요.
                    </p>
                    <button
                      type="button"
                      onClick={runGenerate}
                      className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
                      style={{ backgroundColor: primary }}
                    >
                      화면 생성하기
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
