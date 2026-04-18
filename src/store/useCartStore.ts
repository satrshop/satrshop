import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock?: number; // Optional to maintain compatibility, but should be passed
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      addItem: (item, quantity = 1) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.id === item.id);
        const maxStock = item.stock ?? 999;
        
        if (existingItem) {
          const newQuantity = Math.min(existingItem.quantity + quantity, maxStock);
          set({
            items: currentItems.map((i) =>
              i.id === item.id ? { ...i, quantity: newQuantity } : i
            ),
            isOpen: true,
          });
        } else {
          set({ 
            items: [...currentItems, { ...item, quantity: Math.min(quantity, maxStock) }], 
            isOpen: true 
          });
        }
      },
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => {
          const item = state.items.find(i => i.id === id);
          if (!item) return state;
          
          const maxStock = item.stock ?? 999;
          const newQuantity = Math.min(Math.max(1, quantity), maxStock);
          
          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: newQuantity } : i
            ),
          };
        }),
      clearCart: () => set({ items: [] }),
    }),
    { name: "satr-cart-storage" }
  )
);
