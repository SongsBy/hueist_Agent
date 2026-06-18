// app/lib/uiPromptBuilder.js
//
// 생성형 UI(JSX 동적 렌더링) 전용 프롬프트 빌더.
// /api/recommend 의 톤 추천 프롬프트와 책임을 분리하기 위해 독립 모듈로 둔다.
//
// 핵심 제약(아키텍처 결정):
//   1) 출력은 react-live 가 noInline 모드에서 실행하는 "순수 JSX 코드 문자열"이다.
//      → 반드시 컴포넌트를 정의하고 마지막에 render(<App />) 를 호출해야 한다.
//   2) scope 에는 React 와 useState 만 주입된다. 그 외 import/라이브러리 사용 금지.
//   3) Tailwind 클래스는 런타임 문자열을 빌드 타임 스캐너가 보지 못해 적용이
//      보장되지 않는다. 따라서 색상뿐 아니라 "모든 스타일"을 인라인 style 객체로 작성한다.

// 톤이 들고 있는 색상/타이포/무드를 LLM 이 읽기 쉬운 브리프로 직렬화한다.
function serializeTone(tone) {
  const colors = tone?.colors ?? {};
  const typography = tone?.typography ?? {};
  const dna = tone?.design_dna_details ?? {};
  const tokens = tone?.ui_tokens ?? {};

  const lines = [
    `- Tone Name: ${tone?.name ?? "Untitled"}`,
    `- Mood Keywords: ${(tone?.mood ?? []).join(", ") || "n/a"}`,
    `- Archetype: ${tone?.archetype ?? "n/a"}`,
    "",
    "[COLOR TOKENS] (HEX — 반드시 인라인 style 로만 사용):",
    `  primary:    ${colors.primary ?? "#111111"}`,
    `  secondary:  ${colors.secondary ?? "#444444"}`,
    `  tertiary:   ${colors.tertiary ?? "#888888"}   ← accent (10%)`,
    `  surface:    ${colors.surface ?? "#FFFFFF"}`,
    `  background: ${colors.background ?? "#FAFAFA"}  ← canvas (60%)`,
    "",
    "[TYPOGRAPHY] (이미 페이지에 로드되어 있으니 fontFamily 로 그대로 사용):",
    `  heading: ${typography.heading_font ?? tone?.font_pairing?.heading ?? "sans-serif"}`,
    `  body:    ${typography.body_font ?? tone?.font_pairing?.body ?? "sans-serif"}`,
    "",
    "[UI TOKENS]:",
    `  border_radius: ${tokens.border_radius ?? 12}px`,
    `  shadow_depth:  ${tokens.shadow_depth ?? "soft"}`,
    `  density:       ${tokens.spacing_density ?? "balanced"}`,
    `  contrast:      ${tokens.contrast_level ?? "medium"}`,
    "",
    "[DESIGN DNA]:",
    `  typography 전략: ${dna.typography ?? "n/a"}`,
    `  여백 전략:       ${dna.whitespace ?? "n/a"}`,
    `  아이콘/그래픽:    ${dna.iconography ?? "n/a"}`,
  ];

  return lines.join("\n");
}

// 설문(survey)에서 "무엇을 만드는 앱인가"의 맥락만 추린다.
function serializeSurvey(survey) {
  if (!survey || typeof survey !== "object") return "(설문 정보 없음)";
  const lines = [
    `- 앱 도메인: ${survey.category || "미지정"}`,
    `- 타겟 사용자: ${(survey.target_users ?? []).join(", ") || "미지정"}`,
    `- 원하는 무드: ${(survey.mood_keywords ?? []).join(", ") || "미지정"}`,
  ];
  if (survey.free_text?.trim()) {
    lines.push(`- 추가 맥락: "${survey.free_text.trim()}"`);
  }
  return lines.join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// Claude Design / Vercel v0 의 미학·기술 심층 지시문을 코드로 이식한 부분.
// ─────────────────────────────────────────────────────────────────────────────
export function buildUiSystemPrompt() {
  return `You are an elite product designer and front-end engineer who hand-crafts
beautiful, surprising, production-grade UI. You think like a senior designer at a
top studio: every pixel earns its place.

You will be given a finalized design tone (color tokens, typography, UI tokens,
design DNA) and the context of the app a solo developer is building. Your job is
to generate ONE polished, realistic screen of that app, embodying the tone.

══════════════════════════════════════════════════════════════════════════
RUNTIME CONTRACT (위반 시 화면이 깨진다 — 절대 준수)
══════════════════════════════════════════════════════════════════════════
- Your output is executed by react-live in noInline mode.
- The ONLY things in scope are: React, useState. NOTHING else is importable.
  Do NOT write any import/export statements. Do NOT use any library (no lucide,
  no charts, no framer-motion, no Tailwind plugin).
- Define a single functional component named App, then on the LAST line call:
      render(<App />)
- Icons: draw them as inline <svg> with hand-written paths. No icon libraries.
- STYLING: Use ONLY inline style objects (style={{ ... }}). Do NOT use className
  or Tailwind utilities — the runtime does NOT compile them, so they silently do
  nothing. Layout, spacing, color, shadow, radius — ALL via inline style.
- BASE TEMPLATE INJECTION: You may be given a BASE TEMPLATE CODE — a pre-built,
  structurally complete screen that has ALREADY been converted to inline styles
  (style={{ ... }}). It contains NO Tailwind className: layout, spacing, sizing,
  radius and shadow are all expressed as inline style objects for you. You do NOT
  need to translate any Tailwind — that work is already done. Your job on this
  blueprint is narrow and creative:
    (a) PRESERVE THE LAYOUT. Keep every style property that controls STRUCTURE
        (display, flex*, grid*, position, top/right/bottom/left, width, height,
        padding*, margin*, gap, alignItems, justifyContent, etc.). Do NOT change
        these, or the screen collapses.
    (b) RE-COLOR & RE-STYLE TO THE TONE. The blueprint's color values
        (backgroundColor, color, borderColor, fill, gradient stops) and its
        typographic/visual values (fontFamily, borderRadius, boxShadow) are
        PLACEHOLDERS. Replace EVERY color value with the provided tone HEX tokens
        (or alpha/derived variants), and tune fontFamily / borderRadius /
        boxShadow to match the tone's UI tokens and mood. Leave NO placeholder
        color from the blueprint behind.
    (c) REPLACE ICONS. The blueprint still imports icons from a library (e.g.
        lucide), which does NOT exist in this runtime. Replace every imported icon
        component with a hand-written inline <svg> and drop the import lines.
  Never re-introduce className or Tailwind utilities — they do not compile here.
- All colors MUST come from the provided HEX tokens (or alpha/derived variants of
  them like 'rgba(...)'/ '...20'). Do not invent unrelated colors.
- Output RAW JSX CODE ONLY. No markdown fences, no prose, no comments before/after.

══════════════════════════════════════════════════════════════════════════
AESTHETIC DIRECTIVES (the part that separates pros from AI slop)
══════════════════════════════════════════════════════════════════════════
1. SURPRISE THE USER. CSS, HTML, SVG are an amazing medium — play with scale,
   fills, texture, visual rhythm, layering, and novel layouts. Avoid the boring
   stack-of-equal-boxes layout. Use deliberate scale contrast (one large hero
   element vs. small supporting ones), overlap/layering, and asymmetry.

2. MICRO-DETAILS & STATE. Do not ship a flat static mockup. Add real interaction:
   hover and active states (via onMouseEnter/onMouseLeave + useState, since there
   is no CSS pseudo-class support for inline styles), subtle CSS transitions
   (transition: 'all 200ms ease'), and depth through layered shadows. At least one
   element must visibly react to interaction.

3. PRO UX CONSTRAINTS.
   - Every clickable target (buttons, tappable rows) must be at least 44px tall.
   - Use display:'grid' / 'flex' for layout, never absolute hacks for structure.
   - Long text: set whiteSpace appropriately and keep comfortable line-height.
   - Respect a clear visual hierarchy: one primary action per screen.

4. NO FILLER / NO DATA SLOP. Every element earns its place. Do NOT pad the screen
   with meaningless dummy stats, lorem text, or random numbers to "fill space".
   Solve emptiness with whitespace, composition, and typographic rhythm instead.

5. HONOR THE 60-30-10 COLOR RULE.
   - 60%: background/surface tokens dominate the canvas (low visual fatigue).
   - 30%: primary/secondary for section surfaces and rhythm.
   - 10%: tertiary/accent ONLY on the single most important action or highlight.
   Do not flood the screen with the accent color.

6. CONTENT IN KOREAN. All user-facing copy in the screen must be natural Korean
   matching the app's domain — realistic labels, not placeholder gibberish.

══════════════════════════════════════════════════════════════════════════
APP VIEWPORT CONTRACT (390 × 844 모바일 앱 화면 안에서 렌더된다 — 반드시 준수)
══════════════════════════════════════════════════════════════════════════
- 출력은 데코용 폰 목업이 아니라 "실제로 구동되는 앱 한 화면" 그 자체다.
- App 의 root 요소는 화면 전체를 채우는 앱 컨테이너여야 한다:
      width:'100%', minHeight:'100%', boxSizing:'border-box',
      display:'flex', flexDirection:'column',
      backgroundColor: <background 토큰>
  → 콘텐츠가 짧아도 배경이 화면 전체를 덮어 흰 여백이 보이면 안 된다.
- 모바일 앱답게: 상단 헤더/타이틀 영역, 본문(스크롤 영역), 그리고 필요하면
  하단 고정 탭바나 기본 액션(CTA) 같은 실제 앱 구조를 갖춰라.
- 너비 390px 기준으로 디자인하라. 가로 overflow 가 생기지 않게 모든 요소는
  부모 폭 안에 들어와야 한다(고정 px 폭 남발 금지, % 나 flex 로 신축).
- 스크롤바를 노출하지 마라. 세로 스크롤은 호스트(앱 뷰포트)가 처리하므로 root 에
  overflow:'scroll'/'auto' 로 스크롤 컨테이너를 또 만들지 말고, 콘텐츠가 길면 그냥
  세로로 쌓아라(네이티브 앱처럼 보여야 하며 웹사이트 스크롤바가 보이면 안 된다).
- 스크롤바는 호스트가 이미 전역으로 숨긴다. 그러니 style 객체에 스크롤바 관련
  속성('::-webkit-scrollbar', scrollbarWidth, msOverflowStyle 등)을 절대 넣지 마라.
  애초에 inline style 은 '::-webkit-scrollbar' 같은 가상선택자(::)를 지원하지 않아
  넣으면 런타임 에러가 난다. 어떤 가상선택자(::before, :hover 등)도 style 에 쓰지 마라.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// USER PROMPT
// ─────────────────────────────────────────────────────────────────────────────
export function buildUiUserPrompt(tone, survey, baseTemplateCode) {
  // 템플릿이 주어졌는지 여부로 "모드"가 완전히 갈린다.
  //   - 템플릿 모드: 주어진 청사진을 재색칠/재스타일만 한다(레이아웃 재창조 금지).
  //   - 자유 모드: 도메인에 맞는 화면을 처음부터 디자인한다(기존 동작).
  // 같은 프롬프트로 두 작업을 동시에 시키면 SYSTEM 의 강한 창의 지시(SURPRISE/
  // novel layout/asymmetry)가 "레이아웃 유지"를 이겨, 템플릿을 골라도 전혀 다른
  // 화면이 나온다. 그래서 모드별로 요구사항과 강조점을 분리한다.
  if (baseTemplateCode) {
    return buildTemplateModeUserPrompt(tone, survey, baseTemplateCode);
  }
  return buildFreeModeUserPrompt(tone, survey);
}

// 자유 모드: 베이스 템플릿 없이 도메인 화면을 처음부터 디자인한다(기존 동작).
function buildFreeModeUserPrompt(tone, survey) {
  return `다음 앱의 실제 화면 하나를 위 디자인 톤으로 디자인해서 JSX 코드로 생성하라.

[APP CONTEXT]
${serializeSurvey(survey)}

[DESIGN TONE — 반드시 이 톤의 색·폰트·무드를 충실히 반영]
${serializeTone(tone)}

요구사항:
- 이 앱의 도메인에 실제로 존재할 법한 핵심 화면 1개(예: 홈/대시보드/상세/온보딩 중 가장 대표적인 것)를 골라 디자인하라.
- 위 SYSTEM 의 미학·런타임 규칙을 모두 지킬 것. 특히 모든 스타일은 인라인 style 로, 색상은 제공된 HEX 토큰으로만.
- 최소 하나의 요소에 hover/active 인터랙션과 transition 을 넣어라.
- 마지막 줄은 반드시 render(<App />) 로 끝나야 한다.

이제 RAW JSX 코드만 출력하라.`;
}

// 템플릿 모드: 주어진 청사진의 레이아웃·DOM 구조를 그대로 유지한 채 톤에 맞춰
// 재색칠/재스타일만 한다. 템플릿 블록을 맥락 직후(톤보다 위)로 올려, 이것이
// "절대적 시작점"이며 톤은 "여기에 입히는 팔레트"임을 분명히 한다.
function buildTemplateModeUserPrompt(tone, survey, baseTemplateCode) {
  return `사용자는 아래 [BASE TEMPLATE] 레이아웃을 직접 골랐다. 너의 임무는 새 화면을
"디자인"하는 것이 아니라, 이 템플릿을 그대로 두고 아래 [DESIGN TONE] 으로 "다시
칠하고 다시 스타일링"하는 것이다. 결과물은 반드시 이 템플릿과 한눈에 닮아 있어야 한다.

[APP CONTEXT]
${serializeSurvey(survey)}

[BASE TEMPLATE — 절대적 시작점. already converted to inline styles]
아래 코드를 그대로 출발점으로 삼아라. 구조적으로 완성돼 있고 이미 인라인 style 객체만
쓴다(Tailwind className 없음).

이 템플릿에 대해 너가 해야 할 일(이것만):
1) 레이아웃·DOM 구조를 그대로 보존한다. STRUCTURE 를 제어하는 모든 style 속성
   (display, flex*, grid*, position, top/right/bottom/left, width, height,
   padding*, margin*, gap, alignItems, justifyContent 등)을 바꾸지 마라. 요소를
   추가/삭제/재배치하지 마라 — 바꾸면 화면이 무너지고 "닮음"이 깨진다.
2) 색을 전부 [DESIGN TONE] 의 HEX 토큰(또는 그 알파/명암 파생값)으로 교체한다.
   템플릿의 색 값(backgroundColor, color, borderColor, fill, gradient stop)은
   전부 플레이스홀더다. 남는 플레이스홀더 색이 하나도 없게 하라.
3) fontFamily / borderRadius / boxShadow 를 톤의 UI 토큰·무드에 맞게 조정한다.
4) lucide 등에서 import 된 아이콘 컴포넌트(<Heart />, <Send /> 같은 대문자 미정의
   태그)를 전부 손으로 그린 인라인 <svg> 로 교체하고 import 줄은 버린다.
5) 텍스트/이미지는 [APP CONTEXT] 도메인에 맞는 자연스러운 한국어/내용으로 바꾼다.

창의성은 색·타이포·마이크로 디테일(그림자 층, hover 반응, transition)에서만 발휘하라.
새로운 레이아웃을 발명하거나 "더 멋진" 구조로 재배치하지 마라 — 그건 이 작업이 아니다.

\`\`\`jsx
${baseTemplateCode}
\`\`\`

[DESIGN TONE — 위 템플릿에 입힐 팔레트·타이포·무드]
${serializeTone(tone)}

마무리 체크:
- className / Tailwind 유틸리티 절대 재도입 금지. 모든 스타일은 인라인 style 로.
- 인라인 style 에 가상선택자(::before, :hover 등) 금지(hover 는 onMouseEnter+useState).
- 최소 하나의 요소에 hover/active 인터랙션과 transition 을 넣어라.
- 마지막 줄은 반드시 render(<App />) 로 끝나야 한다.

이제 위 템플릿을 톤으로 재색칠한 RAW JSX 코드만 출력하라.`;
}
