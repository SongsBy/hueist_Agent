"use client";

import React from "react";
import {
  ChevronDown,
  Plus,
  Lightbulb,
  Thermometer,
  Lock,
  Wifi,
  Tv,
  Fan,
  Camera,
  Home,
  Grid3x3,
  Bell,
  Settings,
} from "lucide-react";

const SCENES = [
  { id: 1, label: "외출 모드", icon: Lock },
  { id: 2, label: "취침 모드", icon: Lightbulb },
  { id: 3, label: "영화 모드", icon: Tv },
];

const DEVICES = [
  { id: 1, name: "거실 조명", room: "거실", icon: Lightbulb, on: true, value: "80%", accent: "from-amber-400 to-orange-500" },
  { id: 2, name: "온도 조절기", room: "거실", icon: Thermometer, on: true, value: "23°C", accent: "from-rose-400 to-red-500" },
  { id: 3, name: "현관문 잠금", room: "현관", icon: Lock, on: true, value: "잠김", accent: "from-emerald-400 to-teal-500" },
  { id: 4, name: "공기청정기", room: "침실", icon: Fan, on: false, value: "꺼짐", accent: "from-sky-400 to-blue-500" },
  { id: 5, name: "스마트 TV", room: "거실", icon: Tv, on: false, value: "꺼짐", accent: "from-violet-400 to-indigo-500" },
  { id: 6, name: "보안 카메라", room: "현관", icon: Camera, on: true, value: "녹화 중", accent: "from-fuchsia-400 to-purple-500" },
];

export default function SmartHomeTemplate() {
  return (
    <div className="w-full max-w-[400px] mx-auto h-[800px] bg-[#0e0f13] relative overflow-hidden shadow-2xl">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-[#0e0f13] px-6 pt-12 pb-2">
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-1.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">우리집</h1>
            <ChevronDown className="w-5 h-5 text-gray-400" strokeWidth={2.2} />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" strokeWidth={2.2} />
          </button>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Wifi className="w-3.5 h-3.5" /> 연결됨</span>
          <span>·</span>
          <span>기기 6대 · 4대 켜짐</span>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="absolute top-[120px] bottom-16 left-0 right-0 overflow-y-auto">
        {/* Scenes */}
        <section className="pt-2 pb-4">
          <div className="px-6 flex gap-3 overflow-x-auto">
            {SCENES.map((scene) => {
              const Icon = scene.icon;
              return (
                <button
                  key={scene.id}
                  className="shrink-0 flex items-center gap-2 px-4 h-11 rounded-2xl bg-white/10 backdrop-blur"
                >
                  <Icon className="w-4 h-4 text-white" strokeWidth={2} />
                  <span className="text-sm font-medium text-white">{scene.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Device Tiles */}
        <section className="px-6 pb-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">기기</h2>
          <div className="grid grid-cols-2 gap-3">
            {DEVICES.map((device) => {
              const Icon = device.icon;
              return (
                <div
                  key={device.id}
                  className={`rounded-3xl p-4 h-36 flex flex-col justify-between transition ${
                    device.on
                      ? `bg-gradient-to-br ${device.accent}`
                      : "bg-[#1a1b21] border border-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`w-11 h-11 rounded-full flex items-center justify-center ${
                        device.on ? "bg-white/25" : "bg-white/5"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${device.on ? "text-white" : "text-gray-500"}`} strokeWidth={2} />
                    </span>
                    {/* Toggle */}
                    <span
                      className={`w-11 h-6 rounded-full p-0.5 flex ${
                        device.on ? "bg-white/30 justify-end" : "bg-white/10 justify-start"
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-white shadow" />
                    </span>
                  </div>
                  <div>
                    <p className={`text-[15px] font-bold ${device.on ? "text-white" : "text-gray-300"}`}>
                      {device.name}
                    </p>
                    <p className={`text-xs mt-0.5 ${device.on ? "text-white/70" : "text-gray-500"}`}>
                      {device.room} · {device.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Bottom GNB */}
      <nav className="absolute bottom-0 left-0 right-0 z-20 h-16 px-9 flex items-center justify-between bg-[#0e0f13] border-t border-white/5">
        <button className="flex flex-col items-center gap-1">
          <Home className="w-6 h-6 text-white" strokeWidth={2} />
          <span className="text-[10px] font-medium text-white">홈</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Grid3x3 className="w-6 h-6 text-gray-500" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-500">기기</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Bell className="w-6 h-6 text-gray-500" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-500">알림</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Settings className="w-6 h-6 text-gray-500" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-500">설정</span>
        </button>
      </nav>
    </div>
  );
}
