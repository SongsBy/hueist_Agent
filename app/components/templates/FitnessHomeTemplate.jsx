"use client";

import React from "react";
import {
  Flame,
  Footprints,
  HeartPulse,
  Moon,
  TrendingUp,
  Play,
  ChevronRight,
  Activity,
  Dumbbell,
  BarChart3,
  User,
} from "lucide-react";

const TILES = [
  {
    id: 1,
    label: "걸음 수",
    value: "8,420",
    unit: "걸음",
    icon: Footprints,
    accent: "text-cyan-400",
    bar: "from-cyan-400 to-teal-400",
    progress: 84,
  },
  {
    id: 2,
    label: "심박수",
    value: "72",
    unit: "bpm",
    icon: HeartPulse,
    accent: "text-rose-400",
    bar: "from-rose-400 to-pink-500",
    progress: 60,
  },
  {
    id: 3,
    label: "거리",
    value: "5.8",
    unit: "km",
    icon: TrendingUp,
    accent: "text-lime-400",
    bar: "from-lime-400 to-emerald-400",
    progress: 72,
  },
  {
    id: 4,
    label: "수면",
    value: "7.2",
    unit: "시간",
    icon: Moon,
    accent: "text-violet-400",
    bar: "from-violet-400 to-indigo-400",
    progress: 90,
  },
];

const WORKOUT = {
  title: "전신 HIIT 챌린지",
  meta: "25분 · 320 kcal · 중급",
  image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
};

export default function FitnessHomeTemplate() {
  return (
    <div className="w-full max-w-[400px] mx-auto h-[800px] bg-[#0b0b10] relative overflow-hidden shadow-2xl">
      {/* Top App Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-[#0b0b10]">
        <div className="px-6 pt-12 pb-2 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">좋은 아침이에요</p>
            <h1 className="text-2xl font-bold text-white tracking-tight">소정훈 님</h1>
          </div>
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80"
            alt="profile"
            className="w-11 h-11 rounded-full object-cover border-2 border-white/10"
          />
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="absolute top-[96px] bottom-16 left-0 right-0 overflow-y-auto">
        {/* Activity Rings Card */}
        <section className="px-6 pt-3">
          <div className="rounded-3xl bg-gradient-to-br from-[#17171f] to-[#101018] border border-white/5 p-5 flex items-center gap-5">
            {/* Concentric Rings */}
            <div className="relative w-28 h-28 shrink-0">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                {/* track */}
                <circle cx="60" cy="60" r="52" fill="none" stroke="#ffffff10" strokeWidth="9" />
                <circle cx="60" cy="60" r="40" fill="none" stroke="#ffffff10" strokeWidth="9" />
                <circle cx="60" cy="60" r="28" fill="none" stroke="#ffffff10" strokeWidth="9" />
                {/* progress */}
                <circle
                  cx="60" cy="60" r="52" fill="none" stroke="#fb2576" strokeWidth="9"
                  strokeLinecap="round" strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52 * (1 - 0.78)}
                />
                <circle
                  cx="60" cy="60" r="40" fill="none" stroke="#22d3ee" strokeWidth="9"
                  strokeLinecap="round" strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - 0.62)}
                />
                <circle
                  cx="60" cy="60" r="28" fill="none" stroke="#a3e635" strokeWidth="9"
                  strokeLinecap="round" strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - 0.9)}
                />
              </svg>
              <Flame className="absolute inset-0 m-auto w-6 h-6 text-rose-400" />
            </div>

            <div className="flex-1">
              <p className="text-xs text-gray-500">오늘의 활동</p>
              <p className="mt-1 text-3xl font-bold text-white">
                486<span className="text-base text-gray-500"> kcal</span>
              </p>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span className="text-gray-400">이동</span>
                  <span className="ml-auto font-semibold text-white">486 / 600</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-gray-400">운동</span>
                  <span className="ml-auto font-semibold text-white">37 / 60분</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-lime-400" />
                  <span className="text-gray-400">서기</span>
                  <span className="ml-auto font-semibold text-white">9 / 10시간</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Metric Tiles */}
        <section className="px-6 pt-5">
          <div className="grid grid-cols-2 gap-3">
            {TILES.map((tile) => {
              const Icon = tile.icon;
              return (
                <div
                  key={tile.id}
                  className="rounded-2xl bg-[#17171f] border border-white/5 p-4"
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-5 h-5 ${tile.accent}`} strokeWidth={2} />
                    <span className="text-[11px] text-gray-500">{tile.label}</span>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-white">
                    {tile.value}
                    <span className="text-xs font-medium text-gray-500"> {tile.unit}</span>
                  </p>
                  <div className="mt-2.5 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${tile.bar}`}
                      style={{ width: `${tile.progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recommended Workout */}
        <section className="px-6 pt-5 pb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white">추천 운동</h2>
            <button className="text-xs font-medium text-gray-400 flex items-center">
              더보기 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="relative h-40 rounded-3xl overflow-hidden">
            <img
              src={WORKOUT.image}
              alt={WORKOUT.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 p-5 flex flex-col justify-end">
              <h3 className="text-xl font-bold text-white">{WORKOUT.title}</h3>
              <p className="text-xs text-gray-300 mt-1">{WORKOUT.meta}</p>
            </div>
            <button className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 text-gray-900 fill-gray-900 ml-0.5" />
            </button>
          </div>
        </section>
      </main>

      {/* Bottom GNB */}
      <nav className="absolute bottom-0 left-0 right-0 z-20 h-16 px-9 flex items-center justify-between bg-[#0b0b10] border-t border-white/5">
        <button className="flex flex-col items-center gap-1">
          <Activity className="w-6 h-6 text-rose-400" strokeWidth={2} />
          <span className="text-[10px] font-medium text-rose-400">활동</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Dumbbell className="w-6 h-6 text-gray-500" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-500">운동</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <BarChart3 className="w-6 h-6 text-gray-500" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-500">통계</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <User className="w-6 h-6 text-gray-500" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-500">프로필</span>
        </button>
      </nav>
    </div>
  );
}
