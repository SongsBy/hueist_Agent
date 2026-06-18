// app/components/home/HomeHeader.jsx
// mycleaning 스타일 블루 그라데이션 히어로.
// 상단 내비게이션(로고 + 메뉴 + 흰색 알약 버튼) 위에
// 중앙 정렬 대형 헤드라인 + CTA, 그리고 하단에서 살짝 올라오는 폰 목업을 배치한다.

import Link from "next/link";

const NAV_ITEMS = ["주요기능", "레퍼런스", "요금", "스토리", "고객지원"];

// 폰 목업: 프레임/베젤이 포함된 실사 목업 이미지(public/phone.png)를 그대로 사용한다.
const PHONE_WIDTH = 320;

export default function HomeHeader() {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 text-white">
      {/* ── 상단 내비게이션 ── */}
      <nav className="relative z-10 border-b border-white/15 bg-white/5 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-12">
            <span className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
                <span className="block h-4 w-4 rounded-full bg-gradient-to-br from-amber-300 via-rose-300 to-violet-400 shadow-sm" />
              </span>
              HUEIST
            </span>
            <ul className="hidden items-center gap-1 lg:flex">
              {NAV_ITEMS.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="rounded-full px-3.5 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="#"
              className="hidden px-2 text-sm font-semibold text-white/85 transition-colors hover:text-white sm:block"
            >
              로그인
            </a>
            <Link
              href="/create"
              className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-sky-600 shadow-lg shadow-blue-900/10 transition-transform hover:-translate-y-0.5"
            >
              무료로 시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* ── 히어로 ── */}
      <div className="relative z-10 mx-auto max-w-4xl px-5 pt-20 text-center sm:px-8 sm:pt-28">
        <p className="text-base font-semibold text-white/80">
          디자인 안목이 없어도 괜찮아요
        </p>
        <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
          내 앱에{" "}
          <span className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent">
            딱 맞는 디자인
          </span>
          ,
          <br />
          질문 몇 개로 완성하세요
        </h1>
        <div className="mt-10">
          <Link
            href="/create"
            className="inline-block rounded-full border border-white/50 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
          >
            30초 만에 톤 추천받기
          </Link>
        </div>
      </div>

      {/* ── 하단 폰 목업 (살짝 올라오게) ── */}
      <div className="relative z-10 mt-16 flex justify-center sm:mt-20">
        <img
          src="/phone.png"
          alt="HUEIST 앱 목업"
          className="-mb-12 h-auto drop-shadow-2xl"
          style={{ width: PHONE_WIDTH }}
        />
      </div>
    </header>
  );
}
