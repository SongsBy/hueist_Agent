"use client";

import React from "react";
import {
  Menu,
  Search,
  Navigation,
  MapPin,
  Home,
  Briefcase,
  Star,
  Car,
  ChevronRight,
} from "lucide-react";

const SAVED_PLACES = [
  { id: 1, label: "집", sub: "서울 마포구 연남동", icon: Home, color: "bg-indigo-50 text-indigo-600" },
  { id: 2, label: "회사", sub: "서울 강남구 테헤란로 152", icon: Briefcase, color: "bg-amber-50 text-amber-600" },
  { id: 3, label: "단골 카페", sub: "서울 용산구 이태원로 200", icon: Star, color: "bg-rose-50 text-rose-600" },
];

export default function MobilityHomeTemplate() {
  return (
    <div className="w-full max-w-[400px] mx-auto h-[800px] bg-white relative overflow-hidden shadow-2xl">
      {/* Map Background */}
      <img
        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80"
        alt="map"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/5" />

      {/* Top floating controls */}
      <header className="absolute top-0 left-0 right-0 z-20 px-5 pt-12 flex items-center justify-between">
        <button className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center">
          <Menu className="w-5 h-5 text-gray-800" strokeWidth={2} />
        </button>
        <div className="flex-1 mx-3 h-11 px-4 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" strokeWidth={2} />
          <span className="text-sm text-gray-400">장소, 주소 검색</span>
        </div>
        <button className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80"
            alt="me"
            className="w-9 h-9 rounded-full object-cover"
          />
        </button>
      </header>

      {/* Center pin */}
      <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-full z-10 flex flex-col items-center">
        <div className="px-3 py-1.5 rounded-xl bg-gray-900 shadow-lg">
          <span className="text-xs font-semibold text-white">여기서 출발</span>
        </div>
        <span className="w-0.5 h-3 bg-gray-900" />
        <MapPin className="w-9 h-9 text-indigo-600 fill-indigo-600 -mt-1 drop-shadow" />
      </div>

      {/* My-location button */}
      <button className="absolute right-5 bottom-[348px] z-20 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center">
        <Navigation className="w-5 h-5 text-indigo-600 fill-indigo-600" />
      </button>

      {/* Bottom Sheet */}
      <section className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-[28px] shadow-2xl px-5 pt-3 pb-8">
        <div className="mx-auto w-10 h-1.5 rounded-full bg-gray-200" />

        <h2 className="mt-4 text-xl font-bold text-gray-900">어디로 갈까요?</h2>

        {/* Search input */}
        <button className="mt-3 w-full h-12 px-4 rounded-2xl bg-gray-100 flex items-center gap-2.5">
          <Search className="w-5 h-5 text-gray-400" strokeWidth={2} />
          <span className="text-sm text-gray-400">목적지를 입력하세요</span>
        </button>

        {/* Saved places */}
        <div className="mt-4 space-y-1">
          {SAVED_PLACES.map((place) => {
            const Icon = place.icon;
            return (
              <button
                key={place.id}
                className="w-full flex items-center gap-3.5 py-2.5"
              >
                <span className={`w-11 h-11 rounded-full flex items-center justify-center ${place.color}`}>
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-gray-900">{place.label}</p>
                  <p className="text-xs text-gray-400">{place.sub}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
            );
          })}
        </div>

        {/* Call CTA */}
        <button className="mt-3 w-full h-14 rounded-2xl bg-gray-900 flex items-center justify-center gap-2">
          <Car className="w-5 h-5 text-white" strokeWidth={2} />
          <span className="text-base font-bold text-white">택시 호출하기</span>
        </button>
      </section>
    </div>
  );
}
