import {
  CURATED_KOREAN_FONTS,
  buildCurationForPrompt,
  buildGoogleFontUrlForTones,
  fetchKoreanFonts,
} from "@/app/lib/googleFonts";
import { enrichPalette } from "@/app/lib/colorUtils";

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
5. **DISTINCT TYPOGRAPHY**: 3개의 톤(tones)은 시각적인 차이를 극대화하기 위해 **반드시 서로 다른 폰트 조합(heading/body)**을 사용해야 한다. 동일한 폰트가 2개 이상의 톤에 중복 사용되는 것을 엄격히 금지한다.
6. **DISTINCT COLOR STRUCTURE (가장 중요)**: 3개의 톤은 사용자가 입력한 색 방향(온도/밝기/채도)을 **절대 동일한 방식으로 해석해서는 안 된다.** 입력 색을 3톤 모두의 Primary에 똑같이 칠하는 것은 이 제품의 존재 이유를 부정하는 치명적 오류다. 각 톤은 아래 [COLOR STRATEGY MATRIX]에 정의된 서로 다른 배색 구조(Monochromatic / Minimal-Tint / Complementary)를 강제로 적용해야 한다.
7. **COLOR PLACEMENT & BALANCE (60-30-10 RULE)**: 색상을 제안할 때 단순히 색상 코드만 나열하지 말고, 화면 배치 비율을 철저히 고려할 것.
   - **Background & Surface (60%)**: 화면의 가장 넓은 면적을 차지하며, 시각적 피로도를 낮추기 위해 무채색이나 극도로 채도가 낮은 색상을 배치할 것. (그라데이션 배경 남용 금지)
   - **Primary & Secondary (30%)**: 섹션을 구분하거나 중요한 카드 UI의 배경 등 시각적 리듬을 만드는 데 사용할 것.
   - **Accent/Tertiary (10%)**: 버튼, 뱃지, 중요 타이포그래피 등 가장 좁은 면적에만 사용하여 시선을 집중시킬 것.
   - **조화 (Harmony)**: 색상 간의 명도/채도는 'oklch' 공간의 규칙처럼 시각적으로 튀지 않고 부드럽게 조화(Tone-on-tone 또는 완벽한 보색)를 이루어야 한다.

### COLOR STRATEGY MATRIX (3개 톤에 1:1로 분배, 반드시 준수):
- **[Strategy A — Brand-Forward / Monochromatic]**: 입력된 색 방향을 그대로 받아 **Primary 컬러로 쨍하게 강조**한다. 토스·당근마켓처럼 채도 높은 브랜드 컬러가 화면의 액션 영역(버튼·강조 텍스트)을 점유하고, Secondary/Tertiary는 같은 색상(Hue)의 명도·채도 변주로 구성하는 모노크로매틱 배색.
- **[Strategy B — Minimal / Editorial Tint]**: 입력된 색 방향을 **무채색에 가까운 Background/Surface의 아주 은은한 틴트(채도 매우 낮게)로만** 사용한다. 정작 Primary 포인트 컬러는 입력 색이 아니라 **모노톤(잉크 블랙/차콜) 또는 완전히 다른 대비색**을 쓴다. 노션·애플처럼 색은 거의 비우고 여백과 타이포로 승부하는 에디토리얼 배색.
- **[Strategy C — Complementary / Trendy]**: 입력된 온도와 **반대되는 보색(Complementary)이나 인접 유도 컬러를 적극 섞어** 예상치 못한 트렌디한 배색을 만든다. 입력이 따뜻하면 차가운 보색을, 차가우면 따뜻한 보색을 Primary 또는 Secondary로 끌어들여 대비를 만든다.

### BENCHMARK-DRIVEN DESIGN (반드시 선행):
- 각 톤을 설계하기 전에 **실제로 존재하는 유명 서비스**를 머릿속으로 1개씩 벤치마크하라(총 3개, 서로 다른 서비스).
- 그 서비스가 실제로 쓰는 UI 토큰(border_radius, shadow)과 **'색상 면적 비율'(예: 화면의 몇 %가 무채색이고 몇 %가 포인트 컬러인지)**을 흉내 내어 colors/ui_tokens 값에 반영하라.
- 위 Strategy A/B/C는 자연히 면적 비율이 다르다: A는 포인트 컬러 면적이 넓고, B는 포인트 컬러 면적이 극히 좁으며, C는 두 대비색이 긴장감 있게 분할한다.

### DESIGN AESTHETICS (AVOID AI SLOP):
1. **NO GENERIC COLORS**: 뻔하고 전형적인 원색(예: 완전한 빨강 #FF0000, 기본 부트스트랩 파랑 #007BFF) 사용을 엄격히 금지한다. 채도가 낮고 세련된 색상(Slate, Zinc, Muted Earth Tones)이나, 완전히 대비가 강한 트렌디한 조화(oklch 기반의 Harmonious Palette)를 사용할 것.
2. **SHAPE & RADIUS LOGIC**: 'ui_tokens.border_radius'는 단순히 임의의 숫자를 넣지 마라. 도메인이 럭셔리/매거진이면 0px(Sharp), 친근/커뮤니티면 16px 이상(Rounded) 등 아키타입에 맞춰 극단적으로 차별화할 것.
3. **LESS IS MORE**: '디자인 DNA'를 설명할 때 불필요한 장식이나 아이콘을 남발하도록 추천하지 마라. 여백(Whitespace)과 타이포그래피만으로 아름다움을 만드는 미니멀리즘을 기본으로 삼을 것.

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

// 색 슬라이더(0~100) 값을 서술형 한국어로 변환한다.
function describeScale(value, buckets) {
  const v = Number.isFinite(value) ? value : 50;
  if (v <= 19) return buckets[0];
  if (v <= 39) return buckets[1];
  if (v <= 60) return buckets[2];
  if (v <= 80) return buckets[3];
  return buckets[4];
}

// 구조화 설문(survey)을 Gemini가 해석하기 쉬운 서술형 브리프로 재구성한다.
// 자유 텍스트 한 줄보다 컨텍스트가 명확해 톤 해석이 흔들리지 않는다.
function buildBrief(survey) {
  const {
    category = "",
    target_users = [],
    mood_keywords = [],
    color_temperature = 50,
    color_brightness = 50,
    color_saturation = 50,
    free_text = "",
  } = survey ?? {};

  const temperatureLabel = describeScale(color_temperature, [
    "매우 차가운",
    "약간 차가운",
    "중립적인",
    "약간 따뜻한",
    "따뜻한",
  ]);
  const brightnessLabel = describeScale(color_brightness, [
    "매우 어두운",
    "어두운 편",
    "중간 밝기",
    "밝은 편",
    "밝은",
  ]);
  const saturationLabel = describeScale(color_saturation, [
    "매우 탁한(저채도)",
    "탁한 편",
    "중간 채도",
    "선명한 편",
    "매우 선명한(고채도)",
  ]);

  const lines = [
    `[App Domain]: ${category || "미지정"}`,
    `[Target Users]: ${target_users.length ? target_users.join(", ") : "미지정"}`,
    `[Desired Mood]: ${mood_keywords.length ? mood_keywords.join(", ") : "미지정"}`,
    `[Color Direction]: ${temperatureLabel} 색온도 (${color_temperature}/100), ${brightnessLabel} (${color_brightness}/100), ${saturationLabel} 채도 (${color_saturation}/100)`,
  ];
  if (free_text.trim()) {
    lines.push(`[Additional Context]: "${free_text.trim()}"`);
  }
  return lines.join("\n");
}

// Phase 1 (Moodboard) 전용: 빠른 응답을 위해 외부 API 호출 없이 핵심 정보만 받는다.
// google_font_url / icon_set / font_weight_map 등 무거운 필드는 Phase 2(/api/enrich)에서 채운다.
function buildUserPrompt(survey) {
  return `
${buildBrief(survey)}

위 조건을 종합해, 이 앱에 어울리는 3가지 디자인 톤을 제안하라.
**먼저** 실제로 존재하는 유명 서비스 3개를 톤별로 1개씩 벤치마크하고, 그 서비스의 UI 토큰과 색상 면적 비율을 흉내 내라.
각 톤은 위 감성 키워드(Desired Mood)와 색 방향(Color Direction)을 출발점으로 삼되, [COLOR STRATEGY MATRIX]를 1:1로 강제 적용하여 **서로 완전히 다른 배색 구조**를 가져야 한다:
- Tone 1 [정석적 · Strategy A / Monochromatic]: 도메인의 기존 문법을 따르되, 입력 색 방향을 **Primary로 쨍하게 강조**하는 브랜드 컬러 중심 모노크로매틱 디자인. (벤치마크: 토스/당근마켓류)
- Tone 2 [미니멀 · Strategy B / Minimal-Tint]: 입력 색은 Background/Surface의 **은은한 틴트로만** 쓰고, Primary 포인트는 모노톤이나 다른 대비색으로 가져가는 에디토리얼 미니멀 디자인. (벤치마크: 노션/애플류)
- Tone 3 [파격적 · Strategy C / Complementary]: 입력 온도와 **반대되는 보색**을 적극 섞어 예상치 못한 대비를 만드는 트렌디한 디자인. (벤치마크: 색을 과감하게 쓰는 신생 서비스류)
반드시 3개의 톤이 각각 서로 완전히 다른 폰트(heading, body 모두)를 사용하도록 구성하라.

### CRITICAL RULE (위반 시 응답 무효):
3개의 톤은 서로 **Primary, Secondary 컬러의 HEX 값이 확연하게 달라야 하며**(육안으로 즉시 구분될 정도), 전체적인 배색 구조(Monochromatic vs Minimal-Tint vs Complementary) 자체가 톤마다 명백히 달라야 한다.
- 같은 색을 3톤의 Primary에 반복하거나, HEX가 미세하게만 다른 사실상 같은 색을 쓰는 것을 **엄격히 금지**한다.
- 각 톤의 colors 값을 정하기 전에 thinking_process에서 "이 톤은 Strategy A/B/C 중 무엇이며, 입력 색을 어디(Primary/Surface/보색)에 어떻게 배치할지"를 먼저 명시하라.

Response JSON Structure (Fill all values in KOREAN. Fonts MUST come from [AVAILABLE_KOREAN_FONTS]):
{
  "domain_analysis": "도메인의 본질과 시각적 전략에 대한 심층 분석 (In Korean)",
  "tones": [
    {
      "name": "예: 고대비 전환 강조형 (반드시 강조하는 요소를 이름에 명시할 것)",
      "thinking_process": "이 톤이 Strategy A(모노크로매틱)/B(미니멀 틴트)/C(보색) 중 무엇인지 먼저 선언하고, 입력된 색 방향을 Primary/Surface/보색 중 어디에 어떻게 배치할지, 다른 두 톤과 HEX가 확연히 달라지도록 어떤 배색 구조를 쓸지 1~2문장으로 고민할 것. 이 사고를 마친 뒤에야 colors/ui_tokens/typography 값을 결정한다. (In Korean)",
      "benchmark_origin": "이 톤이 벤치마크한 실제 서비스명 1개와, 그로부터 모방한 색상 면적 비율·UI 토큰(border_radius/shadow) 등 추출한 디자인 요소 (In Korean)",
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
        "contrast_level": "high"
      },
      "typography": {
        "heading_font": "예: Noto Sans KR (반드시 AVAILABLE_KOREAN_FONTS에서 선택)",
        "body_font": "예: Noto Sans KR (반드시 AVAILABLE_KOREAN_FONTS에서 선택)",
        "font_rationale": "선택한 heading/body 조합이 이 톤의 디자인 DNA와 어울리는 타이포그래피적 근거 (In Korean)"
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
}

// Phase 1: 외부 API(Iconify, Google Webfonts)는 건드리지 않고
// chroma-js 기반 컬러 스케일만 로컬에서 생성한다.
function normalizeTone(tone) {
  if (!tone || typeof tone !== "object") return tone;

  const color_scales = enrichPalette(tone.colors);

  // Phase 1에서도 카드가 추천 폰트로 렌더링되도록, heading/body 폰트만으로
  // 이 톤 전용 Google Fonts 로드 URL을 미리 생성해 둔다. (무거운 외부 호출 없음)
  const google_font_url = buildGoogleFontUrlForTones([tone]);

  return {
    ...tone,
    color_scales,
    typography: {
      ...tone.typography,
      google_font_url,
    },
    // 하위 호환: 기존 UI(ToneCard/AppPreview)가 참조하는 단순 폰트 페어링.
    font_pairing: {
      heading: tone?.typography?.heading_font ?? null,
      body: tone?.typography?.body_font ?? null,
    },
  };
}

export async function POST(req) {
  try {
    const body = await req.json();

    // 구조화 설문(survey)을 1차 입력으로 사용한다.
    // 하위 호환: 구버전 클라이언트가 보내는 appDescription 문자열은
    // free_text만 채운 survey로 변환해 동일 파이프라인을 태운다.
    const survey =
      body?.survey ??
      (body?.appDescription
        ? { category: "", target_users: [], mood_keywords: [], free_text: body.appDescription }
        : null);

    // 카테고리 또는 자유 텍스트 중 하나는 있어야 의미 있는 브리프가 된다.
    if (!survey || (!survey.category?.trim() && !survey.free_text?.trim())) {
      return Response.json(
        { error: "앱 카테고리를 선택해주세요." },
        { status: 400 },
      );
    }

    const curatedFonts = await fetchKoreanFonts();
    const fontCurationText = buildCurationForPrompt(
      curatedFonts.length > 0 ? curatedFonts : CURATED_KOREAN_FONTS,
    );
    const systemPrompt = buildSystemPrompt(fontCurationText);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              parts: [{ text: buildUserPrompt(survey) }],
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
