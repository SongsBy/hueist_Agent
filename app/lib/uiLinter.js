// app/lib/uiLinter.js
//
// 생성형 UI(react-live noInline) 출력에 대한 결정론적 검증 린터.
//
// 배경: LLM 은 가끔 런타임 계약을 어긴다 — Tailwind className 을 환각하거나,
// 인라인 style 에서 지원되지 않는 가상선택자(&:hover, ::before, ::-webkit-scrollbar)
// 를 쓰거나, 디자인 시스템에 없는 임의의 HEX 색을 발명하거나, 전처리기가 남긴
// lucide 아이콘 컴포넌트(<Heart />)를 인라인 <svg> 로 교체하지 않고 남겨둔다.
// 이런 코드는 react-live 에서 조용히 깨지거나 런타임 에러를 낸다.
//
// 이 린터는 LLM 의 원문(sanitize 된) 코드 문자열을 검사해, 계약 위반 시 구체적인
// 메시지와 함께 Error 를 던지는 "엄격한 게이트키퍼"다. API 라우트는 이 에러를 잡아
// 남은 재시도 횟수가 있으면 (위반 사유를 피드백해) 재생성하고, 모두 실패하면
// 사용자에게 사유를 전달한다.

import { transform } from "sucrase";

// ─────────────────────────────────────────────────────────────────────────────
// HEX 정규화 / RGB 유틸
// ─────────────────────────────────────────────────────────────────────────────

// '#' 뒤의 hex 본문(3/4/6/8 자리)을 "알파를 제외한 6자리 RGB 대문자"로 정규화한다.
//   - #RGB      → RRGGBB   (각 자리 2배 확장)
//   - #RGBA     → RRGGBB   (알파 무시)
//   - #RRGGBB   → RRGGBB
//   - #RRGGBBAA → RRGGBB   (알파 무시)
// 길이가 위 4가지가 아니면 정규화 불가로 보고 null 을 돌린다.
function normalizeHex(hexBody) {
  const h = hexBody.toUpperCase();

  switch (h.length) {
    case 3: // RGB
    case 4: // RGBA → 앞 3자리만
      return h
        .slice(0, 3)
        .split("")
        .map((c) => c + c)
        .join("");
    case 6: // RRGGBB
    case 8: // RRGGBBAA → 앞 6자리만
      return h.slice(0, 6);
    default:
      return null;
  }
}

// 정규화된 6자리 RRGGBB → [r, g, b] (0~255).
function hexToRgb(normalized) {
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ];
}

// 코드 문자열에서 모든 HEX 색상 리터럴을 뽑아낸다(3/4/6/8 자리, 대소문자 무관).
// 경계(\b 유사) 처리를 위해 hex 문자가 더 이어지지 않는 지점까지만 매칭한다.
function extractHexColors(code) {
  const matches = code.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
  // 8자리를 넘는 잘못된 토큰이 \b 로 인해 부분 매칭되지 않도록 본문 길이를 다시 검증.
  return matches
    .map((m) => m.slice(1)) // '#' 제거
    .filter((body) => [3, 4, 6, 8].includes(body.length));
}

// ─────────────────────────────────────────────────────────────────────────────
// 색 허용 판정 (개선점 ②)
//
// 시스템 프롬프트의 계약은 "토큰, 또는 그 알파/파생(명암) 변형"을 허용한다. 따라서
// 린터도 다음을 허용해야 한다(과거엔 토큰 정확일치 + 알파만 허용해 명암 파생 셰이드를
// 오탐 반려했다):
//   (a) 토큰과 정확히 일치(알파 무시)
//   (b) 중립색(흰/검/회색 계열) — 텍스트·테두리·그림자에 쓰이는 무채색
//   (c) 토큰을 흰색/검은색 쪽으로 보간한 tint/shade 램프 위의 색(명암 파생값)
// 반대로, 토큰과 무관한 "새 색조"(예: 파랑 토큰뿐인데 빨강)는 여전히 거부한다.
// ─────────────────────────────────────────────────────────────────────────────

// 토큰에서 어긋난 정도를 얼마나 봐줄지(채널당 절대 오차). 명암 파생은 넉넉히 허용하되
// 명백히 다른 색조는 걸러내는 균형값.
const RAMP_TOLERANCE = 24;
// 무채색 판정: 채널 간 최대-최소 차가 이 이하이면 회색 계열로 본다.
const NEUTRAL_SPREAD = 20;

// tone.colors 의 값들에서 허용 RGB 토큰 목록을 만든다. 키 이름에 의존하지 않고 모든
// 문자열 값을 훑어 HEX 인 것만 수집한다(토큰 셋이 늘어도 자동 대응).
function buildAllowedRgbTokens(tone) {
  const tokens = [];
  const colors = tone?.colors ?? {};

  for (const value of Object.values(colors)) {
    if (typeof value !== "string") continue;
    const m = value.match(/^#?([0-9a-fA-F]{3,8})$/);
    if (!m) continue;
    const normalized = normalizeHex(m[1]);
    if (normalized) tokens.push(hexToRgb(normalized));
  }

  return tokens;
}

// 무채색(흰/검/회색)인가 — 채널이 거의 같은 값이면 브랜드 색이 아니라 중립색이다.
function isNeutral([r, g, b]) {
  return Math.max(r, g, b) - Math.min(r, g, b) <= NEUTRAL_SPREAD;
}

// 후보색 c 가 토큰 t 를 end(흰색 또는 검은색) 쪽으로 보간한 램프 위에 있는가.
// c ≈ t + p*(end - t), p ∈ [0,1] 를 최소제곱으로 추정해 재구성 오차로 판정한다.
function onRamp(c, t, end) {
  let num = 0;
  let den = 0;
  for (let k = 0; k < 3; k += 1) {
    const d = end[k] - t[k];
    num += (c[k] - t[k]) * d;
    den += d * d;
  }
  if (den === 0) return false; // 토큰이 곧 end 색(순백/순흑) — 램프가 한 점.

  const p = num / den;
  if (p < 0 || p > 1) return false; // 토큰~end 사이가 아니면 파생이 아니다.

  for (let k = 0; k < 3; k += 1) {
    const recon = t[k] + p * (end[k] - t[k]);
    if (Math.abs(recon - c[k]) > RAMP_TOLERANCE) return false;
  }
  return true;
}

// 후보색이 토큰의 명암(tint/shade) 파생값인가.
function isDerivedFrom(c, t) {
  return onRamp(c, t, [255, 255, 255]) || onRamp(c, t, [0, 0, 0]);
}

// 후보 RGB 가 계약상 허용되는가.
function isAllowedColor(rgb, allowedTokens) {
  if (isNeutral(rgb)) return true;
  for (const t of allowedTokens) {
    // 정확 일치(오차 0)도 isDerivedFrom 의 p=0 경로로 자연히 포함된다.
    if (isDerivedFrom(rgb, t)) return true;
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// 미정의 아이콘/컴포넌트 검출 (개선점 ④)
//
// 전처리기는 lucide import 와 <Heart /> 같은 아이콘 컴포넌트를 일부러 안 건드리고
// LLM 에게 인라인 <svg> 로 교체하도록 맡긴다. LLM 이 import 만 지우고 사용처
// (<Heart />)를 남기면, react-live scope 에 그 식별자가 없어 런타임 크래시가 난다.
// sanitize 의 stripModuleSyntax 도 import 만 지우지 사용처는 못 잡는다.
// 여기서 "코드 안에서 정의되지 않은 대문자 JSX 컴포넌트"를 결정론적으로 잡는다.
// ─────────────────────────────────────────────────────────────────────────────

// react-live scope 또는 내장으로 항상 허용되는 컴포넌트 식별자.
const BUILTIN_COMPONENTS = new Set(["App", "Fragment", "React"]);

// 코드 안에서 (지역) 정의된 대문자 식별자들을 모은다:
//   function App() / const Card = ... / let X = ... / class Foo ...
function collectDefinedComponents(code) {
  const defined = new Set();
  const re = /\b(?:function|class|const|let|var)\s+([A-Z]\w*)/g;
  let m;
  while ((m = re.exec(code)) !== null) defined.add(m[1]);
  return defined;
}

// 사용된 대문자 JSX 여는 태그 이름들을 모은다(<Heart .../>, <Card>, <React.Fragment>).
function collectUsedComponents(code) {
  const used = new Set();
  const re = /<([A-Z]\w*)/g;
  let m;
  while ((m = re.exec(code)) !== null) used.add(m[1]);
  return used;
}

// ─────────────────────────────────────────────────────────────────────────────
// validateGeneratedUi
// ─────────────────────────────────────────────────────────────────────────────

/**
 * react-live 런타임 계약을 검사한다. 위반 시 구체적 메시지의 Error 를 던진다.
 *
 * @param {string} code - sanitize 된 LLM 출력 코드(순수 JSX 문자열)
 * @param {object} tone - 확정된 톤. tone.colors 에 허용 색 토큰들이 들어있다.
 * @throws {Error} 계약 위반 시
 */
export function validateGeneratedUi(code, tone) {
  if (typeof code !== "string" || code.trim() === "") {
    throw new Error("린터: 검증할 코드가 비어 있습니다.");
  }

  // 0) 문법 검사 (Syntax Check) — LLM이 쉼표나 괄호를 빼먹는 오타를 냈을 때
  // react-live 런타임에서 터지기 전에 백엔드에서 미리 잡아서 재시도를 돌린다.
  try {
    transform(code, { transforms: ["jsx"] });
  } catch (syntaxErr) {
    throw new Error(
      `문법 에러(SyntaxError) 발생: ${syntaxErr.message}. 객체 내 쉼표(,) 누락, 괄호 짝 미스, 닫히지 않은 태그 등 JS/JSX 기본 문법을 지키세요.`,
    );
  }

  // 1) className 금지 — Tailwind 는 런타임에 컴파일되지 않으므로 조용히 무력화된다.
  if (/className\s*=/.test(code)) {
    throw new Error(
      "린터: className 사용이 감지됨. react-live 런타임은 Tailwind 를 컴파일하지 못하므로 모든 스타일은 인라인 style 객체로 작성해야 합니다.",
    );
  }

  // 2) 가상선택자 금지 — 인라인 style 은 CSS pseudo-class/element 를 지원하지 않는다.
  //    따옴표로 감싼 셀렉터 키만 잡아 일반 객체 문법('prop: value')의 단일 콜론과의
  //    오탐을 피한다. 매칭 대상: '&:hover', '::before', '::-webkit-scrollbar', ':focus' 등.
  const pseudoMatch = code.match(/['"`]\s*&?:{1,2}[a-zA-Z-]+/);
  if (pseudoMatch) {
    throw new Error(
      `린터: 인라인 style 에서 지원되지 않는 가상선택자(${pseudoMatch[0].trim()})가 감지됨. ` +
        "hover/active 등 상태 스타일은 onMouseEnter/onMouseLeave + useState 로 구현해야 합니다.",
    );
  }

  // 3) 색상 토큰 검증(개선점 ②) — 디자인 토큰, 그 알파/명암 파생값, 또는 무채색만 허용.
  //    토큰과 무관한 새 색조만 거부한다(프롬프트 계약과 일치).
  const allowedTokens = buildAllowedRgbTokens(tone);
  // tone.colors 가 비어 토큰을 만들 수 없으면 색 검증을 건너뛴다(다른 규칙은 유효).
  if (allowedTokens.length > 0) {
    for (const body of extractHexColors(code)) {
      const normalized = normalizeHex(body);
      if (!normalized) continue;
      const rgb = hexToRgb(normalized);
      if (!isAllowedColor(rgb, allowedTokens)) {
        throw new Error(
          `린터: 디자인 토큰과 무관한 색상 #${body} 가 감지됨. ` +
            "색상은 tone.colors 의 토큰, 그 알파/명암 파생값, 또는 무채색(흰/검/회색)만 사용해야 합니다.",
        );
      }
    }
  }

  // 4) 미정의 아이콘/컴포넌트 금지(개선점 ④) — 코드 안에서 정의되지 않은 대문자
  //    JSX 컴포넌트(<Heart /> 등 외부 아이콘 라이브러리 잔재)는 런타임 크래시를 낸다.
  const defined = collectDefinedComponents(code);
  const used = collectUsedComponents(code);
  const undefinedComponents = [...used].filter(
    (name) => !defined.has(name) && !BUILTIN_COMPONENTS.has(name),
  );
  if (undefinedComponents.length > 0) {
    throw new Error(
      `린터: 정의되지 않은 컴포넌트(${undefinedComponents.join(", ")})가 사용됨. ` +
        "외부 아이콘 라이브러리(lucide 등)는 런타임 scope 에 없습니다. 손으로 그린 인라인 <svg> 로 교체하세요.",
    );
  }

  // 5) render( 호출 필수 — noInline 모드는 명시적 render(<App />) 가 있어야 화면이 뜬다.
  if (!/render\s*\(/.test(code)) {
    throw new Error(
      "린터: render( 호출이 없음. noInline 모드에서는 마지막에 render(<App />) 를 호출해야 합니다.",
    );
  }
}
