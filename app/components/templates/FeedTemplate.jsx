"use client";

import React from "react";
import {
  Home,
  Search,
  PlusSquare,
  Heart,
  User,
  MoreHorizontal,
  MessageCircle,
  Send,
  Bookmark,
} from "lucide-react";

const STORIES = [
  { id: 1, name: "Your Story", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80", isSelf: true },
  { id: 2, name: "sophie.kim", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80", isSelf: false },
  { id: 3, name: "marcus_lee", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80", isSelf: false },
  { id: 4, name: "ava.travels", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80", isSelf: false },
  { id: 5, name: "danielw", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80", isSelf: false },
];

const POSTS = [
  {
    id: 1,
    user: "sophie.kim",
    location: "Kyoto, Japan",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80",
    likes: "12,438",
    caption: "Golden hour at Fushimi Inari never gets old 🌸",
    comments: "View all 284 comments",
    time: "2 hours ago",
  },
  {
    id: 2,
    user: "marcus_lee",
    location: "Santorini, Greece",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80",
    likes: "8,921",
    caption: "Blue domes and endless sunsets ☀️",
    comments: "View all 156 comments",
    time: "5 hours ago",
  },
];

export default function FeedTemplate() {
  return (
    <div className="w-full max-w-[400px] mx-auto h-[800px] bg-white relative overflow-hidden shadow-2xl">
      {/* Top App Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 h-16 px-5 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Lumen</h1>
        <div className="flex items-center gap-5">
          <Heart className="w-6 h-6 text-gray-900" strokeWidth={1.8} />
          <Send className="w-6 h-6 text-gray-900" strokeWidth={1.8} />
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="absolute top-16 bottom-16 left-0 right-0 overflow-y-auto">
        {/* Stories */}
        <section className="flex gap-4 px-5 py-4 overflow-x-auto border-b border-gray-100">
          {STORIES.map((story) => (
            <div key={story.id} className="flex flex-col items-center gap-1.5 shrink-0">
              <div className={`p-[2.5px] rounded-full ${story.isSelf ? "bg-gray-200" : "bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600"}`}>
                <div className="p-[2px] bg-white rounded-full">
                  <img src={story.avatar} alt={story.name} className="w-14 h-14 rounded-full object-cover" />
                </div>
              </div>
              <span className="text-xs text-gray-700 max-w-[64px] truncate">{story.name}</span>
            </div>
          ))}
        </section>

        {/* Feed Posts */}
        {POSTS.map((post) => (
          <article key={post.id} className="border-b border-gray-100 pb-3">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <img src={post.avatar} alt={post.user} className="w-9 h-9 rounded-full object-cover" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">{post.user}</span>
                  <span className="text-xs text-gray-500">{post.location}</span>
                </div>
              </div>
              <MoreHorizontal className="w-5 h-5 text-gray-700" />
            </div>

            <img src={post.image} alt={post.caption} className="w-full aspect-square object-cover" />

            <div className="flex items-center justify-between px-4 pt-3">
              <div className="flex items-center gap-4">
                <Heart className="w-6 h-6 text-gray-900" strokeWidth={1.8} />
                <MessageCircle className="w-6 h-6 text-gray-900" strokeWidth={1.8} />
                <Send className="w-6 h-6 text-gray-900" strokeWidth={1.8} />
              </div>
              <Bookmark className="w-6 h-6 text-gray-900" strokeWidth={1.8} />
            </div>

            <div className="px-4 pt-2.5 space-y-1">
              <p className="text-sm font-semibold text-gray-900">{post.likes} likes</p>
              <p className="text-sm text-gray-900">
                <span className="font-semibold">{post.user}</span> {post.caption}
              </p>
              <p className="text-sm text-gray-500">{post.comments}</p>
              <p className="text-[11px] uppercase tracking-wide text-gray-400">{post.time}</p>
            </div>
          </article>
        ))}
      </main>

      {/* Bottom GNB */}
      <nav className="absolute bottom-0 left-0 right-0 z-20 h-16 px-8 flex items-center justify-between bg-white/80 backdrop-blur-xl border-t border-gray-100">
        <Home className="w-7 h-7 text-gray-900" strokeWidth={2} />
        <Search className="w-7 h-7 text-gray-400" strokeWidth={2} />
        <PlusSquare className="w-7 h-7 text-gray-400" strokeWidth={2} />
        <Heart className="w-7 h-7 text-gray-400" strokeWidth={2} />
        <User className="w-7 h-7 text-gray-400" strokeWidth={2} />
      </nav>
    </div>
  );
}
