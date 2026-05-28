// app/store/useToneStore.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const INITIAL_INTENSITY = 50;

export const useToneStore = create(
  persist(
    (set) => ({
      appDescription: "",
      recommendedTones: [],
      selectedTone: null,
      intensity: INITIAL_INTENSITY,

      setAppDescription: (appDescription) => set({ appDescription }),
      setRecommendedTones: (recommendedTones) => set({ recommendedTones }),
      setSelectedTone: (selectedTone) => set({ selectedTone }),
      setIntensity: (intensity) => set({ intensity }),

      resetTones: () =>
        set({
          recommendedTones: [],
          selectedTone: null,
          intensity: INITIAL_INTENSITY,
        }),
    }),
    {
      name: "hueist-tone-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        appDescription: state.appDescription,
        recommendedTones: state.recommendedTones,
        selectedTone: state.selectedTone,
        intensity: state.intensity,
      }),
    },
  ),
);
