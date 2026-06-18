"use client";

import React from "react";
import {
  Search,
  MapPin,
  ChevronDown,
  Bell,
  UtensilsCrossed,
  Pizza,
  Coffee,
  ShoppingCart,
  Soup,
  IceCream,
  Beer,
  Salad,
  Gift,
  Stethoscope,
  Star,
  Clock,
  Home,
  Receipt,
  Heart,
  User,
} from "lucide-react";

const CATEGORIES = [
  { id: 1, label: "음식점", icon: UtensilsCrossed, color: "bg-orange-50 text-orange-500" },
  { id: 2, label: "피자", icon: Pizza, color: "bg-red-50 text-red-500" },
  { id: 3, label: "카페·디저트", icon: Coffee, color: "bg-amber-50 text-amber-600" },
  { id: 4, label: "마트", icon: ShoppingCart, color: "bg-emerald-50 text-emerald-600" },
  { id: 5, label: "한식", icon: Soup, color: "bg-rose-50 text-rose-500" },
  { id: 6, label: "아이스크림", icon: IceCream, color: "bg-sky-50 text-sky-500" },
  { id: 7, label: "야식·주류", icon: Beer, color: "bg-yellow-50 text-yellow-600" },
  { id: 8, label: "샐러드", icon: Salad, color: "bg-lime-50 text-lime-600" },
  { id: 9, label: "선물하기", icon: Gift, color: "bg-violet-50 text-violet-500" },
  { id: 10, label: "약국", icon: Stethoscope, color: "bg-teal-50 text-teal-600" },
];

const STORES = [
  {
    id: 1,
    name: "동네 손칼국수",
    tags: "한식 · 칼국수",
    rating: "4.9",
    reviews: "2,431",
    time: "15-25분",
    fee: "무료배달",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80",
    badge: "치타배달",
  },
  {
    id: 2,
    name: "버거 인 더 타운",
    tags: "양식 · 수제버거",
    rating: "4.7",
    reviews: "1,108",
    time: "20-30분",
    fee: "3,000원",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
    badge: null,
  },
  {
    id: 3,
    name: "스윗 모먼트 베이커리",
    tags: "디저트 · 케이크",
    rating: "4.8",
    reviews: "874",
    time: "25-35분",
    fee: "무료배달",
    image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400&q=80",
    badge: "쿠폰",
  },
];

export default function DeliveryHomeTemplate() {
  return (
    <div className="w-full max-w-[400px] mx-auto h-[800px] bg-gray-50 relative overflow-hidden shadow-2xl">
      {/* Top App Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-white">
        <div className="px-5 pt-12 pb-3 flex items-center justify-between">
          <button className="flex items-center gap-1">
            <MapPin className="w-5 h-5 text-orange-500" strokeWidth={2.2} />
            <span className="text-base font-bold text-gray-900">우리집</span>
            <ChevronDown className="w-4 h-4 text-gray-500" strokeWidth={2.2} />
          </button>
          <button className="relative">
            <Bell className="w-6 h-6 text-gray-800" strokeWidth={2} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full" />
          </button>
        </div>
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 h-11 px-4 rounded-2xl bg-gray-100">
            <Search className="w-5 h-5 text-gray-400" strokeWidth={2} />
            <span className="text-sm text-gray-400">치킨, 떡볶이가 먹고 싶을 땐?</span>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="absolute top-[148px] bottom-16 left-0 right-0 overflow-y-auto">
        {/* Hero Banner */}
        <section className="px-5 pt-3">
          <div className="relative h-36 rounded-3xl overflow-hidden bg-gradient-to-br from-orange-500 to-rose-500">
            <div className="absolute inset-0 p-5 flex flex-col justify-center">
              <span className="w-fit px-2.5 py-1 rounded-full bg-white/25 backdrop-blur text-[10px] font-bold text-white tracking-wide">
                첫 주문 한정
              </span>
              <h2 className="mt-2 text-2xl font-extrabold text-white leading-tight">
                지금 주문하면
                <br />
                배달비 0원
              </h2>
            </div>
            <div className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full bg-white/15" />
            <div className="absolute bottom-3.5 left-5 flex gap-1.5">
              <span className="w-5 h-1.5 rounded-full bg-white" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
            </div>
          </div>
        </section>

        {/* Category Icon Grid */}
        <section className="px-5 pt-5">
          <div className="grid grid-cols-5 gap-y-4 gap-x-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button key={cat.id} className="flex flex-col items-center gap-1.5">
                  <span className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cat.color}`}>
                    <Icon className="w-6 h-6" strokeWidth={2} />
                  </span>
                  <span className="text-[11px] font-medium text-gray-700 text-center leading-tight">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Store List */}
        <section className="px-5 pt-6 pb-6">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-lg font-bold text-gray-900">지금 인기 있는 가게</h3>
            <button className="text-sm font-medium text-orange-500">전체보기</button>
          </div>

          <div className="space-y-4">
            {STORES.map((store) => (
              <article key={store.id} className="flex gap-3.5">
                <div className="relative shrink-0">
                  <img
                    src={store.image}
                    alt={store.name}
                    className="w-24 h-24 rounded-2xl object-cover bg-gray-100"
                  />
                  {store.badge && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-orange-500 text-[9px] font-bold text-white">
                      {store.badge}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-base font-bold text-gray-900 truncate">{store.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{store.tags}</p>
                  <div className="mt-1.5 flex items-center gap-1 text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-gray-900">{store.rating}</span>
                    <span className="text-gray-400">({store.reviews})</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {store.time}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="font-medium text-emerald-600">{store.fee}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom GNB */}
      <nav className="absolute bottom-0 left-0 right-0 z-20 h-16 px-7 flex items-center justify-between bg-white border-t border-gray-100">
        <button className="flex flex-col items-center gap-1">
          <Home className="w-6 h-6 text-orange-500" strokeWidth={2} />
          <span className="text-[10px] font-medium text-orange-500">홈</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Search className="w-6 h-6 text-gray-400" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-400">검색</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Heart className="w-6 h-6 text-gray-400" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-400">찜</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Receipt className="w-6 h-6 text-gray-400" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-400">주문내역</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <User className="w-6 h-6 text-gray-400" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-400">마이</span>
        </button>
      </nav>
    </div>
  );
}
