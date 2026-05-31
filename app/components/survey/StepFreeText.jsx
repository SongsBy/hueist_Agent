// app/components/survey/StepFreeText.jsx
// STEP 1-E: 보완용 자유 입력 (선택). 비워도 제출 가능.
"use client";

export default function StepFreeText({ survey, setSurvey }) {
  return (
    <div className="flex flex-col gap-2">
      <textarea
        rows={4}
        value={survey.free_text}
        onChange={(event) => setSurvey({ free_text: event.target.value })}
        placeholder={'예: "카카오페이처럼 젊고 신뢰감 있으면 좋겠어요"'}
        aria-label="추가로 전달하고 싶은 내용 (선택)"
        className="w-full rounded-lg border border-gray-300 p-3 text-sm"
      />
      <p className="text-xs text-gray-500">
        선택 입력이에요. 더 전달하고 싶은 뉘앙스가 있다면 적어주세요.
      </p>
    </div>
  );
}
