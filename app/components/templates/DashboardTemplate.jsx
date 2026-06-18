"use client";

import React from "react";
import {
  Bell,
  Send,
  Plus,
  ArrowDownLeft,
  CreditCard,
  ShoppingBag,
  Coffee,
  Car,
  Zap,
  ChevronRight,
  Home,
  BarChart2,
  Wallet,
  Settings,
} from "lucide-react";

const QUICK_ACTIONS = [
  { id: 1, label: "Transfer", icon: Send, color: "bg-blue-50 text-blue-600" },
  { id: 2, label: "Top Up", icon: Plus, color: "bg-emerald-50 text-emerald-600" },
  { id: 3, label: "Request", icon: ArrowDownLeft, color: "bg-purple-50 text-purple-600" },
  { id: 4, label: "Cards", icon: CreditCard, color: "bg-amber-50 text-amber-600" },
];

const TRANSACTIONS = [
  { id: 1, name: "Starbucks Coffee", category: "Food & Drink", icon: Coffee, amount: "-$4,230.50", time: "Today, 9:24 AM", positive: false },
  { id: 2, name: "Salary Deposit", category: "Income", icon: ArrowDownLeft, amount: "+$5,400.00", time: "Yesterday, 2:00 PM", positive: true },
  { id: 3, name: "Amazon Purchase", category: "Shopping", icon: ShoppingBag, amount: "-$128.99", time: "Jun 16, 6:12 PM", positive: false },
  { id: 4, name: "Uber Ride", category: "Transport", icon: Car, amount: "-$23.40", time: "Jun 15, 8:45 PM", positive: false },
  { id: 5, name: "Electric Bill", category: "Utilities", icon: Zap, amount: "-$96.20", time: "Jun 14, 11:30 AM", positive: false },
];

export default function DashboardTemplate() {
  return (
    <div className="w-full max-w-[400px] mx-auto h-[800px] bg-white relative overflow-hidden shadow-2xl">
      <main className="absolute inset-0 bottom-16 overflow-y-auto bg-gray-50">
        {/* Header + Balance Card */}
        <section className="bg-gradient-to-br from-indigo-600 to-violet-700 px-5 pt-12 pb-20 rounded-b-[32px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
                alt="Daniel Wright"
                className="w-11 h-11 rounded-full object-cover border-2 border-white/30"
              />
              <div>
                <p className="text-xs text-indigo-200">Good morning</p>
                <p className="text-sm font-semibold text-white">Daniel Wright</p>
              </div>
            </div>
            <button className="relative w-11 h-11 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute top-2.5 right-3 w-2 h-2 bg-rose-400 rounded-full" />
            </button>
          </div>

          <div className="mt-8">
            <p className="text-sm text-indigo-200">Total Balance</p>
            <p className="text-4xl font-bold text-white mt-1 tracking-tight">$48,290.75</p>
            <p className="text-sm text-emerald-300 mt-2 font-medium">+2.4% from last month</p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="px-5 -mt-12 relative z-10">
          <div className="bg-white rounded-2xl shadow-md p-4 flex justify-between">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button key={action.id} className="flex flex-col items-center gap-2">
                  <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${action.color}`}>
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </span>
                  <span className="text-xs font-medium text-gray-700">{action.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Recent Transactions */}
        <section className="px-5 mt-7 pb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">Recent Transactions</h2>
            <button className="text-sm font-medium text-indigo-600 flex items-center">
              See all <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {TRANSACTIONS.map((tx) => {
              const Icon = tx.icon;
              return (
                <div key={tx.id} className="bg-white rounded-2xl shadow-sm p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600" strokeWidth={2} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{tx.name}</p>
                      <p className="text-xs text-gray-400">{tx.time}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold ${tx.positive ? "text-emerald-600" : "text-gray-900"}`}>
                    {tx.amount}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Bottom GNB */}
      <nav className="absolute bottom-0 left-0 right-0 z-20 h-16 px-9 flex items-center justify-between bg-white/80 backdrop-blur-xl border-t border-gray-100">
        <Home className="w-6 h-6 text-indigo-600" strokeWidth={2} />
        <BarChart2 className="w-6 h-6 text-gray-400" strokeWidth={2} />
        <Wallet className="w-6 h-6 text-gray-400" strokeWidth={2} />
        <Settings className="w-6 h-6 text-gray-400" strokeWidth={2} />
      </nav>
    </div>
  );
}
