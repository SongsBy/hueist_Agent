// app/components/survey/StepColor.jsx
// STEP 1-D: 색 온도 / 밝기 / 채도 슬라이더 (각 0~100).
// 디자인 비전공자도 값이 어떤 색인지 바로 떠올릴 수 있도록, 슬라이더 트랙과
// 핸들·미리보기 칩이 현재 값에 맞춰 실시간으로 색을 바꾼다.
// - 색온도: 색조(차가운 파랑 ↔ 따뜻한 주황)
// - 밝기:   명도(어두움 ↔ 밝음)
// - 채도:   선명함(탁한 회색 ↔ 선명한 색)
"use client";

// 온도 트랙 그라데이션의 색 정지점(0~100). CSS 그라데이션과 핸들 색 계산이
// 같은 정지점을 공유해 "핸들 아래에 깔린 색"이 곧 핸들 색이 되도록 한다.
const TEMPERATURE_STOPS = [
  { at: 0, color: "#3B82F6" }, // 차가운 파랑
  { at: 50, color: "#F3F4F6" }, // 중립
  { at: 100, color: "#F97316" }, // 따뜻한 주황
];

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToHex(rgb) {
  return `#${rgb
    .map((n) => Math.round(n).toString(16).padStart(2, "0"))
    .join("")}`;
}

// 정지점 사이를 선형 보간해 value 위치의 실제 색(HEX)을 구한다.
function sampleGradient(stops, value) {
  const v = clamp(value);
  let lower = stops[0];
  let upper = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i += 1) {
    if (v >= stops[i].at && v <= stops[i + 1].at) {
      lower = stops[i];
      upper = stops[i + 1];
      break;
    }
  }
  const span = upper.at - lower.at || 1;
  const t = (v - lower.at) / span;
  const a = hexToRgb(lower.color);
  const b = hexToRgb(upper.color);
  return rgbToHex(a.map((c, i) => c + (b[i] - c) * t));
}

function staticGradientCss(stops) {
  return `linear-gradient(to right, ${stops
    .map((s) => `${s.color} ${s.at}%`)
    .join(", ")})`;
}

// 세 축을 HSL로 합친다. 색조(hue)는 색온도, 명도(lightness)는 밝기,
// 채도(saturation)는 채도 슬라이더가 직접 결정한다.
function toHsl(temperature, brightness, saturation) {
  const hue = 217 + (25 - 217) * (clamp(temperature) / 100); // 파랑 → 주황
  const lightness = 18 + (clamp(brightness) / 100) * 76; // 18% → 94%
  const sat = (clamp(saturation) / 100) * 90; // 0% → 90%
  return {
    hue: Math.round(hue),
    saturation: Math.round(sat),
    lightness: Math.round(lightness),
  };
}

function hslCss({ hue, saturation, lightness }) {
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

const TEMPERATURE_GRADIENT = staticGradientCss(TEMPERATURE_STOPS);

function Slider({
  id,
  label,
  leftLabel,
  rightLabel,
  value,
  onChange,
  trackGradient,
  thumbColor,
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {/* 라벨 옆 작은 점도 현재 핸들 색을 그대로 따라간다. */}
        <span
          aria-hidden
          className="h-5 w-5 rounded-full border border-black/10 shadow-sm transition-colors duration-150"
          style={{ backgroundColor: thumbColor }}
        />
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="hue-range"
        style={{
          "--track-gradient": trackGradient,
          "--thumb-color": thumbColor,
        }}
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

export default function StepColor({ survey, setSurvey }) {
  const temperature = survey.color_temperature ?? 50;
  const brightness = survey.color_brightness ?? 50;
  const saturation = survey.color_saturation ?? 50;

  const temperatureColor = sampleGradient(TEMPERATURE_STOPS, temperature);

  // 밝기·채도 트랙은 "지금 고른 색"을 기준으로 동적으로 그린다.
  // 그래야 슬라이더 미리보기가 실제 결과 색과 일치한다.
  const baseHsl = toHsl(temperature, brightness, saturation);

  const brightnessColor = hslCss(toHsl(temperature, brightness, saturation));
  const brightnessGradient = `linear-gradient(to right, ${hslCss({
    ...baseHsl,
    lightness: 12,
  })}, ${hslCss({ ...baseHsl, lightness: 96 })})`;

  const saturationColor = hslCss(baseHsl);
  const saturationGradient = `linear-gradient(to right, ${hslCss({
    ...baseHsl,
    saturation: 0,
  })}, ${hslCss({ ...baseHsl, saturation: 90 })})`;

  const previewColor = hslCss(baseHsl);

  return (
    <div className="flex flex-col gap-6">
      {/* 온도+밝기+채도 조합을 한눈에 보여주는 실시간 미리보기 칩 + 은은한 후광 */}
      <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
        <div
          aria-hidden
          className="h-16 w-16 shrink-0 rounded-2xl ring-1 ring-black/5 transition-colors duration-200"
          style={{
            backgroundColor: previewColor,
            boxShadow: `0 0 28px ${previewColor}`,
          }}
        />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-800">미리보기</span>
          <span className="text-xs text-gray-500">
            선택한 온도·밝기·채도로 만든 색이에요
          </span>
        </div>
      </div>

      <Slider
        id="color-temperature"
        label="색 온도"
        leftLabel="차가운"
        rightLabel="따뜻한"
        value={temperature}
        onChange={(color_temperature) => setSurvey({ color_temperature })}
        trackGradient={TEMPERATURE_GRADIENT}
        thumbColor={temperatureColor}
      />
      <Slider
        id="color-brightness"
        label="밝기"
        leftLabel="어두운"
        rightLabel="밝은"
        value={brightness}
        onChange={(color_brightness) => setSurvey({ color_brightness })}
        trackGradient={brightnessGradient}
        thumbColor={brightnessColor}
      />
      <Slider
        id="color-saturation"
        label="채도"
        leftLabel="탁한"
        rightLabel="선명한"
        value={saturation}
        onChange={(color_saturation) => setSurvey({ color_saturation })}
        trackGradient={saturationGradient}
        thumbColor={saturationColor}
      />
    </div>
  );
}
