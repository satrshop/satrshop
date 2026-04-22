import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdmin, logAdminActivity, AdminAuthError } from "@/lib/api/admin-auth";

const ADMINS_COLLECTION = "admins";

/**
 * GET /api/admin/team — List all admins. Requires superadmin role.
 */
export async function GET(req: Request) {
  try {
    await verifyAdmin(req, "superadmin");

    const snapshot = await adminDb.collection(ADMINS_COLLECTION).get();
    const admins = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ admins });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/team — Add a new admin (pending status). Requires superadmin.
 */
export async function POST(req: Request) {
  try {
    const admin = await verifyAdmin(req, "superadmin");
    const body = await req.json();

    const { email, name, role } = body;

    if (!email || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validRoles = ["admin", "superadmin"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check for existing admin with this email
    const existing = await adminDb
      .collection(ADMINS_COLLECTION)
      .where("email", "==", email.toLowerCase())
      .get();

    if (!existing.empty) {
      return NextResponse.json({ error: "Admin with this email already exists" }, { status: 409 });
    }

    const docRef = await adminDb.collection(ADMINS_COLLECTION).add({
      email: email.toLowerCase(),
      name,
      role,
      status: "pending",
      createdAt: new Date(),
    });

    await logAdminActivity(admin, "إضافة مدير", `تم إضافة مدير جديد (${role}): ${email}`);

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
