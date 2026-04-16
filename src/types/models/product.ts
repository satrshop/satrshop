export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  isNew?: boolean;
  description?: string;
  inStock?: boolean;
}
