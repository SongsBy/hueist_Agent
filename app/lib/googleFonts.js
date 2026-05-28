// app/lib/googleFonts.js

const WEBFONTS_ENDPOINT = "https://www.googleapis.com/webfonts/v1/webfonts";

export const FALLBACK_FONT_STACK =
  "'Apple SD Gothic Neo', 'Malgun Gothic', 'Helvetica Neue', Arial, sans-serif";

// 한국어 디자인 환경에서 검증된 Top 20 Google Fonts.
// Pretendard는 Google Fonts 카탈로그에 없어 동등한 위상의 Gothic A1으로 대체.
export const CURATED_KOREAN_FONTS = [
  {
    family: "Noto Sans KR",
    category: "sans-serif",
    tags: ["clean", "universal", "reliable", "geometric"],
    personality:
      "범용성과 신뢰감의 표준. 가독성이 뛰어나 어떤 도메인에도 안전하게 적용.",
    weights: [100, 300, 400, 500, 700, 900],
    recommended_weights: { heading: 700, body: 400, emphasis: 500 },
    best_for: ["금융", "SaaS", "기업", "공공", "테크"],
  },
  {
    family: "Gothic A1",
    category: "sans-serif",
    tags: ["modern", "clean", "geometric", "versatile"],
    personality:
      "Pretendard 계열의 모던 지오메트릭 산세리프. 세련된 프로덕트 UI에 최적.",
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    recommended_weights: { heading: 700, body: 400, emphasis: 600 },
    best_for: ["SaaS", "테크", "스타트업", "프로덕티비티"],
  },
  {
    family: "IBM Plex Sans KR",
    category: "sans-serif",
    tags: ["technical", "editorial", "corporate", "modern"],
    personality:
      "테크니컬한 정교함과 에디토리얼 감성을 동시에 가진 듀얼 톤 산세리프.",
    weights: [100, 200, 300, 400, 500, 600, 700],
    recommended_weights: { heading: 600, body: 400, emphasis: 500 },
    best_for: ["테크", "데이터", "에디토리얼", "B2B"],
  },
  {
    family: "Nanum Gothic",
    category: "sans-serif",
    tags: ["classic", "neutral", "stable"],
    personality:
      "한국에서 가장 익숙한 본문 산세리프. 무난함과 신뢰감이 강점.",
    weights: [400, 700, 800],
    recommended_weights: { heading: 700, body: 400, emphasis: 700 },
    best_for: ["공공", "교육", "뉴스", "일반"],
  },
  {
    family: "Gowun Dodum",
    category: "sans-serif",
    tags: ["friendly", "soft", "approachable", "humanist"],
    personality: "둥글고 부드러운 휴머니스트 산세리프. 친근하고 따뜻한 톤.",
    weights: [400],
    recommended_weights: { heading: 400, body: 400, emphasis: 400 },
    best_for: ["라이프스타일", "커뮤니티", "교육", "F&B"],
  },
  {
    family: "Sunflower",
    category: "sans-serif",
    tags: ["light", "minimal", "modern", "refined"],
    personality: "얇고 모던한 산세리프. 미니멀하고 세련된 분위기 연출.",
    weights: [300, 500, 700],
    recommended_weights: { heading: 500, body: 300, emphasis: 500 },
    best_for: ["패션", "라이프스타일", "뷰티", "갤러리"],
  },
  {
    family: "Noto Serif KR",
    category: "serif",
    tags: ["editorial", "classic", "trustworthy", "refined"],
    personality:
      "에디토리얼 세리프의 표준. 권위와 신뢰의 무게감을 전달.",
    weights: [200, 300, 400, 500, 600, 700, 900],
    recommended_weights: { heading: 700, body: 400, emphasis: 600 },
    best_for: ["에디토리얼", "출판", "법률", "금융", "럭셔리"],
  },
  {
    family: "Nanum Myeongjo",
    category: "serif",
    tags: ["traditional", "literary", "refined"],
    personality: "전통 명조의 정통성. 문학적·고전적인 무드 표현.",
    weights: [400, 700, 800],
    recommended_weights: { heading: 700, body: 400, emphasis: 700 },
    best_for: ["출판", "문학", "전통", "박물관"],
  },
  {
    family: "Gowun Batang",
    category: "serif",
    tags: ["elegant", "emotional", "editorial", "lifestyle"],
    personality: "정제된 곡선의 우아한 바탕체. 감성적 라이프스타일에 최적.",
    weights: [400, 700],
    recommended_weights: { heading: 700, body: 400, emphasis: 700 },
    best_for: ["라이프스타일", "매거진", "웨딩", "뷰티"],
  },
  {
    family: "Song Myung",
    category: "serif",
    tags: ["classical", "magazine", "authoritative"],
    personality: "매거진형 클래식 세리프. 격조있고 묵직한 인상.",
    weights: [400],
    recommended_weights: { heading: 400, body: 400, emphasis: 400 },
    best_for: ["매거진", "에디토리얼", "갤러리"],
  },
  {
    family: "Hahmlet",
    category: "serif",
    tags: ["modern", "geometric-serif", "editorial", "contemporary"],
    personality:
      "지오메트릭한 모던 세리프. 컨템포러리 에디토리얼·아트 디렉팅에 강함.",
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    recommended_weights: { heading: 700, body: 400, emphasis: 600 },
    best_for: ["에디토리얼", "아트", "패션", "디자인"],
  },
  {
    family: "Diphylleia",
    category: "serif",
    tags: ["contemporary", "delicate", "elegant", "fashion"],
    personality: "투명하고 섬세한 컨템포러리 세리프. 하이엔드 패션 무드.",
    weights: [400],
    recommended_weights: { heading: 400, body: 400, emphasis: 400 },
    best_for: ["패션", "럭셔리", "뷰티", "갤러리"],
  },
  {
    family: "Black Han Sans",
    category: "sans-serif",
    tags: ["bold", "display", "impact", "headline"],
    personality:
      "임팩트 강한 디스플레이 산세리프. 헤드라인 강조에 압도적.",
    weights: [400],
    recommended_weights: { heading: 400, body: 400, emphasis: 400 },
    best_for: ["엔터테인먼트", "스포츠", "캠페인", "리테일"],
  },
  {
    family: "Do Hyeon",
    category: "sans-serif",
    tags: ["strong", "friendly", "display", "casual"],
    personality:
      "강한 무게감에 친근한 라운드. 캐주얼 디스플레이로 안정적.",
    weights: [400],
    recommended_weights: { heading: 400, body: 400, emphasis: 400 },
    best_for: ["F&B", "리테일", "엔터테인먼트", "이커머스"],
  },
  {
    family: "Jua",
    category: "display",
    tags: ["playful", "friendly", "casual", "round"],
    personality: "둥글둥글한 친근함. 캐주얼·키즈·F&B에 잘 어울림.",
    weights: [400],
    recommended_weights: { heading: 400, body: 400, emphasis: 400 },
    best_for: ["키즈", "F&B", "캠페인", "커뮤니티"],
  },
  {
    family: "Gugi",
    category: "display",
    tags: ["calligraphic", "traditional", "bold"],
    personality: "붓글씨 기반의 전통 디스플레이. 한국적·전통적 무드.",
    weights: [400],
    recommended_weights: { heading: 400, body: 400, emphasis: 400 },
    best_for: ["전통", "F&B", "관광", "공예"],
  },
  {
    family: "Stylish",
    category: "sans-serif",
    tags: ["trendy", "modern", "slim", "fashionable"],
    personality: "얇고 세련된 트렌디 산세리프. 패션·뷰티 헤드라인에 적합.",
    weights: [400],
    recommended_weights: { heading: 400, body: 400, emphasis: 400 },
    best_for: ["패션", "뷰티", "라이프스타일"],
  },
  {
    family: "Nanum Pen Script",
    category: "handwriting",
    tags: ["personal", "casual", "notes"],
    personality: "펜글씨 느낌의 캐주얼 손글씨. 친근한 메모 톤.",
    weights: [400],
    recommended_weights: { heading: 400, body: 400, emphasis: 400 },
    best_for: ["커뮤니티", "일기", "교육", "캠페인"],
  },
  {
    family: "Nanum Brush Script",
    category: "handwriting",
    tags: ["bold", "energetic", "artistic"],
    personality: "굵은 붓 손글씨. 에너제틱하고 표현적인 액센트용.",
    weights: [400],
    recommended_weights: { heading: 400, body: 400, emphasis: 400 },
    best_for: ["캠페인", "이벤트", "아트", "F&B"],
  },
  {
    family: "Gaegu",
    category: "handwriting",
    tags: ["cute", "playful", "childlike", "casual"],
    personality: "어린이 손글씨 느낌의 귀여운 손글씨. 캐주얼·키즈 친화.",
    weights: [300, 400, 700],
    recommended_weights: { heading: 700, body: 400, emphasis: 700 },
    best_for: ["키즈", "교육", "캠페인", "라이프스타일"],
  },
];

function normalizeCategory(category) {
  return typeof category === "string" ? category.trim().toLowerCase() : "";
}

function familyKey(family) {
  return typeof family === "string" ? family.trim().toLowerCase() : "";
}

export function findCuratedFont(family) {
  const key = familyKey(family);
  if (!key) return null;
  return CURATED_KOREAN_FONTS.find((f) => f.family.toLowerCase() === key) ?? null;
}

export function filterFontsByCategory(fonts, category) {
  if (!Array.isArray(fonts)) return [];
  const target = normalizeCategory(category);
  if (!target) return [];
  return fonts.filter((font) => font.category === target);
}

export function filterFontsByTag(fonts, tag) {
  if (!Array.isArray(fonts) || typeof tag !== "string") return [];
  const target = tag.trim().toLowerCase();
  if (!target) return [];
  return fonts.filter(
    (font) => Array.isArray(font.tags) && font.tags.includes(target),
  );
}

export function buildGoogleFontUrl(families) {
  const list = Array.isArray(families) ? families : [families];
  const params = list
    .filter((f) => f && typeof f.family === "string")
    .map(({ family, weights }) => {
      const familyParam = family.trim().replace(/\s+/g, "+");
      const uniqueWeights = Array.from(
        new Set((weights && weights.length ? weights : [400]).map(Number)),
      )
        .filter((w) => Number.isFinite(w))
        .sort((a, b) => a - b);
      return `family=${familyParam}:wght@${uniqueWeights.join(";")}`;
    });
  if (params.length === 0) return null;
  return `https://fonts.googleapis.com/css2?${params.join("&")}&display=swap`;
}

// 톤 배열에서 사용 중인 (family → weights) 조합을 모아 하나의 Google Fonts URL로 묶는다.
// 추천 화면처럼 여러 톤을 동시에 렌더링할 때 단일 <link>로 일괄 로드하기 위함.
export function buildGoogleFontUrlForTones(tones) {
  if (!Array.isArray(tones)) return null;

  const familyWeights = new Map();

  const addWeight = (family, weight) => {
    if (!family) return;
    const num = Number(weight);
    if (!Number.isFinite(num)) return;
    const set = familyWeights.get(family) ?? new Set();
    set.add(num);
    familyWeights.set(family, set);
  };

  for (const tone of tones) {
    const t = tone?.typography;
    if (!t) continue;
    const heading = findCuratedFont(t.heading_font);
    const body = findCuratedFont(t.body_font);
    const wm = t.font_weight_map ?? {};
    if (heading) {
      addWeight(heading.family, wm.heading);
      addWeight(heading.family, wm.emphasis);
    }
    if (body) {
      addWeight(body.family, wm.body);
      addWeight(body.family, wm.emphasis);
    }
  }

  if (familyWeights.size === 0) return null;

  const families = Array.from(familyWeights.entries()).map(
    ([family, weights]) => ({ family, weights: Array.from(weights) }),
  );

  return buildGoogleFontUrl(families);
}

// LLM 시스템 프롬프트에 주입할 큐레이션 요약 텍스트
export function buildCurationForPrompt(fonts = CURATED_KOREAN_FONTS) {
  return fonts
    .map(
      (f) =>
        `- ${f.family} (${f.category}) | 태그: ${f.tags.join("/")} | 굵기: ${f.weights.join(",")} | 적합 도메인: ${f.best_for.join(", ")} | 성격: ${f.personality}`,
    )
    .join("\n");
}

// Live API로 큐레이션을 검증/보강. 키 없음/실패 시 큐레이션 그대로 fallback.
// Next.js fetch 캐시로 24h ISR 처리.
export async function fetchKoreanFonts({ revalidate = 60 * 60 * 24 } = {}) {
  const apiKey = process.env.GOOGLE_FONTS_API_KEY;

  if (!apiKey) {
    console.warn(
      "[googleFonts] GOOGLE_FONTS_API_KEY 미설정 — 큐레이션 목록만 반환합니다.",
    );
    return CURATED_KOREAN_FONTS.map((f) => ({ ...f, lastModified: null }));
  }

  const url = new URL(WEBFONTS_ENDPOINT);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("subset", "korean");
  url.searchParams.set("sort", "popularity");

  try {
    const response = await fetch(url.toString(), { next: { revalidate } });

    if (!response.ok) {
      console.warn(
        `[googleFonts] Webfonts API 호출 실패 (status: ${response.status}) — 큐레이션 fallback.`,
      );
      return CURATED_KOREAN_FONTS.map((f) => ({ ...f, lastModified: null }));
    }

    const data = await response.json();
    const liveMap = new Map(
      (Array.isArray(data?.items) ? data.items : []).map((it) => [
        it.family,
        it,
      ]),
    );

    return CURATED_KOREAN_FONTS.map((curated) => {
      const live = liveMap.get(curated.family);
      return {
        ...curated,
        lastModified: live?.lastModified ?? null,
      };
    });
  } catch (error) {
    console.warn(
      "[googleFonts] Webfonts API 호출 예외 — 큐레이션 fallback:",
      error,
    );
    return CURATED_KOREAN_FONTS.map((f) => ({ ...f, lastModified: null }));
  }
}
