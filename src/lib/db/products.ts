import { db } from "../firebase";
import { collection, getDocs, doc, getDoc, query, addDoc, updateDoc, deleteDoc, increment, DocumentSnapshot } from "firebase/firestore";
import { Product, DEFAULT_STOCK } from "@/types/models/product";

const PRODUCTS_COLLECTION = "products";

/**
 * Normalizes a Firestore document into a Product, ensuring `stock` has a value.
 * Products that predate the stock field get DEFAULT_STOCK.
 */
/**
 * Normalizes a Firestore document into a Product, ensuring `stock` has a value.
 * Products that predate the stock field get DEFAULT_STOCK.
 */
function docToProduct(docSnap: DocumentSnapshot, includeSensitive: boolean = false): Product {
  const data = docSnap.data() || {};
  const product = {
    id: docSnap.id,
    ...data,
    stock: typeof data.stock === "number" ? data.stock : DEFAULT_STOCK,
  } as Product;

  // Protect sensitive financial data unless explicitly requested
  if (!includeSensitive) {
    delete (product as Partial<Product> & { costPrice?: number }).costPrice;
  } else {
    product.costPrice = typeof data.costPrice === "number" ? data.costPrice : 0;
  }

  return product;
}

export async function createProduct(productData: Omit<Product, "id">): Promise<string | null> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const docRef = await addDoc(productsRef, {
      ...productData,
      stock: productData.stock ?? DEFAULT_STOCK,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating product:", error);
    return null;
  }
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<boolean> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(docRef, productData);
    return true;
  } catch (error) {
    console.error("Error updating product:", error);
    return false;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    return false;
  }
}

export async function getProducts(includeSensitive: boolean = false): Promise<Product[]> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef);
    const querySnapshot = await getDocs(q);

    const products: Product[] = [];
    querySnapshot.forEach((docSnap) => {
      products.push(docToProduct(docSnap, includeSensitive));
    });

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductById(id: string, includeSensitive: boolean = false): Promise<Product | null> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docToProduct(docSnap, includeSensitive);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

/**
 * Update the stock quantity for a single product.
 */
export async function updateStock(productId: string, newStock: number): Promise<boolean> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(docRef, { stock: Math.max(0, newStock) });
    return true;
  } catch (error) {
    console.error("Error updating stock:", error);
    return false;
  }
}

/**
 * Decrement stock for multiple products at once (used after placing an order).
 * Uses Firestore `increment()` for atomic operations.
 * Returns true if all updates succeed.
 */
export async function decrementStockForItems(items: { id: string; quantity: number }[]): Promise<boolean> {
  try {
    const updatePromises = items.map((item) => {
      const docRef = doc(db, PRODUCTS_COLLECTION, item.id);
      return updateDoc(docRef, { stock: increment(-item.quantity) });
    });
    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error("Error decrementing stock:", error);
    return false;
  }
}

/**
 * Add stock back for multiple products (used when an order is cancelled).
 */
export async function incrementStockForItems(items: { id: string; quantity: number }[]): Promise<boolean> {
  try {
    const updatePromises = items.map((item) => {
      const docRef = doc(db, PRODUCTS_COLLECTION, item.id);
      return updateDoc(docRef, { stock: increment(item.quantity) });
    });
    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error("Error incrementing stock:", error);
    return false;
  }
}

/**
 * Check if all items in the cart have sufficient stock.
 * Returns an array of items that are out of stock or have insufficient quantity.
 */
export async function validateStock(items: { id: string; quantity: number; name: string }[]): Promise<{ id: string; name: string; requested: number; available: number }[]> {
  const insufficientItems: { id: string; name: string; requested: number; available: number }[] = [];

  for (const item of items) {
    const product = await getProductById(item.id);
    if (!product || product.stock < item.quantity) {
      insufficientItems.push({
        id: item.id,
        name: item.name,
        requested: item.quantity,
        available: product?.stock ?? 0,
      });
    }
  }

  return insufficientItems;
}

/**
 * Perform a search on products.
 * For small catalogs, we fetch all and filter client-side.
 * For large catalogs, we should use a proper search index or Firestore filters.
 */
export async function searchProductsRemote(queryString: string): Promise<Product[]> {
  if (!queryString.trim()) return [];

  const all = await getProducts();
  const lower = queryString.trim().toLowerCase();

  return all.filter(p =>
    p.name.toLowerCase().includes(lower) ||
    p.category.toLowerCase().includes(lower)
  );
}

/**
 * Fetches unique categories from all existing products.
 */
export async function getCategories(): Promise<string[]> {
  try {
    const products = await getProducts();
    const categories = Array.from(new Set(products.map(p => p.category)));
    // Default categories if list is empty
    const defaults = ["هوديز", "تيشرتات", "جواكيت", "حقائب", "إكسسوارات"];
    return Array.from(new Set([...defaults, ...categories])).filter(Boolean);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return ["هوديز", "تيشرتات", "جواكيت", "حقائب", "إكسسوارات"];
  }
}
