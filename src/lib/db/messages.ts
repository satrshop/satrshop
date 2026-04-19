import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc,
  doc, 
  query, 
  orderBy, 
  serverTimestamp,
  onSnapshot,
  where
} from "firebase/firestore";
import { db } from "../firebase";
import { ContactMessage } from "@/types/models/message";

const COLLECTION_NAME = "messages";

/**
 * Subscribes to the count of unread messages.
 */
export function subscribeToUnreadCount(callback: (count: number) => void) {
  const q = query(collection(db, COLLECTION_NAME), where("isRead", "==", false));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  });
}

export async function sendMessage(message: Omit<ContactMessage, "id" | "createdAt" | "isRead">) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...message,
      isRead: false,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
}

export async function getMessages(): Promise<ContactMessage[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ContactMessage[];
  } catch (error) {
    console.error("Error getting messages:", error);
    return [];
  }
}

export async function deleteMessage(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return true;
  } catch (error) {
    console.error("Error deleting message:", error);
    return false;
  }
}

export async function markMessageAsRead(id: string, isRead: boolean = true) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { isRead });
    return true;
  } catch (error) {
    console.error("Error updating message status:", error);
    return false;
  }
}
