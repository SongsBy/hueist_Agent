"use client";

import React from "react";
import {
  Search,
  Cast,
  Play,
  Plus,
  Info,
  Home,
  Clapperboard,
  Download,
  User,
} from "lucide-react";

const GENRE_ROWS = [
  {
    id: 1,
    title: "Trending Now",
    items: [
      { id: 11, title: "Crimson Veil", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80", rank: "1" },
      { id: 12, title: "Neon District", image: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&q=80", rank: "2" },
      { id: 13, title: "The Last Orbit", image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&q=80", rank: "3" },
    ],
  },
  {
    id: 2,
    title: "New Releases",
    items: [
      { id: 21, title: "Glass Harbor", image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80", rank: null },
      { id: 22, title: "Wild Frontier", image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&q=80", rank: null },
      { id: 23, title: "Midnight Run", image: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=400&q=80", rank: null },
    ],
  },
];

export default function MediaHomeTemplate() {
  return (
    <div className="w-full max-w-[400px] mx-auto h-[800px] bg-neutral-950 relative overflow-hidden shadow-2xl">
      {/* Top App Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 h-20 px-5 pt-8 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <h1 className="text-2xl font-extrabold tracking-tight text-indigo-600">STREAMR</h1>
        <div className="flex items-center gap-5">
          <Cast className="w-6 h-6 text-white" strokeWidth={2} />
          <Search className="w-6 h-6 text-white" strokeWidth={2} />
          <img
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
            alt="Profile"
            className="w-7 h-7 rounded-md object-cover"
          />
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="absolute inset-0 bottom-16 overflow-y-auto">
        {/* Hero Poster */}
        <section className="relative h-[480px]">
          <img
            src="https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&q=80"
            alt="Echoes of Tomorrow"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

          <div className="absolute bottom-6 left-0 right-0 px-5 text-center">
            <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">
              ECHOES OF<br />TOMORROW
            </h2>
            <p className="mt-3 text-xs font-medium text-gray-300 tracking-wide">
              Sci-Fi · Thriller · Mystery · Acclaimed
            </p>

            <div className="mt-5 flex items-center justify-center gap-2.5">
              <button className="flex flex-col items-center gap-1 px-3">
                <Plus className="w-6 h-6 text-white" strokeWidth={2} />
                <span className="text-[11px] text-gray-300">My List</span>
              </button>
              <button className="flex items-center gap-2 px-8 h-11 rounded-md bg-white">
                <Play className="w-5 h-5 fill-black text-black" />
                <span className="text-sm font-bold text-black">Play</span>
              </button>
              <button className="flex flex-col items-center gap-1 px-3">
                <Info className="w-6 h-6 text-white" strokeWidth={2} />
                <span className="text-[11px] text-gray-300">Info</span>
              </button>
            </div>
          </div>
        </section>

        {/* Genre Rows */}
        <section className="-mt-2 pb-6 space-y-6">
          {GENRE_ROWS.map((row) => (
            <div key={row.id}>
              <h3 className="px-5 mb-3 text-lg font-bold text-white">{row.title}</h3>
              <div className="flex gap-3 px-5 overflow-x-auto">
                {row.items.map((item) => (
                  <div key={item.id} className="relative shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-28 h-40 rounded-lg object-cover"
                    />
                    {item.rank && (
                      <span className="absolute -bottom-1 -left-1 text-5xl font-black text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
                        {item.rank}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Bottom GNB */}
      <nav className="absolute bottom-0 left-0 right-0 z-20 h-16 px-8 flex items-center justify-between bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-800">
        <button className="flex flex-col items-center gap-1">
          <Home className="w-6 h-6 text-white" strokeWidth={2} />
          <span className="text-[10px] font-medium text-white">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Clapperboard className="w-6 h-6 text-gray-500" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-500">New & Hot</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Download className="w-6 h-6 text-gray-500" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-500">Downloads</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <User className="w-6 h-6 text-gray-500" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-500">Profile</span>
        </button>
      </nav>
    </div>
  );
}
