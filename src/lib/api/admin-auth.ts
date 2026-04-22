import { adminAuth, adminDb } from "@/lib/firebase-admin";

export interface VerifiedAdmin {
  uid: string;
  email: string;
  name: string;
  role: "superadmin" | "admin";
}

/**
 * Verifies the request comes from an authenticated, active admin.
 * Optionally checks for a specific role (e.g. "superadmin").
 * 
 * Usage in API routes:
 *   const admin = await verifyAdmin(req);           // any active admin
 *   const admin = await verifyAdmin(req, "superadmin"); // superadmin only
 */
export async function verifyAdmin(
  req: Request,
  requiredRole?: "superadmin"
): Promise<VerifiedAdmin> {
  // 1. Extract Bearer token
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AdminAuthError("Unauthorized - No token provided", 401);
  }

  const token = authHeader.split("Bearer ")[1];

  // 2. Verify with Firebase Auth
  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch {
    throw new AdminAuthError("Unauthorized - Invalid token", 401);
  }

  if (!decodedToken.email) {
    throw new AdminAuthError("Unauthorized - Token has no email", 401);
  }

  // 3. Check admins collection for active status
  const adminDocs = await adminDb
    .collection("admins")
    .where("email", "==", decodedToken.email.toLowerCase())
    .get();

  if (adminDocs.empty) {
    throw new AdminAuthError("Forbidden - Not an admin", 403);
  }

  const adminData = adminDocs.docs[0].data();

  if (adminData.status !== "active") {
    throw new AdminAuthError("Forbidden - Admin account is inactive", 403);
  }

  // 4. Check role if required
  if (requiredRole && adminData.role !== requiredRole) {
    throw new AdminAuthError("Forbidden - Insufficient permissions", 403);
  }

  return {
    uid: decodedToken.uid,
    email: decodedToken.email,
    name: adminData.name || decodedToken.email,
    role: adminData.role,
  };
}

/**
 * Custom error class for admin auth failures with HTTP status codes.
 */
export class AdminAuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminAuthError";
    this.status = status;
  }
}

/**
 * Logs an admin activity using the Admin SDK.
 * Call this from API routes after performing privileged operations.
 */
export async function logAdminActivity(
  admin: VerifiedAdmin,
  action: string,
  details: string
): Promise<void> {
  try {
    await adminDb.collection("activity_logs").add({
      adminEmail: admin.email,
      adminName: admin.name,
      action,
      details,
      createdAt: new Date(),
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error logging admin activity:", error);
    }
  }
}
