import { create } from "zustand";
import { STORAGE_KEYS } from "@/lib/constants";
import { authApi } from "@/lib/api";
import type { UserInfo } from "@/types";

type AuthState = {
  user: UserInfo | null;
  isLoggedIn: boolean;
  hydrated: boolean;
  setUser: (user: UserInfo | null) => void;
  hydrate: () => Promise<void>;
  persistSession: (token: string, user?: UserInfo | null) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
  refreshUser: () => Promise<void>;
};

function writeClientCookie(name: string, value: string, maxAge = 60 * 60 * 24 * 30) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

function clearClientCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  hydrated: false,
  setUser: (user) => {
    set({ user, isLoggedIn: Boolean(user) });
    if (typeof window !== "undefined") {
      if (user) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEYS.user);
    }
  },
  hydrate: async () => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_KEYS.user);
        if (cached) {
          set({ user: JSON.parse(cached) as UserInfo, isLoggedIn: true });
        }
      } catch {
        /* ignore */
      }
    }
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const json = (await res.json()) as { loggedIn?: boolean };
      if (json.loggedIn) {
        await get().refreshUser();
        set({ isLoggedIn: true, hydrated: true });
      } else {
        get().clearSession();
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },
  persistSession: async (token, user) => {
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    writeClientCookie("mstoo_logged_in", "1");
    if (user) get().setUser(user);
    else await get().refreshUser();
    set({ isLoggedIn: true });
  },
  logout: async () => {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch {
      /* ignore */
    }
    get().clearSession();
  },
  clearSession: () => {
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEYS.user);
    clearClientCookie("mstoo_logged_in");
    set({ user: null, isLoggedIn: false });
  },
  refreshUser: async () => {
    try {
      const user = await authApi.info();
      get().setUser(user);
    } catch {
      /* guest or expired */
    }
  },
}));
