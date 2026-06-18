"use client";

import React from "react";
import {
  Search,
  SlidersHorizontal,
  Heart,
  Star,
  MapPin,
  Compass,
  CalendarRange,
  MessageCircle,
  User,
} from "lucide-react";

const CATEGORIES = [
  { id: 1, label: "All", icon: Compass, active: true },
  { id: 2, label: "Beachfront", icon: MapPin, active: false },
  { id: 3, label: "Cabins", icon: MapPin, active: false },
  { id: 4, label: "Cityscape", icon: MapPin, active: false },
  { id: 5, label: "Lakeside", icon: MapPin, active: false },
];

const LISTINGS = [
  {
    id: 1,
    title: "Cliffside Villa with Infinity Pool",
    location: "Oia, Santorini",
    distance: "1,842 km away",
    date: "Jun 24 – 29",
    rating: "4.97",
    price: "$412",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
    favorite: true,
  },
  {
    id: 2,
    title: "Modern A-Frame in the Pines",
    location: "Lake Tahoe, California",
    distance: "327 km away",
    date: "Jul 2 – 7",
    rating: "4.89",
    price: "$268",
    image: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80",
    favorite: false,
  },
];

export default function TravelHomeTemplate() {
  return (
    <div className="w-full max-w-[400px] mx-auto h-[800px] bg-white relative overflow-hidden shadow-2xl">
      {/* Top App Bar + Search */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="px-5 pt-12 pb-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-gray-400">Where to next,</p>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Olivia 👋</h1>
            </div>
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"
              alt="Olivia Bennett"
              className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-100"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3 h-12 px-4 rounded-full bg-gray-100 shadow-sm">
              <Search className="w-5 h-5 text-gray-400" strokeWidth={2} />
              <span className="text-sm text-gray-400">Search destinations</span>
            </div>
            <button className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <SlidersHorizontal className="w-5 h-5 text-white" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="absolute top-[152px] bottom-16 left-0 right-0 overflow-y-auto">
        {/* Category Pills */}
        <section className="flex gap-2.5 px-5 py-4 overflow-x-auto border-b border-gray-100">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                className={`flex items-center gap-2 shrink-0 px-4 h-9 rounded-full text-sm font-medium transition-colors ${
                  cat.active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                {cat.label}
              </button>
            );
          })}
        </section>

        {/* Listing Cards */}
        <section className="px-5 py-4 space-y-5">
          {LISTINGS.map((item) => (
            <article key={item.id} className="rounded-3xl overflow-hidden">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-60 object-cover rounded-3xl"
                />
                <button className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-black/25 backdrop-blur-md flex items-center justify-center">
                  <Heart
                    className={`w-5 h-5 ${item.favorite ? "fill-indigo-600 text-indigo-600" : "text-white"}`}
                    strokeWidth={2}
                  />
                </button>
                <span className="absolute bottom-3.5 left-3.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-semibold text-gray-900">
                  Guest favorite
                </span>
              </div>

              <div className="pt-3 px-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">{item.location}</h3>
                  <span className="flex items-center gap-1 text-sm font-medium text-gray-900">
                    <Star className="w-4 h-4 fill-gray-900 text-gray-900" />
                    {item.rating}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{item.title}</p>
                <p className="text-sm text-gray-500">{item.date}</p>
                <p className="mt-1.5 text-base text-gray-900">
                  <span className="font-bold">{item.price}</span>
                  <span className="text-gray-500"> night</span>
                </p>
              </div>
            </article>
          ))}
        </section>
      </main>

      {/* Bottom GNB */}
      <nav className="absolute bottom-0 left-0 right-0 z-20 h-16 px-8 flex items-center justify-between bg-white/80 backdrop-blur-xl border-t border-gray-100">
        <button className="flex flex-col items-center gap-1">
          <Search className="w-6 h-6 text-indigo-600" strokeWidth={2} />
          <span className="text-[10px] font-medium text-indigo-600">Explore</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Heart className="w-6 h-6 text-gray-400" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-400">Wishlists</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <CalendarRange className="w-6 h-6 text-gray-400" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-400">Trips</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <MessageCircle className="w-6 h-6 text-gray-400" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-400">Inbox</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <User className="w-6 h-6 text-gray-400" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-400">Profile</span>
        </button>
      </nav>
    </div>
  );
}
