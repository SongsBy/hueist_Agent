// app/components/templates/registry.js
// 사전 정의된 모바일 베이스 레이아웃 템플릿 레지스트리.
// 홈의 템플릿 갤러리(TemplateGallery)와 /templates 미리보기 페이지가 함께 참조한다.
// id 는 useToneStore.selectedTemplateId 로 저장되어 UI 생성 시 베이스 레이아웃으로 쓰인다.

import FeedTemplate from "./FeedTemplate";
import DashboardTemplate from "./DashboardTemplate";
import TravelHomeTemplate from "./TravelHomeTemplate";
import MediaHomeTemplate from "./MediaHomeTemplate";
import CommerceHomeTemplate from "./CommerceHomeTemplate";
import DeliveryHomeTemplate from "./DeliveryHomeTemplate";
import EditorialHomeTemplate from "./EditorialHomeTemplate";
import ProductivityHomeTemplate from "./ProductivityHomeTemplate";
import FitnessHomeTemplate from "./FitnessHomeTemplate";
import MobilityHomeTemplate from "./MobilityHomeTemplate";
import MessengerHomeTemplate from "./MessengerHomeTemplate";
import AudioPlayerHomeTemplate from "./AudioPlayerHomeTemplate";
import SmartHomeTemplate from "./SmartHomeTemplate";
import EduTechHomeTemplate from "./EduTechHomeTemplate";

export const TEMPLATES = [
  {
    id: "feed",
    name: "소셜 피드",
    tagline: "Instagram · Twitter 스타일",
    desc: "상단 앱바 · 카드형 피드 · 하단 GNB",
    Component: FeedTemplate,
  },
  {
    id: "dashboard",
    name: "금융 대시보드",
    tagline: "Toss · Banking 스타일",
    desc: "총자산 카드 · 퀵 메뉴 · 거래 내역",
    Component: DashboardTemplate,
  },
  {
    id: "travel",
    name: "여행 홈",
    tagline: "Airbnb · Booking 스타일",
    desc: "검색바 · 카테고리 칩 · 대형 숙소 카드",
    Component: TravelHomeTemplate,
  },
  {
    id: "media",
    name: "스트리밍 홈",
    tagline: "Netflix 스타일",
    desc: "다크 UI · 히어로 포스터 · 장르별 가로 슬라이드",
    Component: MediaHomeTemplate,
  },
  {
    id: "commerce",
    name: "커머스 홈",
    tagline: "Musinsa · Amazon 스타일",
    desc: "배너 캐러셀 · 상품 그리드 · 하단 GNB",
    Component: CommerceHomeTemplate,
  },
  {
    id: "delivery",
    name: "배달·슈퍼앱 홈",
    tagline: "배달의민족 · Uber Eats 스타일",
    desc: "상단 배너 · 카테고리 아이콘 그리드 · 가게 리스트",
    Component: DeliveryHomeTemplate,
  },
  {
    id: "editorial",
    name: "에디토리얼 홈",
    tagline: "Medium · 브런치 스타일",
    desc: "세리프 타이포 · 여백 · 비대칭 아티클 리스트",
    Component: EditorialHomeTemplate,
  },
  {
    id: "productivity",
    name: "할 일 관리 홈",
    tagline: "Todoist · Notion 스타일",
    desc: "캘린더 스트립 · 진행률 바 · 체크박스 리스트",
    Component: ProductivityHomeTemplate,
  },
  {
    id: "fitness",
    name: "헬스케어 홈",
    tagline: "Apple Fitness · Strava 스타일",
    desc: "다크 UI · 액티비티 링 · 데이터 타일 위젯",
    Component: FitnessHomeTemplate,
  },
  {
    id: "mobility",
    name: "모빌리티 홈",
    tagline: "Uber · 카카오T 스타일",
    desc: "전체 지도 배경 · 플로팅 바텀시트 · 목적지 검색",
    Component: MobilityHomeTemplate,
  },
  {
    id: "messenger",
    name: "메신저 홈",
    tagline: "WhatsApp · KakaoTalk 스타일",
    desc: "스토리 · 대화 리스트 · 안읽음 뱃지 · 타임스탬프",
    Component: MessengerHomeTemplate,
  },
  {
    id: "audio",
    name: "뮤직 플레이어",
    tagline: "Spotify · Apple Music 스타일",
    desc: "대형 앨범 아트 · 진행 스크러버 · 재생 컨트롤",
    Component: AudioPlayerHomeTemplate,
  },
  {
    id: "smarthome",
    name: "스마트홈 홈",
    tagline: "Apple Home 스타일",
    desc: "다크 UI · 토글 타일 그리드 · 씬 · 활성 상태 표시",
    Component: SmartHomeTemplate,
  },
  {
    id: "edutech",
    name: "학습 홈",
    tagline: "Duolingo 스타일",
    desc: "지그재그 레벨 경로 · 스트릭/하트 · 게이미피케이션",
    Component: EduTechHomeTemplate,
  },
];

export function getTemplateById(id) {
  return TEMPLATES.find((t) => t.id === id) ?? null;
}
