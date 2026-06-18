"use client";

import React from "react";
import {
  Search,
  PenSquare,
  Camera,
  MessageCircle,
  Users,
  Phone,
  Settings,
} from "lucide-react";

const STORIES = [
  { id: 1, name: "내 스토리", me: true, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80" },
  { id: 2, name: "지수", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80" },
  { id: 3, name: "민준", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80" },
  { id: 4, name: "서연", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80" },
  { id: 5, name: "도현", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80" },
];

const CHATS = [
  {
    id: 1,
    name: "디자인팀 🎨",
    last: "정훈: 시안 v3 공유드려요! 확인 부탁",
    time: "오후 2:14",
    unread: 4,
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&q=80",
    group: true,
  },
  {
    id: 2,
    name: "김지수",
    last: "내일 저녁에 시간 괜찮아? 🍜",
    time: "오후 1:02",
    unread: 2,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80",
  },
  {
    id: 3,
    name: "이민준",
    last: "넵 그 자료 방금 메일로 보냈습니다",
    time: "오전 11:48",
    unread: 0,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
  },
  {
    id: 4,
    name: "가족 ❤️",
    last: "엄마: 저녁 뭐 먹고 싶어?",
    time: "오전 9:30",
    unread: 0,
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=120&q=80",
    group: true,
  },
  {
    id: 5,
    name: "박서연",
    last: "사진 보내줘서 고마워 😊",
    time: "어제",
    unread: 0,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
  },
  {
    id: 6,
    name: "최도현",
    last: "회의록 정리해서 올려둘게요",
    time: "어제",
    unread: 0,
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&q=80",
  },
];

export default function MessengerHomeTemplate() {
  return (
    <div className="w-full max-w-[400px] mx-auto h-[800px] bg-white relative overflow-hidden shadow-2xl">
      {/* Top App Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="px-5 pt-12 pb-2 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">채팅</h1>
          <div className="flex items-center gap-4">
            <Camera className="w-6 h-6 text-gray-800" strokeWidth={2} />
            <PenSquare className="w-6 h-6 text-gray-800" strokeWidth={2} />
          </div>
        </div>
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 h-10 px-4 rounded-2xl bg-gray-100">
            <Search className="w-4 h-4 text-gray-400" strokeWidth={2} />
            <span className="text-sm text-gray-400">대화 검색</span>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="absolute top-[136px] bottom-16 left-0 right-0 overflow-y-auto">
        {/* Stories */}
        <section className="px-5 pt-3 pb-3 flex gap-4 overflow-x-auto border-b border-gray-100">
          {STORIES.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={`w-16 h-16 rounded-full p-[2.5px] ${
                  s.me ? "bg-gray-200" : "bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600"
                }`}
              >
                <img
                  src={s.image}
                  alt={s.name}
                  className="w-full h-full rounded-full object-cover border-2 border-white"
                />
              </div>
              <span className="text-[11px] text-gray-600 max-w-[60px] truncate">{s.name}</span>
            </div>
          ))}
        </section>

        {/* Chat List */}
        <section>
          {CHATS.map((chat) => (
            <button
              key={chat.id}
              className="w-full px-5 py-3 flex items-center gap-3.5 active:bg-gray-50"
            >
              <div className="relative shrink-0">
                <img
                  src={chat.image}
                  alt={chat.name}
                  className="w-14 h-14 rounded-full object-cover bg-gray-100"
                />
                {!chat.group && (
                  <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                )}
              </div>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <p className="text-[15px] font-bold text-gray-900 truncate">{chat.name}</p>
                  <span className={`text-[11px] shrink-0 ml-2 ${chat.unread ? "text-indigo-600 font-semibold" : "text-gray-400"}`}>
                    {chat.time}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className={`text-sm truncate ${chat.unread ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                    {chat.last}
                  </p>
                  {chat.unread > 0 && (
                    <span className="shrink-0 ml-2 min-w-[20px] h-5 px-1.5 rounded-full bg-indigo-600 text-[11px] font-bold text-white flex items-center justify-center">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </section>
      </main>

      {/* Bottom GNB */}
      <nav className="absolute bottom-0 left-0 right-0 z-20 h-16 px-9 flex items-center justify-between bg-white/90 backdrop-blur-xl border-t border-gray-100">
        <button className="flex flex-col items-center gap-1">
          <MessageCircle className="w-6 h-6 text-indigo-600 fill-indigo-600" strokeWidth={2} />
          <span className="text-[10px] font-medium text-indigo-600">채팅</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Users className="w-6 h-6 text-gray-400" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-400">친구</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Phone className="w-6 h-6 text-gray-400" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-400">통화</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Settings className="w-6 h-6 text-gray-400" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-400">설정</span>
        </button>
      </nav>
    </div>
  );
}
