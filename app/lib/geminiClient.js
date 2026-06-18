// Gemini 호출 공용 클라이언트.
// Google Gemini API는 모델 과부하 시 503(UNAVAILABLE)·429(RESOURCE_EXHAUSTED)를
// 간헐적으로 돌려준다("이전엔 됐는데 지금은 안 됨"의 정체). 이런 일시 오류는
// 코드 버그가 아니므로 짧은 지수 백오프로 자동 재시도해 성공률을 끌어올린다.

const RETRYABLE_STATUS = new Set([429, 500, 503]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 단일 모델을 재시도와 함께 호출한다.
async function callModelWithRetry(model, payload, maxAttempts) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  let lastResult = { ok: false, status: 0, data: null };

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);
      lastResult = { ok: response.ok, status: response.status, data };

      if (response.ok) return lastResult;

      // 재시도 불가능한 오류(400/401/403/404 등)는 즉시 반환한다.
      if (!RETRYABLE_STATUS.has(response.status)) return lastResult;
    } catch (error) {
      // 네트워크 단절 등 fetch 자체 실패도 재시도 대상으로 본다.
      lastResult = { ok: false, status: 0, data: { error: { message: String(error) } } };
    }

    // 마지막 시도였다면 더 기다리지 않고 종료.
    if (attempt === maxAttempts) break;

    // 지수 백오프 + 지터: 0.6s, 1.2s, 2.4s ...
    const backoff = 600 * 2 ** (attempt - 1);
    const jitter = Math.floor(Math.random() * 300);
    await sleep(backoff + jitter);
  }

  return lastResult;
}

/**
 * Gemini generateContent 를 재시도 + 모델 폴백과 함께 호출한다.
 * 첫 모델이 재시도 후에도 과부하(503/429)면 다음 모델로 넘어간다.
 * @param {object} opts
 * @param {string} [opts.model]              - 단일 모델(하위 호환). 예: "gemini-2.5-flash"
 * @param {string[]} [opts.models]           - 폴백 순서대로의 모델 목록. model 보다 우선.
 * @param {object} opts.payload              - generateContent 요청 바디(JSON 직렬화 전)
 * @param {number} [opts.maxAttempts=3]      - 모델당 시도 횟수(최초 1회 + 재시도)
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function callGemini({ model, models, payload, maxAttempts = 3 }) {
  const chain = Array.isArray(models) && models.length > 0 ? models : [model];

  let lastResult = { ok: false, status: 0, data: null };

  for (const m of chain) {
    lastResult = await callModelWithRetry(m, payload, maxAttempts);
    if (lastResult.ok) return lastResult;
    // 과부하가 아닌(재시도 불가) 오류면 다음 모델로 넘어가도 의미 없으니 중단.
    if (!RETRYABLE_STATUS.has(lastResult.status)) return lastResult;
  }

  return lastResult;
}
