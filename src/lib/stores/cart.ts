import { create } from "zustand";
import { cartApi } from "@/lib/api";
import type { CartItem, Paginated } from "@/types";

function unwrap(list: Paginated<CartItem> | CartItem[] | undefined): CartItem[] {
  if (!list) return [];
  if (Array.isArray(list)) return list;
  return list.data ?? [];
}

type CartState = {
  items: CartItem[];
  loading: boolean;
  load: () => Promise<void>;
  add: (body: Record<string, string>) => Promise<void>;
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
      set({ items: unwrap(data), loading: false });
    } catch {
      set({ loading: false });
    }
  },
  add: async (body) => {
    await cartApi.add(body);
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
