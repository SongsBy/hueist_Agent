// app/components/survey/StepTarget.jsx
// STEP 1-B: 타겟 사용자 멀티 선택. 최소 1개 이상.
"use client";

import { TARGET_OPTIONS } from "./surveyConstants";

export default function StepTarget({ survey, setSurvey }) {
  const selected = survey.target_users;

  const toggle = (option) => {
    const next = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];
    setSurvey({ target_users: next });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {TARGET_OPTIONS.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            aria-pressed={isSelected}
            className={`rounded-lg border p-4 text-left text-sm transition ${
              isSelected
                ? "border-black bg-black text-white"
                : "border-gray-300 hover:border-gray-500"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
