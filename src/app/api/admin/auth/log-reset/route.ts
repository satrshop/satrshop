import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * POST /api/admin/auth/log-reset
 * Logs a password reset request without requiring authentication.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.email;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Verify if this email actually belongs to an admin before logging to prevent spam
    const adminsSnap = await adminDb
      .collection("admins")
      .where("email", "==", email.toLowerCase())
      .get();

    if (!adminsSnap.empty) {
      const adminData = adminsSnap.docs[0].data();
      await adminDb.collection("activity_logs").add({
        adminEmail: adminData.email,
        adminName: adminData.name || "مدير",
        action: "طلب إعادة تعيين كلمة المرور",
        details: `طلب هذا المدير إرسال رابط لاستعادة كلمة مروره إلى البريد الإلكتروني.`,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Log reset error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
