import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, getDocs, query, where, orderBy, updateDoc } from "firebase/firestore";
import { Order } from "@/types/models/order";

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
    await updateDoc(docRef, { status });
    return true;
  } catch (error) {
    console.error("Error updating order status:", error);
    return false;
  }
}

export async function createOrder(orderData: Omit<Order, "id" | "createdAt" | "status">): Promise<string | null> {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    
    const newOrder = {
      ...orderData,
      status: "pending",
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(ordersRef, newOrder);
    return docRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    return null;
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
