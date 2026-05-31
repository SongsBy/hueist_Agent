// app/mobile-playground/page.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import {
  Sparkles,
  ArrowUp,
  Bot,
  User,
  Loader2,
  Smartphone,
  RotateCcw,
  Wifi,
  Signal,
  BatteryFull,
} from "lucide-react";
import { useToneStore } from "../store/useToneStore";

// react-live 가 생성 코드 안에서 쓸 수 있는 유일한 의존성.
// LiveAppPreview 와 동일하게 순수 React + useState 만 주입한다(외부 라이브러리 0).
// noInline 모드라 생성 코드는 컴포넌트를 정의하고 render(<App/>) 로 끝나야 한다.
const SCOPE = { React, useState };

// code 의 초기값. 모바일 프레임 안에 들어갈 기본 화면.
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
        gap: "18px",
        padding: "80px 28px",
        textAlign: "center",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        background:
          "linear-gradient(180deg, #faf5ff 0%, #ffffff 60%, #f5f3ff 100%)",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "18px",
          display: "grid",
          placeItems: "center",
          background:
            "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
          boxShadow: "0 14px 32px -10px rgba(168,85,247,0.6)",
          color: "#fff",
          fontSize: "28px",
        }}
      >
        ✦
      </div>
      <h2 style={{ fontSize: "19px", fontWeight: 700, letterSpacing: "-0.02em" }}>
        앱 화면이 여기 나타나요
      </h2>
      <p style={{ fontSize: "13px", lineHeight: 1.6, color: "#64748b", maxWidth: "240px" }}>
        오른쪽 채팅에 만들고 싶은 모바일 화면을 설명하면 AI가 이 폰 안에 직접 그려줍니다.
      </p>
    </div>
  );
}

render(<App />);`;

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "안녕하세요! 어떤 모바일 화면을 만들어 드릴까요? 예) “민트색 톤의 운동 기록 홈 화면 만들어줘”",
};

export default function MobilePlaygroundPage() {
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
    const history = messages;
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
          content: "요청하신 화면을 폰에 반영했어요. 더 바꾸고 싶은 부분이 있으면 말씀해 주세요!",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: error?.message ?? "문제가 발생했어요. 잠시 후 다시 시도해 주세요.",
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
    <main className="relative flex h-[100dvh] w-full overflow-hidden bg-slate-950 text-slate-100">
      {/* === 배경 오로라 글로우 === */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-32 h-[30rem] w-[30rem] rounded-full bg-indigo-600/25 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-[28rem] w-[28rem] rounded-full bg-violet-500/20 blur-[140px]" />
        <div className="absolute -bottom-32 right-0 h-[30rem] w-[30rem] rounded-full bg-fuchsia-600/20 blur-[140px]" />
      </div>

      {/* ================= 좌측: 모바일 목업 Sketch 영역 ================= */}
      <section className="relative flex flex-1 flex-col items-center justify-center px-6 py-10">
        {/* 좌측 상단 브랜드 */}
        <div className="absolute left-6 top-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-xl">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/30">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">모바일 웹앱 플레이그라운드</p>
            <p className="text-[11px] text-slate-400">AI가 그리는 실시간 앱 화면</p>
          </div>
        </div>

        {/* ===== 아이폰 목업 프레임 (순수 CSS/Tailwind) ===== */}
        <PhoneMockup>
          {mounted ? (
            <LiveProvider code={code} scope={SCOPE} noInline>
              {/* 화면 내부: 세로로 가득 차고 스크롤 가능. */}
              <div className="relative h-full w-full overflow-y-auto bg-white text-slate-900 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div
                  className={`min-h-full transition-all duration-500 ${
                    isLoading ? "scale-[0.99] opacity-40 blur-[2px]" : "opacity-100"
                  }`}
                >
                  <LivePreview style={{ display: "block", minHeight: "100%" }} />
                </div>
              </div>

              {/* 생성 코드가 깨졌을 때만 노출되는 인라인 에러. */}
              <LiveError className="absolute inset-x-3 bottom-3 z-30 max-h-32 overflow-auto whitespace-pre-wrap rounded-2xl border border-red-200 bg-red-50/95 p-3 font-mono text-[11px] leading-relaxed text-red-700 shadow-lg backdrop-blur" />
            </LiveProvider>
          ) : null}

          {/* ===== 로딩 스켈레톤 (폰 화면 안쪽) ===== */}
          {isLoading ? (
            <div className="absolute inset-0 z-20 flex flex-col bg-white/60 backdrop-blur-sm">
              {/* 상단 스피너 */}
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6">
                <div className="relative grid h-16 w-16 place-items-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-violet-400/40" />
                  <span className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 opacity-90" />
                  <Loader2 className="relative h-7 w-7 animate-spin text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-700">화면을 그리는 중…</p>
              </div>
              {/* 하단 콘텐츠 스켈레톤 */}
              <div className="flex flex-col gap-3 px-6 pb-16">
                <span className="h-28 w-full animate-pulse rounded-2xl bg-slate-200" />
                <span className="h-4 w-2/3 animate-pulse rounded-full bg-slate-200 [animation-delay:120ms]" />
                <span className="h-4 w-full animate-pulse rounded-full bg-slate-200 [animation-delay:240ms]" />
                <span className="h-4 w-4/5 animate-pulse rounded-full bg-slate-200 [animation-delay:360ms]" />
              </div>
            </div>
          ) : null}
        </PhoneMockup>

        <p className="mt-8 flex items-center gap-2 text-xs text-slate-500">
          <Smartphone className="h-3.5 w-3.5" />
          실시간 미리보기 · iPhone 15 Pro 393×852
        </p>
      </section>

      {/* ================= 우측: Chat 영역 ================= */}
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-white/5 backdrop-blur-2xl">
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
          <button
            type="button"
            onClick={handleReset}
            className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-[0.97]"
          >
            <RotateCcw className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-rotate-180" />
            <span className="hidden sm:inline">새로 시작</span>
          </button>
        </div>

        {/* 메시지 목록 */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto px-4 py-5 [scrollbar-width:thin]"
        >
          {messages.map((message, index) => (
            <ChatBubble key={index} role={message.role} content={message.content} />
          ))}

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
        <form onSubmit={handleSubmit} className="border-t border-white/10 p-3">
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
              placeholder="만들고 싶은 모바일 화면을 설명해 주세요…"
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
          <p className="mt-2 text-center text-[11px] text-slate-400">
            Enter로 전송 · Shift+Enter로 줄바꿈
          </p>
        </form>
      </aside>
    </main>
  );
}

// ===== 아이폰 목업 프레임 (순수 CSS/Tailwind) =====
function PhoneMockup({ children }) {
  return (
    <div className="relative">
      {/* 측면 물리 버튼 */}
      <span className="absolute -left-[3px] top-28 h-8 w-[3px] rounded-l bg-slate-700" />
      <span className="absolute -left-[3px] top-40 h-12 w-[3px] rounded-l bg-slate-700" />
      <span className="absolute -left-[3px] top-56 h-12 w-[3px] rounded-l bg-slate-700" />
      <span className="absolute -right-[3px] top-44 h-16 w-[3px] rounded-r bg-slate-700" />

      {/* 외곽 티타늄 프레임 */}
      <div className="relative h-[780px] w-[380px] rounded-[3.2rem] bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 p-[3px] shadow-[0_50px_120px_-25px_rgba(0,0,0,0.85)]">
        {/* 베젤 */}
        <div className="relative h-full w-full overflow-hidden rounded-[3rem] bg-black p-[10px]">
          {/* 실제 스크린 */}
          <div className="relative h-full w-full overflow-hidden rounded-[2.4rem] bg-white">
            {/* 다이나믹 아일랜드 */}
            <div className="absolute left-1/2 top-2.5 z-40 flex h-8 w-28 -translate-x-1/2 items-center justify-center gap-2 rounded-full bg-black">
              <span className="h-2 w-2 rounded-full bg-slate-800 ring-1 ring-slate-700" />
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-950" />
            </div>

            {/* 상태바 (시간 / 신호 / 배터리) */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-7 pt-3.5 text-[12px] font-semibold text-slate-900 mix-blend-difference">
              <span className="text-white">9:41</span>
              <div className="flex items-center gap-1.5 text-white">
                <Signal className="h-3.5 w-3.5" />
                <Wifi className="h-3.5 w-3.5" />
                <BatteryFull className="h-4 w-4" />
              </div>
            </div>

            {/* 생성 화면이 들어가는 영역 */}
            {children}

            {/* 홈 인디케이터 */}
            <div className="pointer-events-none absolute bottom-2 left-1/2 z-30 h-1.5 w-32 -translate-x-1/2 rounded-full bg-slate-900/30" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== 채팅 말풍선 =====
function ChatBubble({ role, content }) {
  const isUser = role === "user";

  return (
    <div className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-white ${
          isUser ? "bg-white/20" : "bg-gradient-to-br from-indigo-500 to-fuchsia-500"
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

// ===== 타이핑 인디케이터 점 =====
function Dot({ delay }) {
  return (
    <span
      className="h-2 w-2 animate-bounce rounded-full bg-white/70"
      style={{ animationDelay: delay }}
    />
  );
}
