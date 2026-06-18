import { readFile } from "fs/promises";
import path from "path";
import {
  buildUiSystemPrompt,
  buildUiUserPrompt,
} from "@/app/lib/uiPromptBuilder";
import { callGemini } from "@/app/lib/geminiClient";
import { validateGeneratedUi } from "@/app/lib/uiLinter";
import { preprocessTemplate } from "@/app/lib/tailwindToInline";

// 린터(결정론적 검증)가 코드를 반려했을 때 재생성하는 최대 횟수.
// callGemini 내부의 전송 재시도(503/429 등 일시 오류)와는 별개의,
// "계약 위반 → 재생성" 루프다.
const MAX_LINT_ATTEMPTS = 3;

// generate-ui 가 사용하는 모델 체인. 첫 모델이 과부하(503/429)면 다음으로 폴백한다.
const MODEL_CHAIN = ["gemini-3.5-flash", "gemini-2.5-flash"];

// 템플릿 id → 실제 파일명 매핑. registry.js 의 TEMPLATES[].id 와 1:1로 맞춘다.
// 여기 없는 id(또는 null)는 "템플릿 미선택"으로 간주해 베이스 코드 없이 생성한다.
const TEMPLATE_FILES = {
  feed: "FeedTemplate.jsx",
  dashboard: "DashboardTemplate.jsx",
  travel: "TravelHomeTemplate.jsx",
  media: "MediaHomeTemplate.jsx",
  commerce: "CommerceHomeTemplate.jsx",
  delivery: "DeliveryHomeTemplate.jsx",
  editorial: "EditorialHomeTemplate.jsx",
  productivity: "ProductivityHomeTemplate.jsx",
  fitness: "FitnessHomeTemplate.jsx",
  mobility: "MobilityHomeTemplate.jsx",
  messenger: "MessengerHomeTemplate.jsx",
  audio: "AudioPlayerHomeTemplate.jsx",
  smarthome: "SmartHomeTemplate.jsx",
  edutech: "EduTechHomeTemplate.jsx",
};

// 선택된 템플릿 id 에 해당하는 .jsx 원문을 디스크에서 읽어 반환한다.
// id 가 없거나 매핑/파일 읽기에 실패하면 null 을 돌려, 생성은 템플릿 없이 진행한다
// (Template Injection 은 best-effort: 스켈레톤이 없다고 생성 자체가 막히면 안 된다).
async function loadBaseTemplateCode(selectedTemplateId) {
  const filename = TEMPLATE_FILES[selectedTemplateId];
  if (!filename) return null;

  try {
    const filePath = path.join(
      process.cwd(),
      "app",
      "components",
      "templates",
      filename,
    );
    return await readFile(filePath, "utf-8");
  } catch (error) {
    console.error("generate-ui: 베이스 템플릿 읽기 실패", filename, error);
    return null;
  }
}

// import/export 구문 제거. react-live 의 sucrase 가 import 를 require() 로
// 바꾸면 브라우저에 require 가 없어 "require is not defined" 로 깨지므로,
// 모듈 구문은 실행 전에 반드시 제거해야 한다.
function stripModuleSyntax(code) {
  return code
    .replace(/import\s+(?:[\w*{}\n\r\t, ]+\s+from\s+)?['"][^'"]+['"];?/g, "")
    .replace(/export\s+default\s+/g, "")
    .replace(/^\s*export\s+/gm, "");
}

// LLM 이 가끔 ```jsx ... ``` 펜스나 앞뒤 설명을 붙이므로 제거하고
// react-live 가 바로 실행 가능한 코드만 남긴다.
function sanitizeCode(raw) {
  if (typeof raw !== "string") return "";

  let code = raw;

  // 1) ```jsx ... ``` 처럼 펜스 쌍으로 감싼 경우: 안쪽만 추출(앞뒤 설명 제거).
  const fenced = code.match(/```(?:jsx|tsx|js|javascript)?\s*\n([\s\S]*?)\n?```/);
  if (fenced) code = fenced[1];

  // 2) 비대칭 펜스 방어: 남아 있는 단독 ``` 마커 줄을 전부 제거한다.
  //    일부 모델(gemini-3-flash 등)은 여는 펜스 없이 닫는 ``` 만 흘리는데,
  //    (1) 의 쌍 매칭이 실패하면 raw 에 ``` 가 남아 react-live 파싱이 깨진다.
  //    펜스 마커 줄은 유효한 JS 가 될 수 없으므로 줄 단위로 제거해도 안전하다.
  code = code.replace(/^\s*```[a-zA-Z]*\s*$/gm, "");

  return stripModuleSyntax(code).trim();
}

// 린터가 직전 출력을 반려했을 때, "무엇을 어떻게 고치라"는 교정 지시를 만든다.
// 이걸 다음 재생성 요청의 추가 part 로 붙여, 모델이 같은 실수를 반복하지 않게 한다
// (개선점 ①: 동일 payload 재시도 → 위반 사유 피드백 재시도).
function buildCorrectionPart(lintError) {
  if (!lintError) return null;
  return {
    text: `[검증 실패 — 반드시 교정] 직전에 네가 출력한 코드는 결정론적 검증기(린터)가 반려했다.
반려 사유:
"${lintError.message}"

위 사유를 확실히 해소하도록 코드를 고쳐서, 처음부터 전체 RAW JSX 코드만 다시 출력하라.
아래 계약 위반은 하나도 남기지 마라:
- className / Tailwind 유틸리티 사용 금지(모든 스타일은 인라인 style 객체).
- 인라인 style 에 가상선택자(::before, :hover, ::-webkit-scrollbar, &:hover 등) 금지.
- 색상은 제공된 톤 HEX 토큰과 그 알파/명암 파생값만 사용(임의의 새 브랜드 색 금지).
- lucide 등 외부 아이콘 컴포넌트(<Heart /> 같은 대문자 미정의 태그)를 남기지 말고
  전부 손으로 그린 인라인 <svg> 로 교체.
- 마지막 줄은 반드시 render(<App />).`,
  };
}

// 생성형 UI 전용 엔드포인트.
// 선택된(보강된) 톤 + 설문 맥락을 받아 Gemini 3 Flash 로 단일 화면 JSX 를 생성한다.
// enrich(외부 데이터 보강)와 책임을 분리해 독립적으로 호출/재생성할 수 있다.
export async function POST(req) {
  try {
    const body = await req.json();
    const tone = body?.tone;
    const survey = body?.survey ?? null;
    const selectedTemplateId = body?.selectedTemplateId ?? null;

    if (!tone || typeof tone !== "object" || !tone.colors) {
      return Response.json(
        { error: "유효한 톤 데이터(colors 포함)가 필요합니다." },
        { status: 400 },
      );
    }

    // 선택된 베이스 템플릿의 원문 코드를 읽는다(없으면 null).
    const rawTemplateCode = await loadBaseTemplateCode(selectedTemplateId);

    // Step 1 — 결정론적 전처리. Tailwind className 을 빌드 전에 인라인 style 로 변환해,
    // LLM 이 "Tailwind 번역"이라는 비결정적 작업에 토큰/지연을 쓰지 않게 한다. LLM 은
    // 이제 인라인-스타일 청사진만 받아 톤에 맞춰 색·스타일만 재조정하면 된다.
    const baseTemplateCode = rawTemplateCode
      ? preprocessTemplate(rawTemplateCode)
      : null;

    // 시스템/유저 프롬프트는 입력에만 의존하므로 루프 밖에서 한 번만 만든다.
    const systemPrompt = buildUiSystemPrompt();
    const userPrompt = buildUiUserPrompt(tone, survey, baseTemplateCode);

    // 린터 게이트키퍼 루프: 생성 → sanitize → 검증.
    // 계약 위반(className/가상선택자/rogue HEX/미정의 아이콘/render 누락)이면 출력을
    // 버리고, 위반 사유를 다음 요청에 피드백해 재생성한다(개선점 ①).
    // callGemini 의 내부 재시도(일시 오류)와는 별개다.
    let lastLintError = null;

    for (let attempt = 1; attempt <= MAX_LINT_ATTEMPTS; attempt += 1) {
      // 직전 시도가 린터에 막혔다면 교정 지시를 추가 part 로 덧붙인다.
      const correctionPart = buildCorrectionPart(lastLintError);
      const payload = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [
          {
            parts: [
              { text: userPrompt },
              ...(correctionPart ? [correctionPart] : []),
            ],
          },
        ],
        generationConfig: {
          // 자유 모드(템플릿 없음)는 창의적 레이아웃을 위해 높게(0.9).
          // 템플릿 모드는 주어진 청사진을 충실히 재색칠해야 하므로 이탈을 줄이려
          // 낮춘다(0.55). 같은 0.9 에서는 강한 창의 지시가 "레이아웃 유지"를 이긴다.
          temperature: baseTemplateCode ? 0.55 : 0.9,
        },
      };

      const { ok, status, data } = await callGemini({
        // gemini-3-flash-preview(=Gemini 3 Flash) 사용. 과부하(503)에 대비해
        // gemini-2.5-flash 로 폴백한다. 모델당 시도는 2회로 제한한다.
        models: MODEL_CHAIN,
        maxAttempts: 2,
        payload,
      });

      if (!ok || !Array.isArray(data?.candidates)) {
        console.error("Gemini generate-ui Error:", data);
        // 503/429가 재시도 후에도 지속되면 일시적 과부하임을 사용자에게 알린다.
        // 이는 전송 자체의 실패이므로 린터 루프를 더 돌리지 않고 즉시 반환한다.
        const overloaded = status === 503 || status === 429;
        return Response.json(
          {
            error: overloaded
              ? "AI 서버가 일시적으로 혼잡해요. 잠시 후 다시 시도해주세요."
              : "UI 생성에 실패했습니다.",
          },
          { status: 502 },
        );
      }

      const text = data.candidates[0]?.content?.parts?.[0]?.text;
      const code = sanitizeCode(text);

      // 실제로 응답한 모델(폴백 여부 가시화, 개선점 ③). Gemini 응답의 modelVersion 을
      // 우선 쓰고, 없으면 체인의 첫 모델로 폴백 표기한다.
      const servedModel = data?.modelVersion ?? MODEL_CHAIN[0];

      try {
        // 결정론적 검증. 위반 시 구체적 메시지의 Error 를 던진다.
        validateGeneratedUi(code, tone);
        // 개선점 ③: 어떤 모델이 몇 번째 시도에서 성공했는지 응답에 노출해
        // 운영 관측(품질 절벽·재생성 빈도)을 가능하게 한다.
        return Response.json({ code, model: servedModel, lintAttempts: attempt });
      } catch (lintError) {
        lastLintError = lintError;
        console.error(
          `generate-ui: 린터 위반 (모델 ${servedModel}, 시도 ${attempt}/${MAX_LINT_ATTEMPTS}) — ${lintError.message}`,
          text,
        );
        // 남은 시도가 있으면 위반 사유를 피드백해 재생성(buildCorrectionPart).
      }
    }

    // 모든 시도가 린터를 통과하지 못함 — 마지막 위반 사유를 사용자에게 전달한다.
    return Response.json(
      {
        error: `생성된 UI 코드가 런타임 계약을 반복해서 위반했어요. (${lastLintError?.message ?? "알 수 없는 검증 오류"})`,
        lintAttempts: MAX_LINT_ATTEMPTS,
      },
      { status: 502 },
    );
  } catch (error) {
    console.error("generate-ui API 오류:", error);
    return Response.json(
      { error: "UI 생성에 실패했어요. 다시 시도해주세요." },
      { status: 500 },
    );
  }
}
