"use client";

import React from "react";
import {
  Plus,
  Search,
  Settings,
  Check,
  Flag,
  Inbox,
  Calendar,
  Hash,
  CheckCircle2,
} from "lucide-react";

const WEEK = [
  { day: "월", date: 15 },
  { day: "화", date: 16 },
  { day: "수", date: 17 },
  { day: "목", date: 18, active: true },
  { day: "금", date: 19 },
  { day: "토", date: 20 },
  { day: "일", date: 21 },
];

const TASKS = [
  {
    id: 1,
    title: "디자인 시스템 토큰 정리",
    project: "Hueist",
    time: "오전 10:00",
    priority: "high",
    done: true,
  },
  {
    id: 2,
    title: "주간 회고 문서 작성하기",
    project: "팀 운영",
    time: "오후 2:00",
    priority: "medium",
    done: false,
  },
  {
    id: 3,
    title: "온보딩 플로우 사용자 인터뷰",
    project: "리서치",
    time: "오후 4:30",
    priority: "high",
    done: false,
  },
  {
    id: 4,
    title: "운동 30분",
    project: "개인",
    time: "저녁 7:00",
    priority: "low",
    done: false,
  },
];

const PRIORITY_COLOR = {
  high: "text-rose-500",
  medium: "text-amber-500",
  low: "text-sky-500",
};

export default function ProductivityHomeTemplate() {
  const total = TASKS.length;
  const completed = TASKS.filter((t) => t.done).length;
  const progress = Math.round((completed / total) * 100);

  return (
    <div className="w-full max-w-[400px] mx-auto h-[800px] bg-white relative overflow-hidden shadow-2xl">
      {/* Top App Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-white">
        <div className="px-6 pt-12 pb-2 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400">2026년 6월 18일 목요일</p>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">오늘</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="w-5 h-5 text-gray-600" strokeWidth={2} />
            </button>
            <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <Settings className="w-5 h-5 text-gray-600" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Calendar Strip */}
        <div className="px-4 pt-2 pb-3 flex justify-between">
          {WEEK.map((d) => (
            <button
              key={d.date}
              className={`flex flex-col items-center gap-1.5 w-10 py-1.5 rounded-2xl ${
                d.active ? "bg-gray-900" : ""
              }`}
            >
              <span className={`text-[11px] font-medium ${d.active ? "text-gray-300" : "text-gray-400"}`}>
                {d.day}
              </span>
              <span className={`text-sm font-bold ${d.active ? "text-white" : "text-gray-700"}`}>
                {d.date}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="absolute top-[164px] bottom-16 left-0 right-0 overflow-y-auto bg-gray-50">
        {/* Progress Card */}
        <section className="px-6 pt-4">
          <div className="rounded-3xl bg-gray-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">오늘의 진행률</p>
                <p className="mt-1 text-3xl font-bold text-white">
                  {completed}
                  <span className="text-lg text-gray-500"> / {total} 완료</span>
                </p>
              </div>
              <span className="text-2xl font-bold text-emerald-400">{progress}%</span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </section>

        {/* Task List */}
        <section className="px-6 pt-6 pb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">할 일</h2>
            <span className="text-xs font-medium text-gray-400">{total}개</span>
          </div>

          <div className="space-y-2.5">
            {TASKS.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3.5"
              >
                <button
                  className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    task.done
                      ? "bg-emerald-500"
                      : "border-2 border-gray-300"
                  }`}
                >
                  {task.done && (
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[15px] font-semibold ${
                      task.done ? "text-gray-400 line-through" : "text-gray-900"
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 text-gray-400">
                      <Hash className="w-3 h-3" />
                      {task.project}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-400">{task.time}</span>
                  </div>
                </div>

                <Flag
                  className={`w-4 h-4 shrink-0 ${PRIORITY_COLOR[task.priority]} fill-current`}
                />
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Add Button */}
      <button className="absolute bottom-20 right-5 z-30 w-14 h-14 rounded-full bg-gray-900 shadow-lg flex items-center justify-center">
        <Plus className="w-7 h-7 text-white" strokeWidth={2.4} />
      </button>

      {/* Bottom GNB */}
      <nav className="absolute bottom-0 left-0 right-0 z-20 h-16 px-9 flex items-center justify-between bg-white border-t border-gray-100">
        <button className="flex flex-col items-center gap-1">
          <CheckCircle2 className="w-6 h-6 text-gray-900" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-900">오늘</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Inbox className="w-6 h-6 text-gray-400" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-400">받은함</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Calendar className="w-6 h-6 text-gray-400" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-400">캘린더</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Settings className="w-6 h-6 text-gray-400" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-400">설정</span>
        </button>
      </nav>
    </div>
  );
}
