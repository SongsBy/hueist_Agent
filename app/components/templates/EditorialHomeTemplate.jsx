"use client";

import React from "react";
import {
  Search,
  Bookmark,
  Home,
  Compass,
  Bell,
  User,
} from "lucide-react";

const FEATURED = {
  category: "에세이",
  title: "느리게 걷는 도시의 아침",
  excerpt:
    "익숙한 골목을 천천히 다시 걸으며 발견한, 매일을 조금 더 다정하게 만드는 작은 습관들에 대하여.",
  author: "윤지수",
  date: "6월 18일",
  readTime: "7분",
  image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80",
};

const ARTICLES = [
  {
    id: 1,
    category: "기술",
    title: "좋은 인터페이스는 사라진다",
    excerpt: "사용자가 도구의 존재를 잊을 때 비로소 완성되는 디자인의 역설.",
    author: "이도현",
    readTime: "5분",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=300&q=80",
  },
  {
    id: 2,
    category: "문화",
    title: "활자의 무게",
    excerpt: "종이 위에 눌러 담긴 시간과, 화면 속 텍스트가 잃어버린 것에 관하여.",
    author: "한서영",
    readTime: "9분",
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=300&q=80",
  },
  {
    id: 3,
    category: "여행",
    title: "북쪽 끝의 작은 서점",
    excerpt: "지도에도 없는 마을에서 만난, 책으로 가득 찬 한 사람의 우주.",
    author: "정민우",
    readTime: "6분",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=300&q=80",
  },
];

export default function EditorialHomeTemplate() {
  return (
    <div className="w-full max-w-[400px] mx-auto h-[800px] bg-[#fdfcf9] relative overflow-hidden shadow-2xl font-serif">
      {/* Top App Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-[#fdfcf9]/90 backdrop-blur-md border-b border-stone-200">
        <div className="px-6 pt-12 pb-3 flex items-center justify-between">
          <h1 className="text-2xl tracking-tight text-stone-900" style={{ fontWeight: 700 }}>
            Essai
          </h1>
          <div className="flex items-center gap-4">
            <Search className="w-5 h-5 text-stone-700" strokeWidth={1.8} />
            <Bookmark className="w-5 h-5 text-stone-700" strokeWidth={1.8} />
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="absolute top-[84px] bottom-16 left-0 right-0 overflow-y-auto">
        {/* Section label */}
        <div className="px-6 pt-6">
          <p className="text-[11px] uppercase tracking-[0.25em] text-stone-400 font-sans font-semibold">
            오늘의 읽을거리
          </p>
        </div>

        {/* Featured Article */}
        <article className="px-6 pt-4">
          <div className="aspect-[4/3] w-full rounded-sm overflow-hidden">
            <img
              src={FEATURED.image}
              alt={FEATURED.title}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-amber-700 font-sans font-semibold">
            {FEATURED.category}
          </p>
          <h2 className="mt-2 text-[26px] leading-snug text-stone-900" style={{ fontWeight: 700 }}>
            {FEATURED.title}
          </h2>
          <p className="mt-2.5 text-[15px] leading-relaxed text-stone-600">
            {FEATURED.excerpt}
          </p>
          <div className="mt-3.5 flex items-center gap-2 text-xs text-stone-400 font-sans">
            <span className="font-medium text-stone-600">{FEATURED.author}</span>
            <span>·</span>
            <span>{FEATURED.date}</span>
            <span>·</span>
            <span>{FEATURED.readTime} 읽기</span>
          </div>
        </article>

        {/* Divider */}
        <div className="mx-6 my-6 border-t border-stone-200" />

        {/* Article List */}
        <section className="px-6 pb-8">
          <div className="space-y-6">
            {ARTICLES.map((article) => (
              <article key={article.id} className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-amber-700 font-sans font-semibold">
                    {article.category}
                  </p>
                  <h3 className="mt-1.5 text-lg leading-snug text-stone-900" style={{ fontWeight: 700 }}>
                    {article.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-stone-500 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="mt-2.5 flex items-center gap-2 text-[11px] text-stone-400 font-sans">
                    <span className="font-medium text-stone-600">{article.author}</span>
                    <span>·</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
                <div className="w-24 h-24 shrink-0 rounded-sm overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom GNB */}
      <nav className="absolute bottom-0 left-0 right-0 z-20 h-16 px-9 flex items-center justify-between bg-[#fdfcf9]/90 backdrop-blur-md border-t border-stone-200 font-sans">
        <Home className="w-6 h-6 text-stone-900" strokeWidth={1.8} />
        <Compass className="w-6 h-6 text-stone-400" strokeWidth={1.8} />
        <Bookmark className="w-6 h-6 text-stone-400" strokeWidth={1.8} />
        <Bell className="w-6 h-6 text-stone-400" strokeWidth={1.8} />
        <User className="w-6 h-6 text-stone-400" strokeWidth={1.8} />
      </nav>
    </div>
  );
}
