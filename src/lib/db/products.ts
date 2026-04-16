import { db } from "../firebase";
import { collection, getDocs, doc, getDoc, query, where, orderBy, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { Product } from "@/types/models/product";

const PRODUCTS_COLLECTION = "products";

export async function createProduct(productData: Omit<Product, "id">): Promise<string | null> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const docRef = await addDoc(productsRef, productData);
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

export async function getProducts(): Promise<Product[]> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef);
    const querySnapshot = await getDocs(q);
    
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
    
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
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
