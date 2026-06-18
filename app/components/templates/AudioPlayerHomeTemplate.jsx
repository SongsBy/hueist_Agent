"use client";

import React from "react";
import {
  ChevronDown,
  MoreHorizontal,
  Heart,
  Shuffle,
  SkipBack,
  Play,
  SkipForward,
  Repeat,
  ListMusic,
  Share2,
} from "lucide-react";

const TRACK = {
  title: "Midnight City Lights",
  artist: "The Velvet Hours",
  album: "Neon Reverie",
  cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
  current: "1:48",
  total: "3:52",
  progress: 46,
};

export default function AudioPlayerHomeTemplate() {
  return (
    <div className="w-full max-w-[400px] mx-auto h-[800px] bg-white relative overflow-hidden shadow-2xl">
      {/* Ambient gradient background derived from artwork */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#3b2a5a] via-[#241a38] to-[#0c0a12]" />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 pt-12 flex items-center justify-between">
        <button className="w-9 h-9 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
          <ChevronDown className="w-5 h-5 text-white" strokeWidth={2} />
        </button>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">재생 중</p>
          <p className="text-xs font-semibold text-white mt-0.5">{TRACK.album}</p>
        </div>
        <button className="w-9 h-9 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
          <MoreHorizontal className="w-5 h-5 text-white" strokeWidth={2} />
        </button>
      </header>

      {/* Album Artwork */}
      <div className="absolute top-[112px] left-6 right-6 z-10">
        <div className="aspect-square w-full rounded-[28px] overflow-hidden shadow-2xl">
          <img src={TRACK.cover} alt={TRACK.album} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Controls Block */}
      <section className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-12">
        {/* Title + Like */}
        <div className="flex items-end justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-white truncate">{TRACK.title}</h1>
            <p className="text-base text-white/60 mt-1 truncate">{TRACK.artist}</p>
          </div>
          <button className="shrink-0 ml-3 mb-1">
            <Heart className="w-7 h-7 text-rose-400 fill-rose-400" />
          </button>
        </div>

        {/* Progress scrubber */}
        <div className="mt-6">
          <div className="h-1.5 rounded-full bg-white/15 relative">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${TRACK.progress}%` }}
            />
            <span
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow"
              style={{ left: `${TRACK.progress}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-white/50 font-medium">
            <span>{TRACK.current}</span>
            <span>{TRACK.total}</span>
          </div>
        </div>

        {/* Playback controls */}
        <div className="mt-6 flex items-center justify-between">
          <button>
            <Shuffle className="w-5 h-5 text-white/60" strokeWidth={2} />
          </button>
          <button>
            <SkipBack className="w-8 h-8 text-white fill-white" />
          </button>
          <button className="w-[72px] h-[72px] rounded-full bg-white flex items-center justify-center shadow-xl">
            <Play className="w-8 h-8 text-gray-900 fill-gray-900 ml-1" />
          </button>
          <button>
            <SkipForward className="w-8 h-8 text-white fill-white" />
          </button>
          <button>
            <Repeat className="w-5 h-5 text-white/60" strokeWidth={2} />
          </button>
        </div>

        {/* Footer actions */}
        <div className="mt-8 flex items-center justify-between text-white/60">
          <button className="flex items-center gap-1.5">
            <Share2 className="w-4 h-4" strokeWidth={2} />
            <span className="text-xs font-medium">공유</span>
          </button>
          <button className="flex items-center gap-1.5">
            <ListMusic className="w-4 h-4" strokeWidth={2} />
            <span className="text-xs font-medium">다음 트랙</span>
          </button>
        </div>
      </section>
    </div>
  );
}
