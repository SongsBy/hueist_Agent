// app/components/survey/SurveyFlow.jsx
// STEP 1 — 몰입형 앱 컨텍스트 브리프. (Google Stitch / Gemini 레퍼런스)
//
// 한 번에 질문 하나씩 보여주는 스텝 플로우. 다크 Material-3 캔버스 위에서
// 토널 글래스 칩/카드로 고르고, 단일 선택은 고르면 부드럽게 자동 전환된다.
// 스텝마다 블러가 풀리며 떠오르는(hueist-rise) 전환으로 감각을 더한다.
//
// 색은 제네릭한 보라-핑크 대신 정통 Gemini 스파크 그라데이션
// (#4285F4 Blue → #9B72CB Purple → #D96570 Coral)을 accent 한 점으로만 절제.
// 데이터 계약은 기존과 동일(useToneStore 의 survey 형태, onSubmit/isPending).
"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useToneStore } from "../../store/useToneStore";
import StepColor from "./StepColor";
import {
  CATEGORY_OPTIONS,
  CATEGORY_OTHER,
  TARGET_OPTIONS,
  MOOD_OPTIONS,
  MAX_MOOD_SELECTIONS,
} from "./surveyConstants";

// 카테고리 카드에 얹는 이모지. 라이브러리 아이콘 의존 없이 따뜻함을 더한다.
const CATEGORY_EMOJI = {
  "금융 / 가계부": "💰",
  "건강 / 피트니스": "💪",
  "F&B / 음식점": "🍽️",
  "쇼핑 / 이커머스": "🛍️",
  "커뮤니티 / SNS": "💬",
  "생산성 / 업무": "⚡",
  "교육 / 학습": "📚",
  엔터테인먼트: "🎬",
  "라이프스타일 / 취미": "🎨",
};

// Gemini 스파크 그라데이션. 선택 상태와 CTA 등 "accent 한 점"에만 쓴다.
const GEMINI = "bg-gradient-to-br from-[#4285F4] via-[#9B72CB] to-[#D96570]";
const GEMINI_SELECTED = `${GEMINI} text-white -translate-y-0.5 shadow-[0_16px_40px_-12px_rgba(155,114,203,0.6)]`;
const GLASS_RESTING =
  "border border-white/10 bg-white/[0.04] text-white/65 backdrop-blur-md hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.07] hover:text-white";

function isCustomCategory(category) {
  return category !== "" && !CATEGORY_OPTIONS.includes(category);
}

// 스텝 정의. valid = '다음' 진행 가능 여부. optional = 비워도 진행 가능.
const STEPS = [
  {
    key: "category",
    eyebrow: "카테고리",
    title: "어떤 프로덕트를\n구상 중이신가요?",
    subtitle: "가장 가까운 한 가지를 골라주세요.",
    valid: (s) => s.category.trim().length > 0,
  },
  {
    key: "target",
    eyebrow: "타겟",
    title: "누가 이 앱을\n쓰게 되나요?",
    subtitle: "여러 명 골라도 좋아요.",
    valid: (s) => s.target_users.length > 0,
  },
  {
    key: "mood",
    eyebrow: "무드",
    title: "어떤 무드를\n원하세요?",
    subtitle: `끌리는 분위기를 최대 ${MAX_MOOD_SELECTIONS}개까지 골라주세요.`,
    valid: (s) => s.mood_keywords.length > 0,
  },
  {
    key: "color",
    eyebrow: "컬러",
    title: "색의 방향을\n잡아볼까요?",
    subtitle: "AI가 잡아드려요. 직접 다듬고 싶다면 조절해 주세요.",
    valid: () => true,
    optional: true,
  },
  {
    key: "free",
    eyebrow: "노트",
    title: "마지막으로,\n더 들려주실 이야기",
    subtitle: "비워두고 넘어가도 괜찮아요.",
    valid: () => true,
    optional: true,
  },
];

/* ─────────────────────────────────────────────
   배경: 다크 캔버스 위로 Gemini 컬러 글로우가 느리게 부유한다.
   ───────────────────────────────────────────── */
function MeshBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="hueist-blob-a absolute -top-40 -left-24 h-[32rem] w-[32rem] rounded-full bg-[#4285F4]/25 blur-[150px]" />
      <div className="hueist-blob-b absolute top-10 -right-40 h-[34rem] w-[34rem] rounded-full bg-[#9B72CB]/25 blur-[160px]" />
      <div className="hueist-blob-c absolute bottom-[-10rem] left-1/4 h-[28rem] w-[28rem] rounded-full bg-[#D96570]/20 blur-[150px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   키워드 칩: 해시태그형 다중 선택. 활성 시 Gemini 그라데이션.
   ───────────────────────────────────────────── */
function Chip({ active, disabled, hash, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={[
        "group relative inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 ease-out",
        active ? GEMINI_SELECTED : GLASS_RESTING,
        "disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:border-white/10 disabled:hover:bg-white/[0.04]",
      ].join(" ")}
    >
      {hash && (
        <span className={active ? "text-white/45" : "text-white/30"}>#</span>
      )}
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────
   카테고리 카드 그리드 (단일 선택) + "기타" 인라인 입력.
   프리셋을 고르면 onAutoAdvance 로 다음 스텝으로 부드럽게 넘어간다.
   ───────────────────────────────────────────── */
function CategoryGrid({ category, setSurvey, onAutoAdvance }) {
  const [otherActive, setOtherActive] = useState(() =>
    isCustomCategory(category),
  );

  const choosePreset = (option) => {
    setOtherActive(false);
    setSurvey({ category: option });
    onAutoAdvance();
  };

  const chooseOther = () => {
    setOtherActive(true);
    if (!isCustomCategory(category)) setSurvey({ category: "" });
  };

  const cardClass = (selected) =>
    [
      "group relative flex flex-col items-start gap-2 rounded-2xl p-4 text-left transition-all duration-200 ease-out",
      selected ? GEMINI_SELECTED : GLASS_RESTING,
    ].join(" ");

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CATEGORY_OPTIONS.map((option) => {
          const selected = !otherActive && category === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => choosePreset(option)}
              aria-pressed={selected}
              className={cardClass(selected)}
            >
              <span className="text-2xl leading-none">
                {CATEGORY_EMOJI[option] ?? "✨"}
              </span>
              <span className="text-sm font-medium tracking-tight">
                {option}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={chooseOther}
          aria-pressed={otherActive}
          className={cardClass(otherActive)}
        >
          <span className="text-2xl leading-none">✏️</span>
          <span className="text-sm font-medium tracking-tight">
            {CATEGORY_OTHER} · 직접 입력
          </span>
        </button>
      </div>

      {otherActive && (
        <input
          type="text"
          autoFocus
          value={category}
          onChange={(event) => setSurvey({ category: event.target.value })}
          placeholder="어떤 종류의 앱인지 한 줄로 적어주세요"
          aria-label="기타 카테고리 직접 입력"
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm text-white shadow-sm backdrop-blur-xl transition placeholder:text-white/30 focus:border-[#9B72CB]/50 focus:ring-4 focus:ring-[#9B72CB]/20 focus:outline-none"
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   메인 컨트롤러.
   ───────────────────────────────────────────── */
export default function SurveyFlow({ onSubmit, isPending = false }) {
  const survey = useToneStore((state) => state.survey);
  const setSurvey = useToneStore((state) => state.setSurvey);
  const [stepIndex, setStepIndex] = useState(0);
  const advanceTimer = useRef(null);

  const step = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;
  const canAdvance = step.valid(survey);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;
  const moodAtLimit = survey.mood_keywords.length >= MAX_MOOD_SELECTIONS;

  // 타이머 정리: 자동 전환 예약 중 언마운트/이동 시 누수를 막는다.
  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  const goNext = () => {
    window.clearTimeout(advanceTimer.current);
    if (!canAdvance || isPending) return;
    if (isLast) {
      onSubmit(survey);
      return;
    }
    setStepIndex((i) => i + 1);
  };

  const goBack = () => {
    window.clearTimeout(advanceTimer.current);
    if (isFirst || isPending) return;
    setStepIndex((i) => i - 1);
  };

  // 단일 선택(카테고리 프리셋)은 고르면 살짝 머문 뒤 자동으로 다음 스텝으로.
  const autoAdvance = () => {
    window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 340);
  };

  const toggleTarget = (option) => {
    const next = survey.target_users.includes(option)
      ? survey.target_users.filter((item) => item !== option)
      : [...survey.target_users, option];
    setSurvey({ target_users: next });
  };

  const toggleMood = (option) => {
    if (survey.mood_keywords.includes(option)) {
      setSurvey({
        mood_keywords: survey.mood_keywords.filter((item) => item !== option),
      });
      return;
    }
    if (moodAtLimit) return;
    setSurvey({ mood_keywords: [...survey.mood_keywords, option] });
  };

  const renderStep = () => {
    switch (step.key) {
      case "category":
        return (
          <CategoryGrid
            category={survey.category}
            setSurvey={setSurvey}
            onAutoAdvance={autoAdvance}
          />
        );
      case "target":
        return (
          <div className="flex flex-wrap gap-2.5">
            {TARGET_OPTIONS.map((option) => (
              <Chip
                key={option}
                hash
                active={survey.target_users.includes(option)}
                onClick={() => toggleTarget(option)}
              >
                {option}
              </Chip>
            ))}
          </div>
        );
      case "mood":
        return (
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/50">
              <span className="text-[#c58af9]">●</span>
              {survey.mood_keywords.length} / {MAX_MOOD_SELECTIONS} 선택됨
            </span>
            <div className="flex flex-wrap gap-2.5">
              {MOOD_OPTIONS.map((option) => {
                const active = survey.mood_keywords.includes(option);
                return (
                  <Chip
                    key={option}
                    hash
                    active={active}
                    disabled={!active && moodAtLimit}
                    onClick={() => toggleMood(option)}
                  >
                    {option}
                  </Chip>
                );
              })}
            </div>
          </div>
        );
      case "color":
        return (
          <div className="rounded-3xl border border-white/10 bg-white p-6 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.7)]">
            <StepColor survey={survey} setSurvey={setSurvey} />
          </div>
        );
      case "free":
        return (
          <textarea
            rows={4}
            value={survey.free_text}
            onChange={(event) => setSurvey({ free_text: event.target.value })}
            placeholder={'예: "카카오페이처럼 젊고 신뢰감 있으면 좋겠어요"'}
            aria-label="추가로 전달하고 싶은 내용 (선택)"
            className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm leading-relaxed text-white shadow-sm backdrop-blur-xl transition placeholder:text-white/30 focus:border-[#9B72CB]/50 focus:ring-4 focus:ring-[#9B72CB]/20 focus:outline-none"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#0b0b10] via-[#0c0a12] to-[#09080d]">
      <MeshBackground />

      <div className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col px-6 py-8 sm:py-10">
        {/* ── 상단: 브랜드 배지 + 진행률 (스텝 전환과 무관하게 유지) ── */}
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-white/70">
              <Sparkles size={13} strokeWidth={2.5} className="text-[#c58af9]" />
              HUEIST · AI 디자인 브리프
            </span>
            <span className="font-mono text-xs tracking-[0.15em] text-white/35">
              {String(stepIndex + 1).padStart(2, "0")} /{" "}
              {String(STEPS.length).padStart(2, "0")}
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full ${GEMINI} transition-[width] duration-500 ease-out`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ── 중앙: 현재 스텝 (key 로 remount → rise 전환 재생, 스태거) ── */}
        <div
          key={step.key}
          className="flex flex-1 flex-col justify-center gap-9 py-12"
        >
          <header className="flex flex-col gap-3">
            <span
              className="hueist-rise inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-[#c58af9] uppercase"
              style={{ animationDelay: "60ms" }}
            >
              Step {stepIndex + 1} · {step.eyebrow}
              {step.optional && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.6rem] tracking-normal text-white/45 normal-case">
                  선택
                </span>
              )}
            </span>
            <h1
              className="hueist-rise bg-gradient-to-br from-[#8ab4f8] via-[#c58af9] to-[#f0a4ad] bg-clip-text text-3xl leading-[1.15] font-bold tracking-tight whitespace-pre-line text-transparent sm:text-[2.6rem]"
              style={{ animationDelay: "120ms" }}
            >
              {step.title}
            </h1>
            <p
              className="hueist-rise max-w-md text-sm leading-relaxed text-white/45"
              style={{ animationDelay: "180ms" }}
            >
              {step.subtitle}
            </p>
          </header>

          <div className="hueist-rise" style={{ animationDelay: "260ms" }}>
            {renderStep()}
          </div>
        </div>

        {/* ── 하단: 내비게이션 (유지) ── */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={goBack}
            disabled={isFirst || isPending}
            className="rounded-full px-4 py-2.5 text-sm font-medium text-white/45 transition hover:text-white disabled:pointer-events-none disabled:opacity-0"
          >
            ← 이전
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={!canAdvance || isPending}
            aria-busy={isPending && isLast}
            className={[
              "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-7 py-3.5 text-sm font-semibold tracking-tight text-white transition-all duration-300 ease-out",
              "bg-gradient-to-r from-[#4285F4] via-[#9B72CB] to-[#D96570] bg-[length:200%_auto] shadow-[0_18px_45px_-14px_rgba(155,114,203,0.7)] ring-1 ring-white/15",
              "hover:-translate-y-0.5 hover:bg-[position:100%_center] hover:shadow-[0_24px_55px_-12px_rgba(155,114,203,0.85)]",
              "active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-[#9B72CB]/40 focus-visible:outline-none",
              "disabled:translate-y-0 disabled:cursor-not-allowed disabled:from-white/10 disabled:via-white/10 disabled:to-white/10 disabled:text-white/30 disabled:shadow-none disabled:ring-white/5",
            ].join(" ")}
          >
            {isLast && canAdvance && !isPending && (
              <span
                aria-hidden
                className="hueist-shimmer pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/35 to-transparent"
              />
            )}
            {isLast && (
              <Sparkles
                size={17}
                strokeWidth={2.4}
                className={
                  isPending
                    ? "relative animate-spin text-white/90"
                    : "relative text-white transition-transform duration-500 group-hover:rotate-12"
                }
              />
            )}
            <span className="relative">
              {isLast
                ? isPending
                  ? "AI가 톤을 짜고 있어요…"
                  : "디자인 톤 생성하기"
                : "다음"}
            </span>
            {!isLast && (
              <span className="relative text-base transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
