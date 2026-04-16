export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  isNew?: boolean;
}

export const ALL_PRODUCTS: Product[] = [
  { id: "1", name: "هودي المبرمج (Dark Mode)", price: 29.90, image: "/images/img.png", category: "هوديز تقنية", rating: 4.9, isNew: true },
  { id: "2", name: "تيشرت 'console.log'", price: 14.90, image: "/images/background.png", category: "تيشرتات", rating: 4.7 },
  { id: "3", name: "سترة المطورين الشتوية", price: 39.90, image: "/images/img.png", category: "جواكيت", rating: 5.0, isNew: true },
  { id: "4", name: "هودي Python Edition", price: 28.90, image: "/images/background.png", category: "هوديز تقنية", rating: 4.8 },
  { id: "5", name: "حقيبة ظهر للمبرمجين", price: 19.90, image: "/images/img.png", category: "حقائب", rating: 4.6 },
  { id: "6", name: "تيشرت 'Bug fixes'", price: 12.90, image: "/images/background.png", category: "تيشرتات", rating: 4.5 },
  { id: "7", name: "قبعة سطر (كاب)", price: 8.90, image: "/images/img.png", category: "إكسسوارات", rating: 4.8, isNew: true },
  { id: "8", name: "جاكيت مبطن 'Open Source'", price: 45.00, image: "/images/background.png", category: "جواكيت", rating: 5.0 },
];

/**
 * Search products by query string.
 * Matches against product name and category (case-insensitive, Arabic-friendly).
 */
export function searchProducts(query: string): Product[] {
  if (!query.trim()) return [];
  const normalizedQuery = query.trim().toLowerCase();
  return ALL_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(normalizedQuery) ||
      p.category.toLowerCase().includes(normalizedQuery)
  );
}
