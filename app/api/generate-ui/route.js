import {
  buildUiSystemPrompt,
  buildUiUserPrompt,
} from "@/app/lib/uiPromptBuilder";

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

  // 앞뒤 설명이 있더라도 가장 첫 번째 ```jsx 안의 내용만 추출
  const match = raw.match(/```(?:jsx|tsx|javascript)?\s*\n([\s\S]*?)\n?```/);

  const code = match ? match[1] : raw;
  return stripModuleSyntax(code).trim();
}

// 생성형 UI 전용 엔드포인트.
// 선택된(보강된) 톤 + 설문 맥락을 받아 Gemini 3.5 Flash 로 단일 화면 JSX 를 생성한다.
// enrich(외부 데이터 보강)와 책임을 분리해 독립적으로 호출/재생성할 수 있다.
export async function POST(req) {
  try {
    const body = await req.json();
    const tone = body?.tone;
    const survey = body?.survey ?? null;

    if (!tone || typeof tone !== "object" || !tone.colors) {
      return Response.json(
        { error: "유효한 톤 데이터(colors 포함)가 필요합니다." },
        { status: 400 },
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: buildUiSystemPrompt() }],
          },
          contents: [
            {
              parts: [{ text: buildUiUserPrompt(tone, survey) }],
            },
          ],
          generationConfig: {
            // 창의적 레이아웃을 위해 약간 높게. JSON 모드가 아닌 순수 코드 텍스트.
            temperature: 0.9,
          },
        }),
      },
    );

    const data = await response.json();

    if (!response.ok || !Array.isArray(data?.candidates)) {
      console.error("Gemini generate-ui Error:", data);
      return Response.json(
        { error: "UI 생성에 실패했습니다." },
        { status: 502 },
      );
    }

    const text = data.candidates[0]?.content?.parts?.[0]?.text;
    const code = sanitizeCode(text);

    if (!code || !/render\s*\(/.test(code)) {
      console.error("generate-ui: render() 호출이 없는 코드", text);
      return Response.json(
        { error: "생성된 UI 코드가 올바르지 않아요. 다시 시도해주세요." },
        { status: 502 },
      );
    }

    return Response.json({ code });
  } catch (error) {
    console.error("generate-ui API 오류:", error);
    return Response.json(
      { error: "UI 생성에 실패했어요. 다시 시도해주세요." },
      { status: 500 },
    );
  }
}
