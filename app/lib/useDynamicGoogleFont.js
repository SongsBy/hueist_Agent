"use client";

import { useEffect, useState } from "react";

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

// families: collectFontFamiliesForTones()가 반환하는 [{ family, weights }] 또는
// 단순 문자열 family 배열. "Family:weight" 형태의 안정적인 load 스펙으로 정규화한다.
function normalizeFontFaceSpecs(families) {
  if (!Array.isArray(families)) return [];
  const specs = new Set();
  for (const item of families) {
    const family = typeof item === "string" ? item : item?.family;
    if (!family) continue;
    const weights =
      item && Array.isArray(item.weights) && item.weights.length > 0
        ? item.weights
        : [400];
    for (const w of weights) {
      const num = Number(w);
      if (Number.isFinite(num)) specs.add(`${family}:${num}`);
    }
  }
  // 정렬해 배열 순서가 달라도 동일 effect 키가 되도록 한다.
  return Array.from(specs).sort();
}

// FOUT(폰트 교체 깜빡임) 완화용 훅.
// CSS Font Loading API로 요청한 폰트들이 실제로 준비됐는지 추적해 boolean을 반환한다.
// 호출부는 ready가 true가 될 때까지 콘텐츠를 살짝 가리거나 페이드인해 폴백→웹폰트
// 전환의 깜빡임을 숨길 수 있다. 네트워크 실패/지연 시 무한 대기를 막기 위해
// timeoutMs 후에는 강제로 ready 처리(폴백 폰트로 우아하게 노출)한다.
export function useFontsReady(families, { timeoutMs = 2000 } = {}) {
  const key = normalizeFontFaceSpecs(families).join("\n");

  // 로드할 폰트가 없으면 즉시 준비 완료. 키가 바뀌면 다시 대기 상태로.
  const [ready, setReady] = useState(() => key === "");

  useEffect(() => {
    if (key === "") {
      setReady(true);
      return;
    }
    // 폰트 로딩 API 미지원 환경(SSR/구형 브라우저)에서는 차단하지 않는다.
    if (typeof document === "undefined" || !document.fonts?.load) {
      setReady(true);
      return;
    }

    let cancelled = false;
    setReady(false);

    const loads = key.split("\n").map((spec) => {
      const sep = spec.lastIndexOf(":");
      const family = spec.slice(0, sep);
      const weight = spec.slice(sep + 1);
      // 개별 폰트 실패가 전체 Promise.all을 깨지 않도록 catch로 흡수.
      return document.fonts.load(`${weight} 1em "${family}"`).catch(() => {});
    });

    const timer = setTimeout(() => {
      if (!cancelled) setReady(true);
    }, timeoutMs);

    Promise.all(loads)
      .then(() => document.fonts.ready)
      .then(() => {
        if (cancelled) return;
        clearTimeout(timer);
        setReady(true);
      });

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [key, timeoutMs]);

  return ready;
}
