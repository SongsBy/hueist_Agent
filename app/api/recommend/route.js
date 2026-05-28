import {
  CURATED_KOREAN_FONTS,
  FALLBACK_FONT_STACK,
  buildCurationForPrompt,
  buildGoogleFontUrl,
  fetchKoreanFonts,
  findCuratedFont,
} from "@/app/lib/googleFonts";

const DEFAULT_HEADING_FALLBACK = "Noto Sans KR";
const DEFAULT_BODY_FALLBACK = "Noto Sans KR";

const TYPOGRAPHY_MATCHING_GUIDE = `
### TYPOGRAPHY MATCHING LOGIC (반드시 적용):
- 신뢰감·전문성이 핵심인 금융/B2B/SaaS → Geometric Sans (예: Noto Sans KR, Gothic A1, IBM Plex Sans KR)
- 에디토리얼·매거진·럭셔리 무드 → Serif (예: Noto Serif KR, Gowun Batang, Hahmlet)
- 임팩트·헤드라인 강조형 → Bold Display (예: Black Han Sans, Do Hyeon)
- 친근한 라이프스타일/커뮤니티/F&B → Humanist Sans 또는 캐주얼 Display (예: Gowun Dodum, Jua, Sunflower)
- 패션·뷰티·하이엔드 → Slim Sans 또는 Delicate Serif (예: Stylish, Diphylleia, Sunflower)
- 손글씨 감성·캠페인 액센트 → Handwriting (예: Nanum Pen Script, Gaegu)
- 본문은 가독성을 최우선으로 하여 무게 400~500 사이의 Sans/Serif를 우선 선택.
- 제목과 본문은 같은 패밀리여도 좋고(One-family 전략), 분리해도 좋음(Pair 전략). 단, 두 폰트 모두 아래 목록에서만 선택.
`;

function buildSystemPrompt(fontCurationText) {
  return `
You are a Senior Art Director and UI/UX Design Strategist.
Dissect the 'Design DNA' of market-leading services and transplant them into the user's app.

### CRITICAL RULES:
1. **LANGUAGE**: ALL text values in the JSON output MUST be written in **KOREAN**.
2. **NO BRAND NAMES**: Do NOT use commercial brand names in the 'name' field.
3. **NAMING CONVENTION**: The 'name' field MUST explicitly state the functional or visual emphasis of the design.
   - Use formats like: "[Core Emphasis] Emphasis Type" or "[Focus Area] Centric DNA".
   - Good Examples: "고대비 전환 강조형", "타이포그래피 정보 중심형", "이미지 큐레이션 몰입형", "여백 활용 미니멀리즘 강조형", "그리드 기반 데이터 집중형".
   - Bad Examples: "현대적인 갤러리", "따뜻한 감성" (Too vague/Not emphasis-focused).
4. **TYPOGRAPHY WHITELIST**: 'typography.heading_font'와 'typography.body_font'는 반드시 아래 [AVAILABLE_KOREAN_FONTS] 목록 안에서만 선택해야 한다. 목록 외 폰트(예: Pretendard, Apple SD Gothic, 사용자 정의명 등) 출력은 금지.

### Step 1: Domain Deep Dive (Analyze in Korean)
- Identify the core value of the domain.
- Identify 3 benchmark services and justify them.

### Step 2: Reverse Engineering (Analyze in Korean)
- Analyze Visual Strategy, Typography, Layout, and Color Logic of benchmarks.

### Step 3: Proposal (Write in Korean)
- Create 3 distinct tones with detailed DNA descriptions based on the naming convention above.
- 각 톤마다 [AVAILABLE_KOREAN_FONTS]에서 최적의 heading/body 폰트를 선택하고, 그 선택의 타이포그래피적 근거(font_rationale)를 한국어로 작성한다.

[AVAILABLE_KOREAN_FONTS]
${fontCurationText}

${TYPOGRAPHY_MATCHING_GUIDE}
`;
}

const USER_PROMPT_TEMPLATE = (appDescription) => `
[App Description]: "${appDescription}"

Response JSON Structure (Fill all values in KOREAN. Fonts MUST come from [AVAILABLE_KOREAN_FONTS]):
{
  "domain_analysis": "도메인의 본질과 시각적 전략에 대한 심층 분석 (In Korean)",
  "tones": [
    {
      "name": "예: 고대비 전환 강조형 (반드시 강조하는 요소를 이름에 명시할 것)",
      "benchmark_origin": "벤치마크한 실제 서비스명과 추출한 디자인 요소 (In Korean)",
      "archetype": "브랜드 아키타입 한 줄 (In Korean)",
      "description": "이 스타일이 왜 이 도메인에 적합한지에 대한 논리적 설명 (In Korean)",
      "mood": ["키워드1", "키워드2", "키워드3"],
      "colors": {
        "primary": "#HEX",
        "secondary": "#HEX",
        "tertiary": "#HEX",
        "surface": "#HEX",
        "background": "#HEX"
      },
      "ui_tokens": {
        "border_radius": 8,
        "shadow_depth": "soft",
        "spacing_density": "balanced",
        "font_weight_heading": 700,
        "contrast_level": "high"
      },
      "typography": {
        "heading_font": "예: Noto Sans KR  (반드시 AVAILABLE_KOREAN_FONTS에서 선택)",
        "body_font": "예: Noto Sans KR  (반드시 AVAILABLE_KOREAN_FONTS에서 선택)",
        "font_rationale": "선택한 heading/body 조합이 이 톤의 디자인 DNA와 어울리는 타이포그래피적 근거 (In Korean)",
        "font_weight_map": {
          "heading": 700,
          "body": 400,
          "emphasis": 500
        }
      },
      "design_dna_details": {
        "typography": "타이포그래피 전략 상세 (In Korean)",
        "whitespace": "여백 및 레이아웃 밀도 전략 (In Korean)",
        "iconography": "아이콘 및 그래픽 스타일 가이드 (In Korean)"
      }
    }
  ]
}
`;

function pickWeightFromFont(font, kind) {
  if (!font) return null;
  return font.recommended_weights?.[kind] ?? null;
}

function clampWeight(weight, font) {
  if (!font || !Array.isArray(font.weights) || font.weights.length === 0) {
    return weight;
  }
  const num = Number(weight);
  if (!Number.isFinite(num)) return font.recommended_weights?.body ?? 400;
  // 정확히 지원되는 weight면 그대로, 아니면 가장 가까운 값으로 스냅.
  if (font.weights.includes(num)) return num;
  return font.weights.reduce((best, w) =>
    Math.abs(w - num) < Math.abs(best - num) ? w : best,
  );
}

function enrichTypography(rawTypography) {
  const heading =
    findCuratedFont(rawTypography?.heading_font) ??
    findCuratedFont(DEFAULT_HEADING_FALLBACK);
  const body =
    findCuratedFont(rawTypography?.body_font) ??
    findCuratedFont(DEFAULT_BODY_FALLBACK);

  const weightMap = rawTypography?.font_weight_map ?? {};
  const headingWeight = clampWeight(
    weightMap.heading ?? pickWeightFromFont(heading, "heading") ?? 700,
    heading,
  );
  const bodyWeight = clampWeight(
    weightMap.body ?? pickWeightFromFont(body, "body") ?? 400,
    body,
  );
  const emphasisWeight = clampWeight(
    weightMap.emphasis ?? pickWeightFromFont(body, "emphasis") ?? 500,
    body,
  );

  const sameFamily = heading.family === body.family;
  const families = sameFamily
    ? [
        {
          family: heading.family,
          weights: [headingWeight, bodyWeight, emphasisWeight],
        },
      ]
    : [
        { family: heading.family, weights: [headingWeight, emphasisWeight] },
        { family: body.family, weights: [bodyWeight, emphasisWeight] },
      ];

  const google_font_url = buildGoogleFontUrl(families);

  return {
    heading_font: heading.family,
    body_font: body.family,
    font_rationale:
      typeof rawTypography?.font_rationale === "string" &&
      rawTypography.font_rationale.trim().length > 0
        ? rawTypography.font_rationale
        : `${heading.family}은(는) ${heading.personality} ${
            sameFamily
              ? "동일 패밀리의 다른 굵기로 위계를 만들어 일관된 톤을 유지한다."
              : `${body.family}을(를) 본문에 매칭하여 ${body.personality}`
          }`,
    font_weight_map: {
      heading: headingWeight,
      body: bodyWeight,
      emphasis: emphasisWeight,
    },
    google_font_url,
    fallback_stack: FALLBACK_FONT_STACK,
  };
}

function normalizeTone(tone) {
  if (!tone || typeof tone !== "object") return tone;
  const typography = enrichTypography(tone.typography);
  return {
    ...tone,
    typography,
    // 기존 UI(ToneCard/AppPreview/result)와의 하위 호환.
    font_pairing: {
      heading: typography.heading_font,
      body: typography.body_font,
    },
  };
}

export async function POST(req) {
  try {
    const { appDescription } = await req.json();

    if (!appDescription) {
      return Response.json(
        { error: "앱 설명을 입력해주세요." },
        { status: 400 },
      );
    }

    // 큐레이션 + (가능 시) 라이브 검증된 폰트 리스트. 24h ISR 캐시.
    const curatedFonts = await fetchKoreanFonts();
    const fontCurationText = buildCurationForPrompt(
      curatedFonts.length > 0 ? curatedFonts : CURATED_KOREAN_FONTS,
    );
    const systemPrompt = buildSystemPrompt(fontCurationText);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              parts: [{ text: USER_PROMPT_TEMPLATE(appDescription) }],
            },
          ],
          generationConfig: {
            temperature: 0.85,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    const data = await response.json();

    if (!response.ok || !Array.isArray(data?.candidates)) {
      console.error("Gemini API Error Response:", data);
      return Response.json(
        { error: "AI 생성에 실패했습니다." },
        { status: 502 },
      );
    }

    const text = data.candidates[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(text);

    const tones = Array.isArray(parsed?.tones)
      ? parsed.tones.map(normalizeTone)
      : [];

    return Response.json({ ...parsed, tones });
  } catch (error) {
    console.error("Gemini API 오류:", error);
    return Response.json(
      { error: "톤 추천에 실패했어요. 다시 시도해주세요." },
      { status: 500 },
    );
  }
}
