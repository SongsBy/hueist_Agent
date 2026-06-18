"use client";

import React from "react";
import {
  Flame,
  Heart,
  Gem,
  Check,
  Star,
  Crown,
  BookOpen,
  Lock,
  Dumbbell,
  Home,
  Trophy,
  ShoppingBag,
  User,
} from "lucide-react";

// 구불구불한 학습 경로 노드. offset 으로 좌우 지그재그 배치한다.
const NODES = [
  { id: 1, state: "done", icon: Check, offset: 0 },
  { id: 2, state: "done", icon: Star, offset: -60 },
  { id: 3, state: "active", icon: BookOpen, offset: -90, label: "시작하기" },
  { id: 4, state: "locked", icon: Crown, offset: -40 },
  { id: 5, state: "locked", icon: Dumbbell, offset: 30 },
  { id: 6, state: "locked", icon: Lock, offset: 70 },
];

export default function EduTechHomeTemplate() {
  return (
    <div className="w-full max-w-[400px] mx-auto h-[800px] bg-white relative overflow-hidden shadow-2xl">
      {/* Top Stats Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-white px-5 pt-12 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {/* Language flag */}
          <button className="text-2xl">🇰🇷</button>
          {/* Streak */}
          <div className="flex items-center gap-1.5">
            <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
            <span className="text-lg font-bold text-orange-500">24</span>
          </div>
          {/* Gems */}
          <div className="flex items-center gap-1.5">
            <Gem className="w-6 h-6 text-sky-400 fill-sky-400" />
            <span className="text-lg font-bold text-sky-500">1,250</span>
          </div>
          {/* Lives */}
          <div className="flex items-center gap-1.5">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            <span className="text-lg font-bold text-rose-500">5</span>
          </div>
        </div>
      </header>

      {/* Unit banner */}
      <div className="absolute top-[100px] left-5 right-5 z-10">
        <div className="rounded-2xl bg-emerald-500 px-5 py-4 flex items-center justify-between shadow-md">
          <div>
            <p className="text-[11px] font-bold text-emerald-100 uppercase tracking-wide">섹션 2 · 유닛 5</p>
            <p className="text-lg font-extrabold text-white mt-0.5">일상 대화 익히기</p>
          </div>
          <BookOpen className="w-7 h-7 text-white" strokeWidth={2} />
        </div>
      </div>

      {/* Learning Path */}
      <main className="absolute top-[188px] bottom-16 left-0 right-0 overflow-y-auto">
        <div className="relative py-8 flex flex-col items-center gap-6">
          {NODES.map((node) => {
            const Icon = node.icon;
            const isActive = node.state === "active";
            const isDone = node.state === "done";
            return (
              <div
                key={node.id}
                className="relative flex flex-col items-center"
                style={{ transform: `translateX(${node.offset}px)` }}
              >
                {isActive && (
                  <div className="absolute -top-9 px-3 py-1.5 rounded-xl bg-white shadow-md border border-gray-100">
                    <span className="text-xs font-bold text-emerald-600">{node.label}</span>
                    <span className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 rotate-45 bg-white border-r border-b border-gray-100" />
                  </div>
                )}
                {/* Node button with 3D bottom shadow */}
                <button
                  className={`relative w-[68px] h-[68px] rounded-full flex items-center justify-center ${
                    isDone
                      ? "bg-amber-400 shadow-[0_5px_0_0_#d97706]"
                      : isActive
                      ? "bg-emerald-500 shadow-[0_5px_0_0_#059669]"
                      : "bg-gray-200 shadow-[0_5px_0_0_#cbd5e1]"
                  }`}
                >
                  <Icon
                    className={`w-8 h-8 ${
                      isDone || isActive ? "text-white" : "text-gray-400"
                    }`}
                    strokeWidth={2.4}
                    fill={isDone ? "currentColor" : "none"}
                  />
                  {isActive && (
                    <span className="absolute inset-0 rounded-full ring-4 ring-emerald-200 animate-pulse" />
                  )}
                </button>
              </div>
            );
          })}

          {/* Treasure chest at the end */}
          <div className="mt-2 flex flex-col items-center" style={{ transform: "translateX(0px)" }}>
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-amber-500 fill-amber-400" />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom GNB */}
      <nav className="absolute bottom-0 left-0 right-0 z-20 h-16 px-7 flex items-center justify-between bg-white border-t-2 border-gray-100">
        <button className="flex flex-col items-center gap-1">
          <Home className="w-7 h-7 text-emerald-500" strokeWidth={2.2} />
        </button>
        <button className="flex flex-col items-center gap-1">
          <Dumbbell className="w-7 h-7 text-gray-300" strokeWidth={2.2} />
        </button>
        <button className="flex flex-col items-center gap-1">
          <Trophy className="w-7 h-7 text-gray-300" strokeWidth={2.2} />
        </button>
        <button className="flex flex-col items-center gap-1">
          <ShoppingBag className="w-7 h-7 text-gray-300" strokeWidth={2.2} />
        </button>
        <button className="flex flex-col items-center gap-1">
          <User className="w-7 h-7 text-gray-300" strokeWidth={2.2} />
        </button>
      </nav>
    </div>
  );
}
