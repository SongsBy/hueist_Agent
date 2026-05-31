import { enrichTypography } from "@/app/lib/googleFonts";
import { fetchIconsByStyle } from "@/app/lib/iconUtils";
import { enrichPalette } from "@/app/lib/colorUtils";

async function fetchPexelsImages(tone) {
  const keywords = Array.isArray(tone?.mood) && tone.mood.length > 0 
    ? tone.mood.slice(0, 2) 
    : ["design", "minimal"];
    
  // Pexels는 한국어 쿼리를 지원합니다 (locale=ko-KR)
  const query = encodeURIComponent(keywords.join(" "));
  
  try {
    const res = await fetch(`https://api.pexels.com/v1/search?query=${query}&locale=ko-KR&per_page=3`, {
      headers: {
        Authorization: process.env.PEXELS_API_KEY,
      },
      // 같은 무드 키워드에 대해서는 24시간 동안 결과를 캐싱합니다.
      next: { revalidate: 86400 }
    });
    
    if (!res.ok) {
      console.warn("Pexels API 응답 오류:", res.status);
      return { provider: "pexels", keywords, images: [] };
    }
    
    const data = await res.json();
    const images = (data.photos || []).map(photo => ({
      id: photo.id,
      url: photo.src.large, // 화면에 보여줄 적절한 크기
      thumbnail: photo.src.medium,
      author: photo.photographer,
      author_url: photo.photographer_url,
      avg_color: photo.avg_color,
      alt: photo.alt
    }));
    
    return {
      provider: "pexels",
      keywords,
      images,
    };
  } catch (error) {
    console.error("Pexels 연동 중 오류 발생:", error);
    return { provider: "pexels", keywords, images: [] };
  }
}

// Phase 2 (Deep Dive): 사용자가 선택한 단일 톤을 받아 무거운 외부 데이터를 병렬로 보강.
// 출력은 Figma handoff까지 가능한 "Master JSON" 형태.
export async function POST(req) {
  try {
    const body = await req.json();
    const tone = body?.tone ?? body;

    if (!tone || typeof tone !== "object" || !tone.typography) {
      return Response.json(
        { error: "유효한 톤 데이터가 필요합니다." },
        { status: 400 },
      );
    }

    const iconographyDescription = tone?.design_dna_details?.iconography ?? "";

    const [typography, icon_set, mood_images] = await Promise.all([
      // enrichTypography 자체는 동기 함수지만 Promise.all 인터페이스 통일을 위해 감싼다.
      Promise.resolve().then(() => enrichTypography(tone.typography)),
      fetchIconsByStyle(iconographyDescription),
      fetchPexelsImages(tone),
    ]);

    // Phase 1에서 이미 color_scales가 들어왔다면 그대로 사용, 누락 시에만 재계산.
    const color_scales =
      tone.color_scales && Object.keys(tone.color_scales).length > 0
        ? tone.color_scales
        : enrichPalette(tone.colors);

    return Response.json({
      ...tone,
      typography,
      color_scales,
      icon_set,
      mood_images,
      font_pairing: {
        heading: typography.heading_font,
        body: typography.body_font,
      },
    });
  } catch (error) {
    console.error("Enrich API 오류:", error);
    return Response.json(
      { error: "디자인 자산 보강에 실패했어요. 다시 시도해주세요." },
      { status: 500 },
    );
  }
}
