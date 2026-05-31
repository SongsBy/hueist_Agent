// app/playground/page.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import {
  Sparkles,
  ArrowUp,
  Bot,
  User,
  Loader2,
  Wand2,
  MessageSquareDashed,
  RotateCcw,
} from "lucide-react";
import { useToneStore } from "../store/useToneStore";

// react-live 가 생성 코드 안에서 쓸 수 있는 유일한 의존성.
// LiveAppPreview 와 동일하게 순수 React + useState 만 주입한다(외부 라이브러리 0).
// noInline 모드라 생성 코드는 컴포넌트를 정의하고 render(<App/>) 로 끝나야 한다.
const SCOPE = { React, useState };

// code 의 초기값. "아직 아무것도 생성되지 않은" 상태를 위한 기본 디자인 컴포넌트.
// 인라인 스타일만 쓰므로 Tailwind 유무와 무관하게 항상 의도한 모습으로 렌더된다.
const PLACEHOLDER_CODE = `function App() {
  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        padding: "64px 24px",
        textAlign: "center",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "20px",
          display: "grid",
          placeItems: "center",
          background:
            "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
          boxShadow: "0 18px 40px -12px rgba(168,85,247,0.55)",
          color: "#fff",
          fontSize: "32px",
        }}
      >
        ✦
      </div>
      <h2 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em" }}>
        여기에 생성된 UI가 표시됩니다
      </h2>
      <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#64748b", maxWidth: "360px" }}>
        오른쪽 채팅창에 만들고 싶은 화면을 설명해 보세요.<br />
        AI가 실시간으로 이 캔버스에 UI를 그려드립니다.
      </p>
    </div>
  );
}

render(<App />);`;

// 첫 진입 시 보여줄 어시스턴트 환영 메시지.
const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "안녕하세요! 만들고 싶은 화면을 자유롭게 설명해 주세요. 예) “보라색 톤의 로그인 화면 만들어줘”",
};

export default function PlaygroundPage() {
  // === 핵심 상태 ===
  const [code, setCode] = useState(PLACEHOLDER_CODE);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");

  // react-live 는 브라우저 DOM 에 의존하므로 마운트 이후에만 미리보기를 렌더해
  // SSR/하이드레이션 깜빡임을 피한다.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // 현재 선택된 톤(색·폰트·무드)을 백엔드 맥락으로 함께 보낸다.
  const selectedTone = useToneStore((state) => state.selectedTone);

  // 새 메시지가 쌓이면 채팅 영역을 자동으로 맨 아래로 스크롤.
  const scrollRef = useRef(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage = { role: "user", content: text };
    // 직전까지의 대화 맥락(history)을 미리 확보해 두고 낙관적으로 화면에 추가한다.
    const history = messages;
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 유저 메시지 + 기존 대화 맥락 + 현재 톤 정보를 함께 전송한다.
        body: JSON.stringify({
          message: text,
          history,
          tone: selectedTone ?? null,
          currentCode: code,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? "UI 생성에 실패했어요. 다시 시도해주세요.");
      }

      const { code: nextCode } = await response.json();
      if (nextCode) setCode(nextCode);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "요청하신 화면을 캔버스에 반영했어요. 더 바꾸고 싶은 부분이 있으면 말씀해 주세요!",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error?.message ?? "문제가 발생했어요. 잠시 후 다시 시도해 주세요.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCode(PLACEHOLDER_CODE);
    setMessages([WELCOME_MESSAGE]);
    setInput("");
  };

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-slate-950 text-slate-100">
      {/* === 배경 분위기 레이어 (오로라 글로우 + 도트 그리드) === */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-indigo-600/30 blur-[120px]" />
        <div className="absolute -bottom-40 right-0 h-[32rem] w-[32rem] rounded-full bg-fuchsia-600/25 blur-[140px]" />
        <div className="absolute left-1/2 top-1/3 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-violet-500/20 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
        />
      </div>

      {/* === 상단 플로팅 헤더 (글래스) === */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-xl">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/30">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">생성형 UI 플레이그라운드</p>
            <p className="text-[11px] text-slate-400">AI가 그리는 실시간 인터페이스</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="group inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 backdrop-blur-xl transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-[0.97]"
        >
          <RotateCcw className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-180" />
          <span className="hidden sm:inline">새로 시작</span>
        </button>
      </header>

      {/* === 메인 캔버스 (Sketch 영역) === */}
      <section className="absolute inset-0 flex items-center justify-center px-4 pb-6 pt-24 sm:px-8 lg:pr-[27rem]">
        <div className="relative h-full w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
          {/* 캔버스 상단 브라우저 크롬 */}
          <div className="flex items-center gap-2 border-b border-slate-200/70 bg-slate-50/80 px-5 py-3 backdrop-blur">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
            <div className="mx-auto flex items-center gap-2 rounded-lg bg-white px-4 py-1 text-xs font-medium text-slate-400 ring-1 ring-slate-200">
              <Wand2 className="h-3 w-3" />
              preview.hueist.app
            </div>
          </div>

          {/* 실제 렌더 영역 */}
          <div className="relative h-[calc(100%-3rem)] overflow-auto bg-white text-slate-900">
            {mounted ? (
              <LiveProvider code={code} scope={SCOPE} noInline>
                {/* 로딩 중에는 미리보기를 흐리게 깔고 위에 스켈레톤/스피너를 띄운다. */}
                <div
                  className={`min-h-full transition-all duration-500 ${
                    isLoading ? "scale-[0.99] opacity-40 blur-[2px]" : "opacity-100"
                  }`}
                >
                  <LivePreview style={{ display: "block", minHeight: "100%" }} />
                </div>

                {/* 생성 코드가 깨졌을 때만 노출되는 인라인 에러. */}
                <LiveError className="absolute inset-x-4 bottom-4 z-10 max-h-40 overflow-auto whitespace-pre-wrap rounded-2xl border border-red-200 bg-red-50/95 p-4 font-mono text-xs leading-relaxed text-red-700 shadow-lg backdrop-blur" />
              </LiveProvider>
            ) : null}

            {/* === 로딩 오버레이 (캔버스 중앙) === */}
            {isLoading ? (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-white/40 backdrop-blur-sm">
                <div className="relative grid h-20 w-20 place-items-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-violet-400/40" />
                  <span className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 opacity-90" />
                  <Loader2 className="relative h-8 w-8 animate-spin text-white" />
                </div>
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm font-semibold text-slate-700">
                    AI가 화면을 그리는 중…
                  </p>
                  {/* 세련된 스켈레톤 라인 */}
                  <div className="flex w-56 flex-col gap-2.5">
                    <span className="h-3 w-2/3 animate-pulse rounded-full bg-slate-200" />
                    <span className="h-3 w-full animate-pulse rounded-full bg-slate-200 [animation-delay:120ms]" />
                    <span className="h-3 w-4/5 animate-pulse rounded-full bg-slate-200 [animation-delay:240ms]" />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* === 플로팅 챗 패널 (Glassmorphism) === */}
      <aside className="absolute inset-x-3 bottom-3 z-30 mx-auto flex h-[58dvh] max-w-md flex-col overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.7)] backdrop-blur-2xl sm:inset-x-auto sm:right-6 sm:bottom-6 sm:h-[calc(100dvh-7.5rem)] sm:w-[24rem]">
        {/* 챗 헤더 */}
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/40">
            <Bot className="h-5 w-5 text-white" />
          </span>
          <div className="flex-1 leading-tight">
            <p className="text-sm font-semibold text-white">Hue Assistant</p>
            <p className="flex items-center gap-1.5 text-[11px] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              온라인 · 실시간 생성
            </p>
          </div>
        </div>

        {/* 메시지 목록 */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto px-4 py-5 [scrollbar-width:thin]"
        >
          {messages.map((message, index) => (
            <ChatBubble key={index} role={message.role} content={message.content} />
          ))}

          {/* 로딩 중 타이핑 인디케이터 */}
          {isLoading ? (
            <div className="flex items-end gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500">
                <Bot className="h-4 w-4 text-white" />
              </span>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white/15 px-4 py-3">
                <Dot delay="0ms" />
                <Dot delay="150ms" />
                <Dot delay="300ms" />
              </div>
            </div>
          ) : null}
        </div>

        {/* 입력 폼 */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-white/10 p-3"
        >
          <div className="flex items-end gap-2 rounded-2xl border border-white/15 bg-white/10 p-2 pl-4 transition-colors focus-within:border-violet-400/60 focus-within:bg-white/15">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              rows={1}
              placeholder="만들고 싶은 화면을 설명해 주세요…"
              className="max-h-28 flex-1 resize-none self-center bg-transparent py-1.5 text-sm text-white placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="전송"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/40 transition-all duration-200 hover:brightness-110 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <MessageSquareDashed className="h-3 w-3" />
            Enter로 전송 · Shift+Enter로 줄바꿈
          </p>
        </form>
      </aside>
    </main>
  );
}

// === 채팅 말풍선 ===
function ChatBubble({ role, content }) {
  const isUser = role === "user";

  return (
    <div className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-white ${
          isUser
            ? "bg-white/20"
            : "bg-gradient-to-br from-indigo-500 to-fuchsia-500"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </span>
      <div
        className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "rounded-br-md bg-gradient-to-br from-indigo-500 to-violet-600 text-white"
            : "rounded-bl-md bg-white/15 text-slate-100"
        }`}
      >
        {content}
      </div>
    </div>
  );
}

// === 타이핑 인디케이터 점 ===
function Dot({ delay }) {
  return (
    <span
      className="h-2 w-2 animate-bounce rounded-full bg-white/70"
      style={{ animationDelay: delay }}
    />
  );
}
