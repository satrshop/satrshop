import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types/models/product";

interface WishlistState {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleWishlist: (product) => {
        const currentItems = get().items;
        const exists = currentItems.some((i) => i.id === product.id);
        
        if (exists) {
          set({
            items: currentItems.filter((i) => i.id !== product.id)
          });
        } else {
          set({
            items: [...currentItems, product]
          });
        }
      },
      isInWishlist: (id) => {
        return get().items.some((i) => i.id === id);
      },
      clearWishlist: () => set({ items: [] }),
    }),
    { name: "satr-wishlist-storage" }
  )
);
