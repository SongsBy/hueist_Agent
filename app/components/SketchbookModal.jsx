// app/components/SketchbookModal.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import { Sparkles, Send, Paperclip, X, RefreshCw, Bot, AlertTriangle } from "lucide-react";
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

  // 챗 입력은 전송 시 비워주되, 현재 API 는 추가 프롬프트를 받지 않으므로
  // 전송 = "이 톤으로 다시 생성"으로 연결한다. (프롬프트 반영은 후속 작업)
  const [draft, setDraft] = useState("");
  const handleSend = () => {
    setDraft("");
    runGenerate();
  };

  const colors = tone?.colors ?? {};
  const {
    primary = "#4F46E5",
    tertiary = "#A78BFA",
    background = "#FFFFFF",
  } = colors;

  const paletteSwatches = ["primary", "secondary", "tertiary", "surface", "background"];

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

      {/* ════════════════ 좌측: Chat Panel ════════════════ */}
      <aside className="relative z-10 flex w-[380px] shrink-0 flex-col border-r border-white/10 bg-white/[0.04] backdrop-blur-2xl">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg"
            style={{ backgroundImage: `linear-gradient(135deg, ${primary}, ${tertiary})` }}
          >
            <Sparkles size={20} className="text-white" strokeWidth={2.4} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[15px] font-bold tracking-tight text-white">
              디자인 에이전트
            </h2>
            <p className="flex items-center gap-1.5 text-xs text-white/50">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              {tone?.name ?? "AI Design Agent"} · 온라인
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="스케치북 닫기"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </header>

        {/* Messages */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-6">
          {/* 시스템: 적용된 팔레트 */}
          <div className="flex flex-col items-center gap-2">
            <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[11px] font-medium tracking-wide text-white/40">
              적용된 컬러 팔레트
            </span>
            <div className="flex -space-x-1.5">
              {paletteSwatches.map((key) =>
                colors[key] ? (
                  <span
                    key={key}
                    title={`${key}: ${colors[key]}`}
                    className="h-6 w-6 rounded-full border-2 border-slate-900 shadow"
                    style={{ backgroundColor: colors[key] }}
                  />
                ) : null,
              )}
            </div>
          </div>

          {/* AI 인사말 말풍선 */}
          <div className="flex items-end gap-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow"
              style={{ backgroundImage: `linear-gradient(135deg, ${primary}, ${tertiary})` }}
            >
              <Bot size={16} className="text-white" />
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.07] px-4 py-3 text-[13px] leading-relaxed text-white/85">
              안녕하세요! 선택하신{" "}
              <span className="font-semibold text-white">
                {tone?.name ?? "이 색상"}
              </span>{" "}
              팔레트로 첫 화면을 그리고 있어요. ✨
            </div>
          </div>

          {/* 실시간 생성 상태 말풍선 (실제 store 상태 반영) */}
          <div className="flex items-end gap-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow"
              style={{ backgroundImage: `linear-gradient(135deg, ${primary}, ${tertiary})` }}
            >
              <Bot size={16} className="text-white" />
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.07] px-4 py-3 text-[13px] leading-relaxed text-white/85">
              {isGeneratingUi ? (
                <span className="flex items-center gap-2">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </span>
                  화면을 그리는 중이에요…
                </span>
              ) : generateUiError ? (
                <span className="text-rose-300">
                  생성에 실패했어요. 아래 전송 버튼이나 새로고침으로 다시 시도해 주세요.
                </span>
              ) : generatedUiCode ? (
                <>오른쪽에 화면을 완성했어요. 수정하고 싶은 부분을 말씀해 주세요. 🎨</>
              ) : (
                <>준비됐어요. 전송을 누르면 이 톤으로 화면을 생성합니다.</>
              )}
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.06] p-2 pl-3 transition-colors focus-within:border-white/25">
            <button
              type="button"
              aria-label="파일 첨부"
              className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
            >
              <Paperclip size={17} />
            </button>
            <textarea
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="원하는 디자인을 설명해 주세요…"
              className="max-h-28 flex-1 resize-none bg-transparent py-1.5 text-[13px] text-white placeholder:text-white/35 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={isGeneratingUi}
              aria-label="전송"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundImage: `linear-gradient(135deg, ${primary}, ${tertiary})`,
              }}
            >
              <Send size={16} strokeWidth={2.4} />
            </button>
          </div>
          <p className="mt-2 px-1 text-center text-[11px] text-white/30">
            Enter 로 전송 · Shift + Enter 줄바꿈
          </p>
        </div>
      </aside>

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
          <button
            type="button"
            onClick={runGenerate}
            disabled={isGeneratingUi}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-xs font-medium text-white/70 backdrop-blur transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw size={13} className={isGeneratingUi ? "animate-spin" : ""} />
            다시 생성
          </button>
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
