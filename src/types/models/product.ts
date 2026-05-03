export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[]; // Array of all images
  category: string;
  rating: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  description?: string;
  stock: number; // Available quantity. 0 = out of stock
  costPrice?: number; // The cost to the shop for this product (admin only)
  hasColors?: boolean;
  colors?: { name: string; code: string }[];
  hasSizes?: boolean;
  sizes?: string[];
}

/** Default stock value for products that don't have stock set in DB yet */
export const DEFAULT_STOCK = 10;
