export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  isNew?: boolean;
  description?: string;
  stock: number; // Available quantity. 0 = out of stock
  costPrice?: number; // The cost to the shop for this product (admin only)
}

/** Default stock value for products that don't have stock set in DB yet */
export const DEFAULT_STOCK = 10;
