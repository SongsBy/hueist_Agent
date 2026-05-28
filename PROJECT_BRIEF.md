# HUEIST — Project Brief for AI Agents

> 이 문서는 Claude, Gemini 등 AI 코딩 에이전트에게 본 프로젝트의 목표, 기술 스택, 설계 원칙을 상기시키기 위한 컨텍스트 문서다. 코드 작성/리뷰 시 이 문서의 모든 항목을 준수해야 한다.

---

## 1. 프로젝트 개요

### 1.1 제품명
**HUEIST** — 디자인 견해가 없어도, 시작할 수 있게.

### 1.2 한 줄 정의
디자인 비전공 1인 개발자가 자신의 앱에 어울리는 디자인 톤(컬러 시스템·폰트·무드)을 **레퍼런스 카드에서 시각적으로 선택**하기만 하면, AI가 즉시 적용 가능한 디자인 시스템과 Figma 템플릿을 생성해주는 웹 도구.

### 1.3 핵심 가치
- **"표현할 줄 모르는 사람을 위한 도구"** — 기존 AI 디자인 도구(Figma Make, Google Stitch)는 "표현할 줄 아는 사람"(디자이너)을 위해 설계되어 있다. HUEIST는 그 반대의 사용자를 위한다.
- **"색을 고르게 하지 않고, 분위기를 고르게 한다"** — 사용자에게 HEX 코드나 색상 이름을 묻지 않는다. 분위기 카드 3장 중 하나를 고르게 한다.
- **"AI가 좁혀주고, 사용자가 결정한다"** — 무한 생성이 아니라, AI가 도메인을 분석해 톤을 3개로 좁혀 추천하고 사용자가 선택하는 협업 모델.

### 1.4 타겟 페르소나
- **송개발 (25세, 1인 개발자)**: 컴퓨터공학과 학부생, 개발 3년 / 디자인 0년, 첫 사이드 프로젝트 출시 준비 중
- **솔로 파운더 / 사이드 프로젝트 메이커**: 디자인 비전공, "AI가 코드는 다 짜줘서 이젠 색이 마지막 벽"

### 1.5 Pain Points (반드시 해결해야 할 문제)
1. "AI가 화면은 짜줘도, 색은 내가 골라야 해요" — UI 구조는 자동화됐지만 색감은 막막한 영역
2. "어떤 색을 포인트로 줘야 사용자가 클릭하는지 모르겠어요" — 후킹되는 색 배치는 감각의 문제, 프롬프트로 표현 안 됨
3. "이 색 조합이 체류율을 높일지 확신이 안 서요" — 결국 직감으로 고르고, 다음 날 다 갈아엎는 일의 반복

---

## 2. ⭐ 핵심 차별점 — 레퍼런스 카드 (Reference Card)

### 2.1 왜 레퍼런스 카드인가
경쟁 도구들과 HUEIST를 가르는 **가장 중요한 차별점**은 **레퍼런스 카드** 방식이다. 이 부분은 절대 타협하면 안 된다.

| 구분 | Figma Make / Google Stitch | HUEIST |
|---|---|---|
| 톤 결정 방식 | 프롬프트로 묘사 ("modern, clean...") | **레퍼런스 카드 선택 (시각적으로 고르기)** |
| 색감 일관성 | 생성마다 달라짐 | **선택한 톤으로 고정 (앱 전체가 동일한 무드)** |
| 포인트 컬러 | AI가 임의 배치 (근거 불명) | **톤 시스템에서 자동 도출 (후킹 위치까지 가이드)** |
| 사용자 부담 | "어떻게 표현하지?" | **"어느 톤이 마음에 들지?" (고르기만 하면 됨)** |

### 2.2 레퍼런스 카드의 구체적 구성
사용자가 앱 설명을 입력하면, AI는 3장의 카드를 생성한다. 각 카드는 다음을 포함한다:

```typescript
interface ReferenceCard {
  name: string;              // 감성적 톤 이름 (예: "새벽 카페", "봄날의 들판")
  description: string;       // 이 톤이 어울리는 이유 한 줄
  mood: string[];            // 분위기 키워드 3개 (예: 따뜻함, 신뢰, 모던)
  colors: {
    primary: string;         // HEX 코드
    secondary: string;
    tertiary: string;
    surface: string;
    background: string;
  };
  font_pairing: {
    heading: string;         // Google Fonts 폰트명
    body: string;
  };
  mood_image_url?: string;   // (고도화) Unsplash API 매칭 무드 이미지
}
```

### 2.3 사용자 흐름
1. **STEP 1 — 앱 설명 입력**: "어떤 앱인가요?" 한 줄 또는 단락
2. **STEP 2 — AI 톤 추천**: AI가 도메인 분석 후 톤 3개 자동 제안
3. **STEP 3 — 톤 선택 + 생성 강도 조절**: 안전 · 균형 · 과감 슬라이더
4. **STEP 4 — Figma 템플릿 자동 생성**: 컴포넌트 단위로 정돈된 작업 시작점 제공

---

## 3. 기술 스택

### 3.1 Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: JavaScript (TypeScript 미사용)
- **Styling**: Tailwind CSS v4
- **Runtime**: Node.js v24 (LTS)
- **Bundler**: Turbopack (Next.js 기본)

### 3.2 Backend
- **API Layer**: Next.js API Routes (`app/api/*/route.js`)
- **Serverless**: Vercel Functions (별도 서버 없음)
- **환경변수**: `.env.local` (절대 Git 커밋 금지)

### 3.3 AI / 외부 API

| 용도 | API / 라이브러리 | 비고 |
|---|---|---|
| **메인 AI** | Google Gemini API (`gemini-2.5-flash-preview-05-20`) | 무료 티어, 멀티모달, 1M 컨텍스트 |
| **WCAG 검증** | `color-contrast-checker` (npm) | BBC 오픈소스 MIT, 클라이언트 내장 |
| **색상 조작** | `chroma-js` (npm) | MIT, 색상 변환·조화색 계산 |
| **무드 이미지** | Unsplash API (고도화 단계) | 무료, 상업적 사용 허용 |
| **폰트 페어링** | Google Fonts API | 무료 |
| **Figma 출력** | Figma Plugin API (고도화) | 무료 |

### 3.4 배포
- **Hosting**: Vercel (무료 플랜)
- **CI/CD**: GitHub push → Vercel 자동 배포
- **모니터링**: Vercel Analytics (무료)

### 3.5 전체 비용 구조
**개발 비용·운영 비용 모두 0원.** Gemini 무료 티어 + 모든 라이브러리 MIT/Apache 라이선스 + Vercel 무료 플랜.

---

## 4. 프로그래밍 설계 원칙

코드를 작성할 때 다음 항목을 **반드시 모두** 고려할 것.

### 4.1 보안 (Security)
- **API 키 노출 금지**
  - `GEMINI_API_KEY`는 반드시 `.env.local`에 저장
  - 클라이언트 코드에서 직접 Gemini API 호출 절대 금지
  - 모든 외부 API 호출은 Next.js API Route를 경유
- **CSP / CORS**
  - API Route에서 적절한 Content-Type 검증
  - 사용자 입력은 항상 sanitize (XSS 방지)
- **Rate Limiting**
  - 동일 IP 분당 호출 제한 (Gemini 무료 티어 보호)
  - `upstash/ratelimit` 또는 in-memory 토큰 버킷 고려
- **에러 메시지**
  - 내부 에러(스택 트레이스, API 키 일부) 클라이언트에 노출 금지
  - 사용자에게는 친절한 한국어 메시지만 표시

### 4.2 상태 관리 (State Management)
- **로컬 상태**: `useState`, `useReducer` 우선 사용
- **전역 상태**: Zustand 사용 (Redux는 오버엔지니어링)
  - 선택된 톤, 생성 강도, 사용자 설정 등 페이지 간 공유 데이터
- **서버 상태**: TanStack Query (`@tanstack/react-query`)
  - Gemini API 응답 캐싱
  - 로딩/에러/재시도 자동 관리
  - `staleTime` 적절히 설정해 무의미한 재호출 방지
- **상태 영속화**: 사용자가 선택한 톤은 `localStorage`에 저장 (새로고침 시 복원)

### 4.3 라우팅 (Routing)
Next.js App Router 사용. 페이지 구조는 다음과 같이 설계한다:

```
app/
├── page.jsx              ← STEP 1: 앱 설명 입력 (홈)
├── recommend/
│   └── page.jsx          ← STEP 2: AI 톤 추천 3장
├── customize/
│   └── page.jsx          ← STEP 3: 톤 선택 + 강도 조절
├── result/
│   └── page.jsx          ← STEP 4: 최종 디자인 시스템 출력
├── api/
│   ├── recommend/
│   │   └── route.js      ← 톤 3개 생성 API
│   └── refine/
│       └── route.js      ← 강도 조절 재생성 API
├── components/
│   ├── AppInput.jsx
│   ├── ToneCard.jsx      ← 레퍼런스 카드 ⭐ 핵심
│   ├── IntensitySlider.jsx
│   └── ColorPalette.jsx
├── lib/
│   ├── gemini.js         ← Gemini API 클라이언트
│   ├── prompts.js        ← 시스템 프롬프트 관리
│   └── colorUtils.js     ← WCAG 검증, 조화색 계산
├── store/
│   └── useToneStore.js   ← Zustand 전역 상태
├── layout.jsx
└── globals.css
```

- **동적 라우팅** 필요 시 `[slug]` 패턴 사용
- **URL 쿼리 파라미터**로 톤 ID 전달 (`/customize?tone=warm-cafe`)
- **`useRouter`** 사용 (`next/navigation` import)

### 4.4 생명주기 (Lifecycle)
- **Server Components 우선**: 기본은 RSC, 인터랙션 필요할 때만 `'use client'` 선언
- **`useEffect` 사용 최소화**:
  - 데이터 fetching은 TanStack Query에 위임
  - DOM 직접 조작이나 외부 이벤트 구독 시만 사용
  - 의존성 배열 누락 금지 (ESLint `react-hooks/exhaustive-deps` 활성화)
- **컴포넌트 마운트/언마운트 정리**:
  - 이벤트 리스너, 타이머, AbortController는 반드시 cleanup
  - 페이지 이탈 시 진행 중인 API 호출 cancel

### 4.5 성능 (Performance)
- **이미지 최적화**: `next/image` 사용 (자동 WebP, lazy loading)
- **폰트 최적화**: `next/font` 사용 (Google Fonts 자동 self-hosting)
- **코드 스플리팅**: `dynamic()` import로 무거운 컴포넌트 lazy load
- **Streaming**: Gemini 응답을 스트리밍으로 받아 UX 개선 (고도화)
- **Memoization**: `useMemo`, `useCallback`, `React.memo` 적재적소 사용

### 4.6 접근성 (Accessibility)
- 모든 인터랙티브 요소에 키보드 접근 가능
- 색상 대비 WCAG AA 이상 (4.5:1) — **이 도구가 생성하는 결과물뿐 아니라 HUEIST 자체 UI도 준수**
- `aria-label`, `role` 속성 적절히 사용
- 스크린리더 호환성 검증

### 4.7 코드 품질
- **ESLint**: Next.js 기본 룰셋 준수
- **Prettier**: 일관된 코드 포맷
- **명명 규칙**:
  - 컴포넌트: PascalCase (`ToneCard.jsx`)
  - 훅: camelCase + `use` 접두사 (`useToneStore.js`)
  - 상수: UPPER_SNAKE_CASE (`SYSTEM_PROMPT`)
- **함수형 컴포넌트만 사용** (클래스 컴포넌트 금지)
- **Early Return** 패턴 선호 (중첩 if 회피)

### 4.8 에러 처리
- **API Route**: try-catch로 감싸고 적절한 HTTP 상태 코드 반환
- **클라이언트**: Error Boundary 컴포넌트로 전역 에러 캐치
- **사용자 피드백**: Toast 알림 또는 인라인 에러 메시지 (`react-hot-toast` 추천)
- **재시도 로직**: TanStack Query의 `retry` 옵션 활용

---

## 5. AI 응답 품질 가이드라인

### 5.1 프롬프트 엔지니어링 원칙
모든 Gemini 호출 시 다음 4가지 요소를 반드시 포함:

1. **역할 부여** — "너는 10년 경력의 Product Designer야"
2. **컨텍스트 제공** — Material Design 3 색상 규칙, 색상 심리학 룰셋
3. **출력 형식 고정** — JSON 스키마 명시, `responseMimeType: "application/json"` 사용
4. **예시 제공 (Few-shot)** — 좋은 추천 사례 2~3개 포함

### 5.2 응답 검증
- Gemini 응답을 받으면 Zod 스키마로 검증
- 검증 실패 시 자동 재시도 (최대 2회)
- HEX 코드 형식, 명도 대비, 톤 개수 등 비즈니스 규칙 검증

### 5.3 다양성 보장
- `temperature: 0.8` 설정 (창의성)
- 톤 3개는 서로 **확실히 다른 감성**이어야 함 (프롬프트에 명시)
- 동일한 입력에 대해 매번 약간씩 다른 추천 제공

---

## 6. 절대 하지 말 것 (Don'ts)

- ❌ TypeScript 사용 (현재 프로젝트는 JS)
- ❌ 클라이언트에서 Gemini API 직접 호출
- ❌ API 키를 코드 또는 Git에 포함
- ❌ 사용자에게 HEX 코드나 색상 이름을 직접 묻기 (레퍼런스 카드 방식 필수)
- ❌ 톤을 4개 이상 제안 (선택 부담 증가)
- ❌ 프롬프트 기반 묘사 방식으로 회귀 (HUEIST의 차별점 훼손)
- ❌ 결과물을 매번 무한 변형으로 다시 제공 (강도 조절로만 변형)
- ❌ 디자인 시스템 의존 (Figma 라이브러리 연동 강제 금지)
- ❌ 영어 위주 UI (타겟은 한국 1인 개발자)

---

## 7. AI 에이전트(Claude/Gemini)에게 보내는 메시지

> 코드를 작성하거나 리뷰할 때, 위 모든 원칙을 적용해줘.
>
> 특히 다음 세 가지를 잊지 마:
>
> 1. **HUEIST의 차별점은 "레퍼런스 카드"다.** 어떤 기능을 추가하든 이 핵심 가치를 훼손하면 안 돼.
> 2. **타겟은 "디자인 표현을 못 하는" 개발자다.** 사용자에게 HEX 코드, 색상 이론, 디자인 용어를 묻는 UI는 절대 만들지 마.
> 3. **모든 코드는 보안·상태관리·라우팅·생명주기·성능·접근성·에러처리·코드품질**의 8가지 관점을 통과해야 해. 한 줄을 짜더라도 8가지 모두 점검할 것.
>
> 이 문서는 살아있는 문서다. 프로젝트가 진화하면 함께 업데이트할 것.

---

**Last Updated**: 2026.05.26
**Owner**: 송정훈 (한국공학대학교 컴퓨터공학부)
**Repo**: github.com/hueist/hueist
