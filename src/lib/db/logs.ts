import { db, auth } from "../firebase";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, limit } from "firebase/firestore";
import { getAdminByEmail } from "./admins";

const LOGS_COLLECTION = "activity_logs";

export interface ActivityLog {
  id?: string;
  adminEmail: string;
  adminName: string;
  action: string;
  details: string;
  createdAt?: any;
}

/**
 * Logs an activity to the database.
 */
export async function logActivity(
  adminEmail: string,
  adminName: string,
  action: string,
  details: string
): Promise<void> {
  try {
    const logsRef = collection(db, LOGS_COLLECTION);
    await addDoc(logsRef, {
      adminEmail,
      adminName,
      action,
      details,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}

/**
 * Gets the most recent logs.
 */
export async function getRecentLogs(limitCount: number = 100): Promise<ActivityLog[]> {
  try {
    const logsRef = collection(db, LOGS_COLLECTION);
    const q = query(logsRef, orderBy("createdAt", "desc"), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    const logs: ActivityLog[] = [];
    querySnapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() } as ActivityLog);
    });
    return logs;
  } catch (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
}

/**
 * Logs an activity for the currently authenticated admin user.
 */
export async function logCurrentAdminActivity(action: string, details: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) return;
    
    let name = user.displayName || user.email;
    // Try to get the actual name from the admins collection
    const adminUser = await getAdminByEmail(user.email);
    if (adminUser) {
      name = adminUser.name;
    }

    await logActivity(user.email, name, action, details);
  } catch (error) {
    console.error("Error logging current admin activity:", error);
  }
}
