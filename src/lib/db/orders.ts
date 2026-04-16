import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { Order } from "@/types/models/order";

const ORDERS_COLLECTION = "orders";

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
