import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function subscribeToPendingOrdersCount(callback: (count: number) => void) {
  const q = query(
    collection(db, "orders"),
    where("status", "==", "pending")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.size);
    },
    (error) => {
      console.error("Error subscribing to pending orders count:", error);
      callback(0); // Optionally handle errors
    }
  );
}
