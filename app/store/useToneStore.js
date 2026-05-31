// app/store/useToneStore.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { INITIAL_SURVEY } from "../components/survey/surveyConstants";

const INITIAL_INTENSITY = 50;

export const useToneStore = create(
  persist(
    (set, get) => ({
      // STEP 1 구조화 설문 답변. /api/recommend 로 전송되는 1차 입력.
      survey: { ...INITIAL_SURVEY },
      // @deprecated 자유입력 단일 문자열. 구조화 설문(survey)으로 대체됨.
      // 하위 호환을 위해 필드와 setter는 유지하되 신규 코드에서는 사용하지 않는다.
      appDescription: "",
      recommendedTones: [],
      selectedTone: null,
      intensity: INITIAL_INTENSITY,
      isEnriching: false,
      enrichError: null,
      // 생성형 UI(react-live 로 렌더할 JSX 코드 문자열) 상태.
      generatedUiCode: null,
      isGeneratingUi: false,
      generateUiError: null,

      // 설문 답변을 부분 병합한다. patch는 survey의 일부 필드만 담아도 된다.
      setSurvey: (patch) =>
        set((state) => ({ survey: { ...state.survey, ...patch } })),
      resetSurvey: () => set({ survey: { ...INITIAL_SURVEY } }),

      setAppDescription: (appDescription) => set({ appDescription }),
      setRecommendedTones: (recommendedTones) => set({ recommendedTones }),
      setSelectedTone: (selectedTone) => set({ selectedTone }),
      setIntensity: (intensity) => set({ intensity }),

      resetTones: () =>
        set({
          recommendedTones: [],
          selectedTone: null,
          intensity: INITIAL_INTENSITY,
          isEnriching: false,
          enrichError: null,
          generatedUiCode: null,
          isGeneratingUi: false,
          generateUiError: null,
        }),

      // Phase 2: Deep Dive Enrichment.
      // Phase 1에서 받은 가벼운 톤을 서버로 보내 typography/icon_set/mood_images 등이
      // 채워진 Master JSON으로 교체한다. 성공/실패 모두에서 isEnriching은 반드시 false.
      enrichSelectedTone: async (tone) => {
        if (!tone) {
          set({ enrichError: "선택된 톤이 없어요." });
          return null;
        }

        // 낙관적으로 selectedTone을 먼저 세팅해두면, 실패해도 사용자가 어떤 톤을
        // 고른 상태였는지 컨텍스트가 유지된다.
        // 톤이 바뀌면 이전 톤으로 생성한 UI 코드는 더 이상 유효하지 않으니 비운다.
        set({
          isEnriching: true,
          enrichError: null,
          selectedTone: tone,
          generatedUiCode: null,
          generateUiError: null,
        });

        try {
          const response = await fetch("/api/enrich", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tone }),
          });

          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(
              data?.error ?? "디자인 자산 보강에 실패했어요. 다시 시도해주세요.",
            );
          }

          const masterJson = await response.json();
          set({ selectedTone: masterJson, isEnriching: false });
          return masterJson;
        } catch (error) {
          set({
            isEnriching: false,
            enrichError:
              error?.message ?? "디자인 자산 보강에 실패했어요.",
          });
          throw error;
        }
      },

      // 생성형 UI: 현재 selectedTone(보강 완료) + 설문 맥락을 서버로 보내
      // react-live 로 렌더할 단일 화면 JSX 코드를 받아온다.
      // enrich 와 분리돼 있어 같은 톤에서 "다시 생성"으로 반복 호출할 수 있다.
      generateUi: async () => {
        const { selectedTone, survey } = get();
        if (!selectedTone?.colors) {
          set({ generateUiError: "먼저 톤을 선택해주세요." });
          return null;
        }

        set({ isGeneratingUi: true, generateUiError: null });

        try {
          const response = await fetch("/api/generate-ui", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tone: selectedTone, survey }),
          });

          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(
              data?.error ?? "UI 생성에 실패했어요. 다시 시도해주세요.",
            );
          }

          const { code } = await response.json();
          set({ generatedUiCode: code, isGeneratingUi: false });
          return code;
        } catch (error) {
          set({
            isGeneratingUi: false,
            generateUiError: error?.message ?? "UI 생성에 실패했어요.",
          });
          throw error;
        }
      },
    }),
    {
      name: "hueist-tone-store",
      storage: createJSONStorage(() => localStorage),
      // isEnriching/enrichError는 휘발성 UI 상태라 persist 대상에서 제외.
      partialize: (state) => ({
        survey: state.survey,
        appDescription: state.appDescription,
        recommendedTones: state.recommendedTones,
        selectedTone: state.selectedTone,
        intensity: state.intensity,
      }),
    },
  ),
);
