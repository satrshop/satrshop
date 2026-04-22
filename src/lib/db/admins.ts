import { db } from "../firebase";
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, serverTimestamp } from "firebase/firestore";

const ADMINS_COLLECTION = "admins";

export interface AdminUser {
  id?: string;
  email: string;
  name: string;
  role: "superadmin" | "admin";
  status: "active" | "pending";
  createdAt?: any;
}

/**
 * Initializes the first superadmin if the collection is empty.
 */
export async function initializeSuperAdmin(email: string = "satrshopp@gmail.com"): Promise<void> {
  try {
    const adminsRef = collection(db, ADMINS_COLLECTION);
    const q = query(adminsRef);
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      await addDoc(adminsRef, {
        email: email.toLowerCase(),
        name: "المدير الرئيسي",
        role: "superadmin",
        status: "active",
        createdAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Error initializing superadmin:", error);
  }
}

/**
 * Gets an admin by email. Useful for login validation.
 */
export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  try {
    const adminsRef = collection(db, ADMINS_COLLECTION);
    const q = query(adminsRef, where("email", "==", email.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as AdminUser;
    }
    return null;
  } catch (error) {
    console.error("Error fetching admin by email:", error);
    return null;
  }
}

/**
 * Gets all admins.
 */
export async function getAllAdmins(): Promise<AdminUser[]> {
  try {
    const adminsRef = collection(db, ADMINS_COLLECTION);
    const querySnapshot = await getDocs(adminsRef);
    
    const admins: AdminUser[] = [];
    querySnapshot.forEach((doc) => {
      admins.push({ id: doc.id, ...doc.data() } as AdminUser);
    });
    return admins;
  } catch (error) {
    console.error("Error fetching admins:", error);
    return [];
  }
}

/**
 * Adds a new admin (pending state).
 */
export async function addAdmin(data: Omit<AdminUser, "id" | "createdAt">): Promise<string | null> {
  try {
    const existing = await getAdminByEmail(data.email);
    if (existing) throw new Error("Admin already exists");

    const adminsRef = collection(db, ADMINS_COLLECTION);
    const docRef = await addDoc(adminsRef, {
      ...data,
      email: data.email.toLowerCase(),
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding admin:", error);
    return null;
  }
}

/**
 * Updates an admin's status or role.
 */
export async function updateAdmin(id: string, data: Partial<AdminUser>): Promise<boolean> {
  try {
    const docRef = doc(db, ADMINS_COLLECTION, id);
    await updateDoc(docRef, data);
    return true;
  } catch (error) {
    console.error("Error updating admin:", error);
    return false;
  }
}

/**
 * Deletes an admin.
 */
export async function deleteAdmin(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, ADMINS_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting admin:", error);
    return false;
  }
}
