# HUEIST

> 디자인 견해가 없어도, 시작할 수 있게.

디자인 비전공 1인 개발자가 자신의 앱에 어울리는 디자인 톤(컬러 시스템·폰트·무드)을 **레퍼런스 카드에서 시각적으로 선택**하기만 하면, AI가 즉시 적용 가능한 디자인 시스템을 생성해주는 웹 도구입니다.

HEX 코드나 색상 이름을 묻지 않습니다. AI가 도메인을 분석해 톤 3장으로 좁혀 추천하고, 사용자는 마음에 드는 분위기 한 장만 고르면 됩니다.

---

## ✨ 핵심 차별점 — 레퍼런스 카드

| 구분 | 기존 AI 디자인 도구 | HUEIST |
|---|---|---|
| 톤 결정 방식 | 프롬프트로 묘사 (`modern, clean...`) | **시각적 카드 선택** |
| 색감 일관성 | 생성마다 달라짐 | **선택한 톤으로 고정** |
| 포인트 컬러 | AI가 임의 배치 | **톤 시스템에서 자동 도출** |
| 사용자 부담 | "어떻게 표현하지?" | **"어느 톤이 마음에 들지?"** |

---

## 🛠 기술 스택

- **Framework**: Next.js 16 (App Router) + JavaScript
- **Styling**: Tailwind CSS v4
- **상태 관리**: Zustand (전역) · TanStack Query (서버 상태)
- **AI**: Google Gemini API (`gemini-2.5-flash-preview-05-20`)
- **색상 처리**: `chroma-js`, `color-contrast-checker` (WCAG 검증)
- **알림**: `react-hot-toast`
- **배포**: Vercel

---

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

루트에 `.env.local` 파일 생성:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_FONTS_API_KEY=your_google_fonts_api_key_here
```

- Gemini API 키 발급: https://aistudio.google.com/apikey
- Google Fonts API 키 발급: https://developers.google.com/fonts/docs/developer_api

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

### 4. 프로덕션 빌드

```bash
npm run build
npm start
```

---

## 📂 프로젝트 구조

```
app/
├── page.jsx              STEP 1 — 앱 설명 입력
├── recommend/page.jsx    STEP 2 — AI 톤 추천 3장
├── customize/page.jsx    STEP 3 — 톤 선택 + 강도 조절
├── result/page.jsx       STEP 4 — 최종 디자인 시스템
├── api/
│   └── recommend/        Gemini 호출 API 라우트
├── components/           UI 컴포넌트 (ToneCard 등)
├── lib/                  Gemini 클라이언트, 프롬프트, 색상 유틸
├── store/                Zustand 전역 상태
└── Providers.jsx         TanStack Query Provider
```

---

## 🧭 사용자 흐름

1. **앱 설명 입력** — "어떤 앱인가요?" 한 줄 또는 단락
2. **AI 톤 추천** — 도메인 분석 후 톤 3개 자동 제안
3. **톤 선택 + 강도 조절** — 안전 · 균형 · 과감 슬라이더
4. **디자인 시스템 출력** — 컴포넌트 단위로 정돈된 작업 시작점

---

## 🔒 보안 원칙

- 모든 Gemini 호출은 **서버 사이드 API Route를 경유** (클라이언트에서 직접 호출 금지)
- `.env.local`은 Git에 절대 커밋하지 않음 (`.gitignore` 등록 완료)
- 사용자 입력은 sanitize 후 처리

---

## 📚 추가 문서

설계 원칙 · 도메인 컨텍스트 · 절대 하지 말아야 할 것은 [PROJECT_BRIEF.md](./PROJECT_BRIEF.md)에 정리되어 있습니다. AI 코딩 에이전트 사용 시 함께 읽혀주세요.

---

**Owner**: 송정훈 (한국공학대학교 컴퓨터공학부)
