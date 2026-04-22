import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdmin, logAdminActivity, AdminAuthError } from "@/lib/api/admin-auth";

/**
 * POST /api/admin/auth/login — Server-side login verification + superadmin init.
 * Called after Firebase Auth signInWithEmailAndPassword succeeds on the client.
 */
export async function POST(req: Request) {
  try {
    // Parse body to check if this is an actual login (vs session verification)
    let isLogin = false;
    try {
      const body = await req.json();
      isLogin = body?.isLogin === true;
    } catch {
      // No body or invalid JSON — this is a session verification call
    }

    const admin = await verifyAdmin(req);

    // Initialize superadmin if admins collection is empty
    if (admin.email.toLowerCase() === "satrshopp@gmail.com") {
      const adminsSnap = await adminDb.collection("admins").get();
      if (adminsSnap.empty) {
        await adminDb.collection("admins").add({
          email: "satrshopp@gmail.com",
          name: "المدير الرئيسي",
          role: "superadmin",
          status: "active",
          createdAt: new Date(),
        });
      }
    }

    // Log login activity only for actual logins (not session verifications)
    if (isLogin) {
      await logAdminActivity(admin, "تسجيل دخول", "تم تسجيل الدخول للوحة التحكم بنجاح");
    }

    return NextResponse.json({
      success: true,
      admin: { email: admin.email, name: admin.name, role: admin.role },
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
