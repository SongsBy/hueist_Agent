// app/components/survey/surveyConstants.js
// STEP 1 구조화 설문에서 공유하는 선택지 정의.
// 클라이언트(각 Step 컴포넌트)와 SurveyFlow가 함께 참조한다.

export const CATEGORY_OPTIONS = [
  "금융 / 가계부",
  "건강 / 피트니스",
  "F&B / 음식점",
  "쇼핑 / 이커머스",
  "커뮤니티 / SNS",
  "생산성 / 업무",
  "교육 / 학습",
  "엔터테인먼트",
  "라이프스타일 / 취미",
];

// "기타"는 선택 시 인라인 텍스트 필드를 노출하는 특별 옵션이라 별도 상수로 분리.
export const CATEGORY_OTHER = "기타";

export const TARGET_OPTIONS = [
  "10대",
  "20대 직장인",
  "30~40대 부모",
  "시니어",
  "B2B (기업 담당자)",
  "크리에이터 / 전문직",
];

export const MOOD_OPTIONS = [
  "신뢰감 있는",
  "따뜻한",
  "미니멀한",
  "에너제틱한",
  "럭셔리한",
  "친근한",
  "세련된",
  "임팩트 있는",
  "차분한",
  "트렌디한",
  "전문적인",
  "귀여운",
];

export const MAX_MOOD_SELECTIONS = 3;

// 색 슬라이더 기본값 (0~100). 중립(50)에서 시작.
export const DEFAULT_COLOR_TEMPERATURE = 50;
export const DEFAULT_COLOR_BRIGHTNESS = 50;
export const DEFAULT_COLOR_SATURATION = 50;

// 설문 초기 상태. 스토어와 SurveyFlow 리셋에서 공유.
export const INITIAL_SURVEY = {
  category: "",
  target_users: [],
  mood_keywords: [],
  color_temperature: DEFAULT_COLOR_TEMPERATURE,
  color_brightness: DEFAULT_COLOR_BRIGHTNESS,
  color_saturation: DEFAULT_COLOR_SATURATION,
  free_text: "",
};
