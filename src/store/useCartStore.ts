import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock?: number; // Optional to maintain compatibility, but should be passed
  selectedColor?: { name: string; code: string };
  selectedSize?: string;
}

/** 
 * Unique key for cart items that accounts for variants 
 */
export const getCartItemKey = (item: { id: string; selectedColor?: { code: string }; selectedSize?: string }) => {
  return `${item.id}-${item.selectedColor?.code || 'default'}-${item.selectedSize || 'default'}`;
};


interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
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
        const itemKey = getCartItemKey(item);
        const existingItem = currentItems.find((i) => getCartItemKey(i) === itemKey);
        const maxStock = item.stock ?? 999;
        
        if (existingItem) {
          const newQuantity = Math.min(existingItem.quantity + quantity, maxStock);
          set({
            items: currentItems.map((i) =>
              getCartItemKey(i) === itemKey ? { ...i, quantity: newQuantity } : i
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
      removeItem: (key) =>
        set((state) => ({
          items: state.items.filter((i) => getCartItemKey(i) !== key),
        })),
      updateQuantity: (key, quantity) =>
        set((state) => {
          const item = state.items.find(i => getCartItemKey(i) === key);
          if (!item) return state;
          
          const maxStock = item.stock ?? 999;
          const newQuantity = Math.min(Math.max(1, quantity), maxStock);
          
          return {
            items: state.items.map((i) =>
              getCartItemKey(i) === key ? { ...i, quantity: newQuantity } : i
            ),
          };
        }),
      clearCart: () => set({ items: [] }),
    }),
    { name: "satr-cart-storage" }
  )
);
