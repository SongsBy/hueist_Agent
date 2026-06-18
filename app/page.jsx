// app/page.jsx
// 홈: imweb 템플릿 페이지 무드의 라이트 톤 레퍼런스 쇼케이스.
// 상단 히어로 + 칩 탭(홈화면/상세페이지) + HUEIST가 만든 어플리케이션 레퍼런스 그리드.
import HomeHeader from "./components/home/HomeHeader";
import ReferenceGallery from "./components/home/ReferenceGallery";

export default function HomePage() {
  return (
    <main className="flex-1 bg-white">
      <HomeHeader />
      <ReferenceGallery />
    </main>
  );
}
