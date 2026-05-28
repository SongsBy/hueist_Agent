"use client";

import { useEffect } from "react";

const PRECONNECT_TARGETS = [
  { href: "https://fonts.googleapis.com", crossOrigin: false },
  { href: "https://fonts.gstatic.com", crossOrigin: true },
];

// 모듈 스코프 refcount: 동일 href를 여러 컴포넌트가 동시에 요구해도
// <link>는 한 번만 추가되고, 모든 사용자가 떠나면 그때 제거된다.
const refCounts = new Map();
const linkNodes = new Map();

function ensurePreconnects() {
  if (typeof document === "undefined") return;
  for (const { href, crossOrigin } of PRECONNECT_TARGETS) {
    if (document.head.querySelector(`link[rel="preconnect"][href="${href}"]`)) {
      continue;
    }
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = href;
    if (crossOrigin) link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  }
}

function acquire(href) {
  if (typeof document === "undefined" || !href) return;
  const next = (refCounts.get(href) ?? 0) + 1;
  refCounts.set(href, next);
  if (next > 1) return;

  ensurePreconnects();
  let link = document.head.querySelector(
    `link[data-hueist-font="${CSS.escape(href)}"]`,
  );
  if (!link) {
    link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.hueistFont = href;
    document.head.appendChild(link);
  }
  linkNodes.set(href, link);
}

function release(href) {
  if (typeof document === "undefined" || !href) return;
  const current = refCounts.get(href) ?? 0;
  if (current <= 1) {
    refCounts.delete(href);
    const link = linkNodes.get(href);
    if (link && link.parentNode) link.parentNode.removeChild(link);
    linkNodes.delete(href);
  } else {
    refCounts.set(href, current - 1);
  }
}

// 입력은 string | string[] | null. 배열 순서는 무관하게 동일 키로 정규화하여
// 같은 폰트 셋을 새 배열 참조로 받아도 effect 재실행을 막는다.
function normalizeKey(input) {
  if (!input) return "";
  const arr = Array.isArray(input) ? input : [input];
  const cleaned = arr.filter((h) => typeof h === "string" && h.length > 0);
  if (cleaned.length === 0) return "";
  const unique = Array.from(new Set(cleaned)).sort();
  return unique.join("\n");
}

export function useDynamicGoogleFont(input) {
  const key = normalizeKey(input);

  useEffect(() => {
    if (!key) return;
    const hrefs = key.split("\n");
    for (const href of hrefs) acquire(href);
    return () => {
      for (const href of hrefs) release(href);
    };
  }, [key]);
}
