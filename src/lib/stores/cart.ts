import { create } from "zustand";
import { cartApi } from "@/lib/api";
import type { CartItem } from "@/types";

function unwrap(payload: unknown): CartItem[] | null {
  if (Array.isArray(payload)) return payload as CartItem[];
  if (!payload || typeof payload !== "object") return null;

  const body = payload as Record<string, unknown>;
  for (const key of ["data", "cart_items", "items"]) {
    if (Array.isArray(body[key])) return body[key] as CartItem[];
  }
  for (const key of ["content", "cart", "data"]) {
    const nested = body[key];
    if (nested && typeof nested === "object" && nested !== payload) {
      const items = unwrap(nested);
      if (items) return items;
    }
  }
  return null;
}

type CartState = {
  items: CartItem[];
  loading: boolean;
  load: () => Promise<void>;
  add: (body: Record<string, string>, optimisticItem?: CartItem) => Promise<void>;
  remove: (id: string) => Promise<void>;
  updateQty: (id: string, quantity: number) => Promise<void>;
  empty: () => Promise<void>;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  load: async () => {
    set({ loading: true });
    try {
      const data = await cartApi.list();
      const items = unwrap(data);
      set((state) => ({ items: items ?? state.items, loading: false }));
    } catch {
      set({ loading: false });
    }
  },
  add: async (body, optimisticItem) => {
    await cartApi.add(body);
    if (optimisticItem) {
      set((state) => {
        const existing = state.items.findIndex(
          (item) =>
            item.service_id === optimisticItem.service_id &&
            item.variant_key === optimisticItem.variant_key,
        );
        if (existing < 0) return { items: [...state.items, optimisticItem] };
        const items = [...state.items];
        items[existing] = {
          ...items[existing],
          quantity: Number(items[existing].quantity ?? 1) + 1,
        };
        return { items };
      });
    }
    await get().load();
  },
  remove: async (id) => {
    await cartApi.remove(id);
    set({ items: get().items.filter((item) => item.id !== id) });
  },
  updateQty: async (id, quantity) => {
    await cartApi.updateQty(id, quantity);
    await get().load();
  },
  empty: async () => {
    await cartApi.empty();
    set({ items: [] });
  },
}));
