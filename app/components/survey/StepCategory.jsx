// app/components/survey/StepCategory.jsx
// STEP 1-A: 앱 카테고리 단일 선택 그리드. "기타" 선택 시 인라인 텍스트 필드 노출.
"use client";

import { useState } from "react";
import { CATEGORY_OPTIONS, CATEGORY_OTHER } from "./surveyConstants";

// 저장된 category가 프리셋이 아니면서 비어있지 않으면 "기타"로 입력한 값이다.
function isCustomCategory(category) {
  return category !== "" && !CATEGORY_OPTIONS.includes(category);
}

export default function StepCategory({ survey, setSurvey }) {
  const { category } = survey;
  // "기타" 칩 활성 상태. 새로고침/뒤로가기로 복원될 때도 커스텀 값이면 활성.
  const [otherActive, setOtherActive] = useState(() =>
    isCustomCategory(category),
  );

  const handlePreset = (option) => {
    setOtherActive(false);
    setSurvey({ category: option });
  };

  const handleOther = () => {
    setOtherActive(true);
    // 프리셋에서 넘어온 경우에만 입력값을 비운다 (커스텀 값은 보존).
    if (!isCustomCategory(category)) setSurvey({ category: "" });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {CATEGORY_OPTIONS.map((option) => {
          const isSelected = !otherActive && category === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => handlePreset(option)}
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

        <button
          type="button"
          onClick={handleOther}
          aria-pressed={otherActive}
          className={`rounded-lg border p-4 text-left text-sm transition ${
            otherActive
              ? "border-black bg-black text-white"
              : "border-gray-300 hover:border-gray-500"
          }`}
        >
          {CATEGORY_OTHER} (직접 입력)
        </button>
      </div>

      {otherActive && (
        <input
          type="text"
          autoFocus
          value={category}
          onChange={(event) => setSurvey({ category: event.target.value })}
          placeholder="어떤 종류의 앱인지 직접 적어주세요"
          aria-label="기타 카테고리 직접 입력"
          className="w-full rounded-lg border border-gray-300 p-3 text-sm"
        />
      )}
    </div>
  );
}
