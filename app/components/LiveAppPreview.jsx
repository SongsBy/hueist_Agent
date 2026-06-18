// app/components/LiveAppPreview.jsx
"use client";

import React, { useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";

// react-live 가 생성 코드 안에서 쓸 수 있는 유일한 의존성.
// 아키텍처 결정: 순수 React + useState 만 주입한다(외부 라이브러리 0).
// noInline 모드라 생성 코드는 컴포넌트를 정의하고 render(<App/>) 로 끝나야 한다.
const SCOPE = { React, useState };

// LLM 이 import/export 를 끼워 넣으면 sucrase 가 require() 로 변환 → 브라우저에
// require 가 없어 깨진다. 트랜스파일 직전에 모듈 구문을 제거해 방어한다.
function stripModuleSyntax(code) {
  if (typeof code !== "string") return "";
  return code
    // 일부 모델이 흘리는 단독 ``` 마커 줄(언어태그 포함) 제거(비대칭 펜스 방어).
    .replace(/^\s*```[a-zA-Z]*\s*$/gm, "")
    .replace(/import\s+(?:[\w*{}\n\r\t, ]+\s+from\s+)?['"][^'"]+['"];?/g, "")
    .replace(/export\s+default\s+/g, "")
    .replace(/^\s*export\s+/gm, "");
}

export default function LiveAppPreview({ code }) {
  if (!code) return null;

  return (
    <LiveProvider code={code} scope={SCOPE} transformCode={stripModuleSyntax} noInline>
      {/* 미리보기 캔버스: 생성된 화면이 자기 폭을 채우도록 컨테이너만 잡아준다.
          폰트는 결과 페이지가 이미 Google Fonts 로 로드해 두었으므로
          생성 코드의 fontFamily 가 그대로 해석된다. */}
      <div className="hueist-app-viewport overflow-hidden rounded-2xl ring-1 ring-black/5 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.18)]">
        <LivePreview style={{ display: "block", width: "100%" }} />
      </div>

      {/* LLM 코드가 깨졌을 때 사용자에게 노출하지 않을 만큼만, 그러나 디버깅엔
          충분하도록 인라인 에러를 보여준다. */}
      <LiveError className="mt-3 whitespace-pre-wrap rounded-xl bg-red-50 p-3 font-mono text-xs leading-relaxed text-red-700" />
    </LiveProvider>
  );
}
