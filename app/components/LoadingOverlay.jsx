// app/components/LoadingOverlay.jsx
"use client";

import { useToneStore } from "../store/useToneStore";

export default function LoadingOverlay() {
  const isEnriching = useToneStore((state) => state.isEnriching);

  if (!isEnriching) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-xl"
    >
      <div className="flex flex-col items-center gap-10 px-8 text-center">
        {/* Hammering animation — pure CSS, no external icon lib */}
        <div className="relative h-32 w-32" aria-hidden="true">
          {/* Anvil / surface */}
          <div className="absolute bottom-2 left-1/2 h-3 w-24 -translate-x-1/2 rounded-full bg-gray-900/80 shadow-md" />
          <div className="absolute bottom-5 left-1/2 h-5 w-16 -translate-x-1/2 rounded-sm bg-gray-700" />

          {/* Impact spark — pulses on strike */}
          <div className="hueist-spark absolute bottom-10 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-amber-400" />

          {/* Hammer — rotates around its handle's bottom-right */}
          <div className="hueist-hammer absolute top-0 left-1/2 h-24 w-24 -translate-x-1/2">
            <svg
              viewBox="0 0 64 64"
              className="h-full w-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Handle */}
              <rect
                x="30"
                y="20"
                width="4"
                height="36"
                rx="2"
                fill="#1f2937"
              />
              {/* Hammer head */}
              <rect
                x="14"
                y="10"
                width="36"
                height="14"
                rx="3"
                fill="#111827"
              />
              <rect
                x="14"
                y="10"
                width="36"
                height="4"
                rx="2"
                fill="#374151"
              />
            </svg>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <h2 className="text-2xl font-black tracking-tight text-gray-900">
            디자인 DNA 이식 중...
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-gray-500">
            선택하신 톤에 맞춰 실제 아이콘과 폰트를 준비하고 있어요.
          </p>
        </div>

        {/* Subtle progress dots */}
        <div className="flex items-center gap-2" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="hueist-dot h-1.5 w-1.5 rounded-full bg-gray-900"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .hueist-hammer {
          transform-origin: 50% 90%;
          animation: hueist-swing 0.9s cubic-bezier(0.6, 0, 0.4, 1) infinite;
        }
        @keyframes hueist-swing {
          0%,
          100% {
            transform: translateX(-50%) rotate(-35deg);
          }
          45% {
            transform: translateX(-50%) rotate(-35deg);
          }
          55% {
            transform: translateX(-50%) rotate(10deg);
          }
          70% {
            transform: translateX(-50%) rotate(5deg);
          }
          85% {
            transform: translateX(-50%) rotate(-30deg);
          }
        }

        .hueist-spark {
          opacity: 0;
          animation: hueist-spark 0.9s ease-out infinite;
        }
        @keyframes hueist-spark {
          0%,
          50% {
            opacity: 0;
            transform: translateX(-50%) scale(0.4);
          }
          55% {
            opacity: 1;
            transform: translateX(-50%) scale(1.6);
            box-shadow: 0 0 14px 4px rgba(251, 191, 36, 0.55);
          }
          80% {
            opacity: 0;
            transform: translateX(-50%) scale(2.2);
          }
          100% {
            opacity: 0;
          }
        }

        .hueist-dot {
          animation: hueist-pulse 1.2s ease-in-out infinite;
        }
        @keyframes hueist-pulse {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(0.85);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hueist-hammer,
          .hueist-spark,
          .hueist-dot {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
