import { db } from "../firebase";
import { collection, getDocs, doc, getDoc, query, DocumentSnapshot } from "firebase/firestore";
import { Product, DEFAULT_STOCK } from "@/types/models/product";

const PRODUCTS_COLLECTION = "products";

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

/**
 * Fetches all products from Firestore (read-only via Client SDK).
 * Write operations are handled exclusively via Admin SDK in API routes.
 */
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
    // Default categories that should always show
    const defaults = ["أجندة", "ستيكر", "بروش", "إكسسوارات"];
    
    // Combine defaults with existing categories, but explicitly filter out the ones user wants removed
    const unwanted = ["هوديز", "تيشرتات", "جواكيت", "حقائب", "هوديز تقنية"];
    
    const combined = Array.from(new Set([...defaults, ...categories]));
    return combined.filter(cat => cat && !unwanted.includes(cat));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return ["أجندة", "ستيكر", "بروش", "إكسسوارات"];
  }
}
