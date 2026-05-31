// app/components/survey/StepMood.jsx
// STEP 1-C: 감성 키워드 멀티 선택 (최대 3개). 한도 도달 시 미선택 항목 비활성화.
"use client";

import { MAX_MOOD_SELECTIONS, MOOD_OPTIONS } from "./surveyConstants";

export default function StepMood({ survey, setSurvey }) {
  const selected = survey.mood_keywords;
  const atLimit = selected.length >= MAX_MOOD_SELECTIONS;

  const toggle = (option) => {
    if (selected.includes(option)) {
      setSurvey({ mood_keywords: selected.filter((item) => item !== option) });
      return;
    }
    if (atLimit) return; // 한도 초과 선택 차단.
    setSurvey({ mood_keywords: [...selected, option] });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-gray-500">
        최대 {MAX_MOOD_SELECTIONS}개 · {selected.length}/{MAX_MOOD_SELECTIONS}{" "}
        선택됨
      </p>
      <div className="grid grid-cols-3 gap-3">
        {MOOD_OPTIONS.map((option) => {
          const isSelected = selected.includes(option);
          const isDisabled = !isSelected && atLimit;
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              disabled={isDisabled}
              aria-pressed={isSelected}
              className={`rounded-lg border p-3 text-center text-sm transition ${
                isSelected
                  ? "border-black bg-black text-white"
                  : "border-gray-300 hover:border-gray-500"
              } disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-gray-300`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
