"use client";

import React from "react";
import {
  Search,
  ShoppingBag,
  Heart,
  Home,
  LayoutGrid,
  Receipt,
  User,
} from "lucide-react";

const BANNER = {
  badge: "SUMMER SALE",
  title: "Up to 60% Off",
  subtitle: "New season essentials, ready to ship",
  image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
};

const PRODUCTS = [
  {
    id: 1,
    brand: "Aimé Leon Dore",
    name: "Cotton Logo Hoodie",
    price: "$148",
    originalPrice: "$210",
    discount: "30%",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&q=80",
    favorite: true,
  },
  {
    id: 2,
    brand: "Stüssy",
    name: "Relaxed Wide Denim",
    price: "$96",
    originalPrice: "$120",
    discount: "20%",
    rating: "4.6",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80",
    favorite: false,
  },
  {
    id: 3,
    brand: "New Balance",
    name: "1906R Sneakers",
    price: "$132",
    originalPrice: "$165",
    discount: "20%",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80",
    favorite: false,
  },
  {
    id: 4,
    brand: "Carhartt WIP",
    name: "Nimbus Pullover Jacket",
    price: "$178",
    originalPrice: "$220",
    discount: "19%",
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80",
    favorite: true,
  },
];

export default function CommerceHomeTemplate() {
  return (
    <div className="w-full max-w-[400px] mx-auto h-[800px] bg-white relative overflow-hidden shadow-2xl">
      {/* Top App Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="px-5 pt-12 pb-3 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">SELECT</h1>
          <div className="flex items-center gap-4">
            <Search className="w-6 h-6 text-gray-900" strokeWidth={2} />
            <button className="relative">
              <ShoppingBag className="w-6 h-6 text-gray-900" strokeWidth={2} />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center">
                3
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="absolute top-[88px] bottom-16 left-0 right-0 overflow-y-auto">
        {/* Banner Carousel */}
        <section className="px-5 pt-4">
          <div className="relative h-44 rounded-3xl overflow-hidden">
            <img src={BANNER.image} alt={BANNER.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
            <div className="absolute inset-0 p-5 flex flex-col justify-center">
              <span className="w-fit px-2.5 py-1 rounded-full bg-indigo-600 text-[10px] font-bold text-white tracking-wide">
                {BANNER.badge}
              </span>
              <h2 className="mt-2 text-2xl font-bold text-white">{BANNER.title}</h2>
              <p className="text-xs text-gray-200 mt-1">{BANNER.subtitle}</p>
            </div>
            <div className="absolute bottom-3.5 right-4 flex gap-1.5">
              <span className="w-5 h-1.5 rounded-full bg-white" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <section className="px-5 pt-6 pb-6">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-lg font-bold text-gray-900">Best Sellers</h3>
            <button className="text-sm font-medium text-indigo-600">See all</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {PRODUCTS.map((product) => (
              <article key={product.id} className="flex flex-col">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full aspect-[3/4] object-cover rounded-2xl bg-gray-100"
                  />
                  <button className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm">
                    <Heart
                      className={`w-4 h-4 ${product.favorite ? "fill-indigo-600 text-indigo-600" : "text-gray-700"}`}
                      strokeWidth={2}
                    />
                  </button>
                </div>

                <div className="pt-2.5 px-0.5">
                  <p className="text-xs font-semibold text-gray-900">{product.brand}</p>
                  <p className="text-xs text-gray-500 truncate">{product.name}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-sm font-bold text-indigo-600">{product.discount}</span>
                    <span className="text-sm font-bold text-gray-900">{product.price}</span>
                    <span className="text-xs text-gray-400 line-through">{product.originalPrice}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom GNB */}
      <nav className="absolute bottom-0 left-0 right-0 z-20 h-16 px-8 flex items-center justify-between bg-white/80 backdrop-blur-xl border-t border-gray-100">
        <button className="flex flex-col items-center gap-1">
          <Home className="w-6 h-6 text-indigo-600" strokeWidth={2} />
          <span className="text-[10px] font-medium text-indigo-600">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <LayoutGrid className="w-6 h-6 text-gray-400" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-400">Category</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Heart className="w-6 h-6 text-gray-400" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-400">Likes</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Receipt className="w-6 h-6 text-gray-400" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-400">Orders</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <User className="w-6 h-6 text-gray-400" strokeWidth={2} />
          <span className="text-[10px] font-medium text-gray-400">My</span>
        </button>
      </nav>
    </div>
  );
}
