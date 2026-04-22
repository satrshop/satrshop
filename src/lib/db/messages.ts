import { 
  collection, 
  query, 
  onSnapshot,
  where
} from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION_NAME = "messages";

/**
 * Subscribes to the count of unread messages (real-time listener).
 * This is the only client-side operation needed for messages.
 * All other message operations (create, read, update, delete) are handled
 * exclusively via Admin SDK in API routes.
 */
export function subscribeToUnreadCount(callback: (count: number) => void) {
  const q = query(collection(db, COLLECTION_NAME), where("isRead", "==", false));
  return onSnapshot(q, 
    (snapshot) => {
      callback(snapshot.size);
    }, 
    (error) => {
      // Ignore permission-denied errors that happen during logout/auth transitions
      if (error.code !== "permission-denied") {
        console.error("Messages listener error:", error);
      }
    }
  );
}
