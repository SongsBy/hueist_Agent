// app/layout.jsx
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "HUEIST — 디자인 견해가 없어도, 시작할 수 있게",
  description:
    "디자인 비전공 1인 개발자를 위한 AI 디자인 톤 추천 도구. 레퍼런스 카드에서 분위기를 고르기만 하면 디자인 시스템이 완성됩니다.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
