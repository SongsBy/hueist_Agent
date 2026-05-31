const CORE_ICON_KEYS = [
  "home",
  "search",
  "settings",
  "user",
  "plus",
  "arrow-left",
  "check",
];

// Per-collection name overrides. Iconify uses different canonical names across sets.
const COLLECTION_ICON_MAP = {
  lucide: {
    home: "house",
    search: "search",
    settings: "settings",
    user: "user",
    plus: "plus",
    "arrow-left": "arrow-left",
    check: "check",
  },
  tabler: {
    home: "home",
    search: "search",
    settings: "settings",
    user: "user",
    plus: "plus",
    "arrow-left": "arrow-left",
    check: "check",
  },
  heroicons: {
    home: "home-solid",
    search: "magnifying-glass-solid",
    settings: "cog-6-tooth-solid",
    user: "user-solid",
    plus: "plus-solid",
    "arrow-left": "arrow-left-solid",
    check: "check-solid",
  },
  "material-symbols": {
    home: "home-rounded",
    search: "search-rounded",
    settings: "settings-rounded",
    user: "person-rounded",
    plus: "add-rounded",
    "arrow-left": "arrow-back-rounded",
    check: "check-rounded",
  },
};

const COLLECTION_RULES = [
  {
    collection: "heroicons",
    // bold / filled / solid 계열
    keywords: [
      "bold",
      "solid",
      "filled",
      "fill",
      "볼드",
      "솔리드",
      "채움",
      "채워진",
      "묵직",
      "굵은",
    ],
  },
  {
    collection: "material-symbols",
    // rounded / humanist / friendly 계열
    keywords: [
      "rounded",
      "round",
      "humanist",
      "friendly",
      "soft",
      "라운드",
      "둥근",
      "부드러",
      "친근",
      "휴머니스트",
    ],
  },
  {
    collection: "tabler",
    // outline / stroke 계열
    keywords: [
      "outline",
      "outlined",
      "stroke",
      "line",
      "linear",
      "thin",
      "아웃라인",
      "외곽선",
      "라인",
      "선형",
      "얇은",
    ],
  },
  {
    collection: "lucide",
    // minimal / clean / geometric 계열 (기본값)
    keywords: [
      "minimal",
      "minimalist",
      "clean",
      "geometric",
      "simple",
      "modern",
      "미니멀",
      "심플",
      "단순",
      "정제",
      "기하",
      "모던",
    ],
  },
];

const DEFAULT_COLLECTION = "lucide";

const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`;

function pickCollection(styleDescription) {
  if (typeof styleDescription !== "string" || styleDescription.length === 0) {
    return DEFAULT_COLLECTION;
  }
  const text = styleDescription.toLowerCase();
  for (const rule of COLLECTION_RULES) {
    if (rule.keywords.some((kw) => text.includes(kw.toLowerCase()))) {
      return rule.collection;
    }
  }
  return DEFAULT_COLLECTION;
}

function buildFallbackIconSet(collection) {
  return {
    collection,
    icons: CORE_ICON_KEYS.map((name) => ({ name, svg: FALLBACK_SVG })),
  };
}

async function fetchOneIcon(collection, key) {
  const iconName = COLLECTION_ICON_MAP[collection]?.[key] ?? key;
  const url = `https://api.iconify.design/${collection}/${iconName}.svg`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      return { name: key, svg: FALLBACK_SVG };
    }
    const svg = await res.text();
    // Iconify가 알 수 없는 아이콘에 대해 200 + 빈 SVG를 주는 경우 방어.
    if (!svg.includes("<svg")) {
      return { name: key, svg: FALLBACK_SVG };
    }
    return { name: key, svg };
  } catch {
    return { name: key, svg: FALLBACK_SVG };
  }
}

export async function fetchIconsByStyle(styleDescription) {
  const collection = pickCollection(styleDescription);
  try {
    const icons = await Promise.all(
      CORE_ICON_KEYS.map((key) => fetchOneIcon(collection, key)),
    );
    return { collection, icons };
  } catch (error) {
    console.error("Iconify fetch failed:", error);
    return buildFallbackIconSet(collection);
  }
}
