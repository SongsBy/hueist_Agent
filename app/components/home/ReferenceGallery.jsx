// app/components/home/ReferenceGallery.jsx
// 홈 본문 갤러리. imweb 템플릿 페이지처럼 상단 칩으로 화면 종류를 고르고,
// 그 아래에 "우리가 만든 어플리케이션 레퍼런스"를 실제 축소 썸네일로 보여준다.
//
// 레퍼런스 소스는 templates/registry 의 TEMPLATES (모바일 앱 목업)을 재사용한다.
// 칩은 [홈화면 / 상세페이지] 두 가지지만, 현재는 홈화면 레퍼런스만 존재하므로
// 상세페이지 탭은 자리만 잡아두고 "준비 중" 빈 상태를 노출한다.
"use client";

import { useState } from "react";
import { TEMPLATES } from "../templates/registry";
import { useToneStore } from "../../store/useToneStore";

// 앱 목업(400×800)을 카드 안에 축소해 넣는 비율.
const THUMB_WIDTH = 260;
const THUMB_SCALE = THUMB_WIDTH / 400;
const THUMB_HEIGHT = 800 * THUMB_SCALE;

// 상단 칩 탭 정의. "home" 만 레퍼런스를 가지며, "detail" 은 자리표시용.
const TABS = [
  { id: "home", label: "홈화면" },
  { id: "detail", label: "상세페이지" },
];

function ReferenceCard({ reference, selectable = false, selected = false, onSelect }) {
  const { name, tagline, desc, Component } = reference;

  // 선택 모드에서는 카드 전체가 버튼처럼 동작하고, 선택 시 강조 링을 두른다.
  // 템플릿 목업 안에 <button>이 있어 실제 <button>으로 감싸면 중첩 오류가 나므로
  // div + role="button" 으로 클릭/키보드 접근성만 부여한다.
  const Wrapper = selectable ? "div" : "article";
  const wrapperProps = selectable
    ? {
        role: "button",
        tabIndex: 0,
        onClick: onSelect,
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect?.();
          }
        },
        "aria-pressed": selected,
        className:
          "group flex flex-col text-left focus:outline-none cursor-pointer",
      }
    : { className: "group flex flex-col" };

  return (
    <Wrapper {...wrapperProps}>
      <div
        className={[
          "relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl",
          selectable && selected
            ? "border-gray-900 ring-2 ring-gray-900 ring-offset-2"
            : "border-gray-200",
        ].join(" ")}
        style={{ width: THUMB_WIDTH, height: THUMB_HEIGHT }}
      >
        <div
          className="hueist-app-viewport pointer-events-none origin-top-left"
          style={{
            width: 400,
            height: 800,
            transform: `scale(${THUMB_SCALE})`,
          }}
          aria-hidden="true"
        >
          <Component />
        </div>

        {/* 선택 표시 체크 배지 */}
        {selectable && selected ? (
          <span className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white shadow-md">
            ✓
          </span>
        ) : null}
      </div>

      <div className="px-1 pt-3.5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
          {tagline}
        </p>
        <h3 className="mt-0.5 text-base font-semibold text-gray-900">{name}</h3>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">{desc}</p>
      </div>
    </Wrapper>
  );
}

// selectable=true 로 쓰면 카드가 선택 가능한 템플릿 피커로 동작한다.
// (홈은 전시용, /create 페이지는 선택용으로 같은 컴포넌트를 재사용한다)
export default function ReferenceGallery({ selectable = false }) {
  const [activeTab, setActiveTab] = useState("home");
  const selectedTemplateId = useToneStore((s) => s.selectedTemplateId);
  const setSelectedTemplateId = useToneStore((s) => s.setSelectedTemplateId);

  return (
    <section className="w-full bg-white px-5 pb-24 pt-24 sm:px-8 sm:pt-28">
      <div className="mx-auto max-w-6xl">
        {/* ── 상단 칩 탭 ── */}
        <div className="flex flex-wrap gap-2.5">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={active}
                className={[
                  "rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800",
                ].join(" ")}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── 섹션 제목 ── */}
        <h2 className="mt-9 text-xl font-bold text-gray-900">
          {activeTab === "home" ? "홈화면" : "상세페이지"}
        </h2>

        {/* ── 본문 ── */}
        {activeTab === "home" ? (
          <div className="mt-6 flex flex-wrap justify-center gap-7 sm:justify-start">
            {TEMPLATES.map((reference) => (
              <ReferenceCard
                key={reference.id}
                reference={reference}
                selectable={selectable}
                selected={selectable && selectedTemplateId === reference.id}
                onSelect={() => setSelectedTemplateId(reference.id)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50 text-center">
            <p className="text-base font-semibold text-gray-700">
              상세페이지 레퍼런스는 준비 중이에요
            </p>
            <p className="mt-1.5 text-sm text-gray-400">
              곧 다양한 상세페이지 레퍼런스를 추가할 예정이에요.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
