import { create } from "zustand";
import type { AppConfig } from "@/types";
import { isFlagOn } from "@/lib/utils";

type ConfigState = {
  config: AppConfig | null;
  loading: boolean;
  error: string | null;
  setConfig: (config: AppConfig) => void;
  load: () => Promise<void>;
};

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: null,
  loading: false,
  error: null,
  setConfig: (config) => set({ config }),
  load: async () => {
    if (get().config || get().loading) return;
    set({ loading: true, error: null });
    try {
      const { configApi } = await import("@/lib/api");
      const config = await configApi.get();
      set({ config, loading: false });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : "Could not load app config",
      });
    }
  },
}));

export function useFlag(key: keyof AppConfig) {
  const config = useConfigStore((s) => s.config);
  return isFlagOn(config?.[key]);
}
