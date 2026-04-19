import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, getDocs, query, orderBy, updateDoc } from "firebase/firestore";
import { Order } from "@/types/models/order";
import { decrementStockForItems, incrementStockForItems, validateStock } from "./products";

const ORDERS_COLLECTION = "orders";

export async function getOrders(): Promise<Order[]> {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    
    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<boolean> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    const orderSnap = await getDoc(docRef);
    
    if (!orderSnap.exists()) return false;
    
    const orderData = orderSnap.data() as Order;
    const currentStatus = orderData.status;

    // If status is being changed to cancelled, return the stock
    if (status === "cancelled" && currentStatus !== "cancelled") {
      await incrementStockForItems(
        orderData.items.map(item => ({ id: item.id, quantity: item.quantity }))
      );
    }
    
    // If status is being changed FROM cancelled back to something else, decrement stock
    if (currentStatus === "cancelled" && status !== "cancelled") {
      await decrementStockForItems(
        orderData.items.map(item => ({ id: item.id, quantity: item.quantity }))
      );
    }

    await updateDoc(docRef, { status });
    return true;
  } catch (error) {
    console.error("Error updating order status:", error);
    return false;
  }
}

/**
 * Create a new order and automatically decrement product stock.
 * Validates stock availability before creating the order.
 * Returns the order ID on success, or throws an error with details.
 */
export async function createOrder(orderData: Omit<Order, "id" | "createdAt" | "status">): Promise<string | null> {
  try {
    // 1. Validate stock before creating the order
    const insufficientItems = await validateStock(
      orderData.items.map(item => ({ id: item.id, quantity: item.quantity, name: item.name }))
    );

    if (insufficientItems.length > 0) {
      const itemNames = insufficientItems.map(i => `${i.name} (المتاح: ${i.available})`).join("، ");
      throw new Error(`INSUFFICIENT_STOCK:${itemNames}`);
    }

    // 2. Create the order with costPrice snapshots
    const itemsWithCost = await Promise.all(
      orderData.items.map(async (item) => {
        const product = await doc(db, "products", item.id);
        const productSnap = await getDoc(product);
        const costPrice = productSnap.exists() ? (productSnap.data().costPrice ?? 0) : 0;
        return { ...item, costPrice };
      })
    );

    const ordersRef = collection(db, ORDERS_COLLECTION);
    const newOrder = {
      ...orderData,
      items: itemsWithCost,
      status: "pending",
      createdAt: serverTimestamp(),
    };
    
    // Sanitize data to remove undefined values which Firebase doesn't support
    const sanitizedOrder = sanitizeFirestoreData(newOrder);
    
    const docRef = await addDoc(ordersRef, sanitizedOrder);

    // 3. Decrement stock for all items
    await decrementStockForItems(
      orderData.items.map(item => ({ id: item.id, quantity: item.quantity }))
    );

    return docRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error; // Re-throw to let the checkout page handle it
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Order;
    }
    return null;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

/**
 * Recursively removes undefined values from an object to make it safe for Firestore.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeFirestoreData(data: any): any {
  if (Array.isArray(data)) {
    return data.map(v => sanitizeFirestoreData(v));
  }
  
  if (data !== null && typeof data === 'object' && !(data instanceof Date) && !(data.constructor?.name === 'Timestamp') && !(data.constructor?.name === 'FieldValue')) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newObj: any = {};
    Object.keys(data).forEach(key => {
      const val = sanitizeFirestoreData(data[key]);
      if (val !== undefined) {
        newObj[key] = val;
      }
    });
    return newObj;
  }
  
  return data;
}
