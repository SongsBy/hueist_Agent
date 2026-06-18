"use client";

import React from "react";
import { TEMPLATES } from "../components/templates/registry";

export default function TemplatesPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <header className="max-w-6xl mx-auto mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Mobile App Base Templates</h1>
        <p className="text-gray-500 mt-2">
          {TEMPLATES.length} core layouts · React + Tailwind + lucide-react
        </p>
      </header>

      <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-10">
        {TEMPLATES.map(({ id, name, tagline, desc, Component }) => (
          <section key={id} className="flex flex-col items-center gap-3">
            <div className="text-center">
              <h2 className="text-base font-semibold text-gray-900">{name}</h2>
              <p className="text-xs font-medium text-indigo-600">{tagline}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
            <Component />
          </section>
        ))}
      </div>
    </div>
  );
}
