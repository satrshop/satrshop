import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

/**
 * POST /api/admin/auth/register — Server-side admin registration.
 * Validates the email is in the admins collection with "pending" status,
 * then activates the admin account.
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!decodedToken.email) {
      return NextResponse.json({ error: "Token has no email" }, { status: 401 });
    }

    const email = decodedToken.email.toLowerCase();

    // Check admins collection for pending entry
    const adminDocs = await adminDb
      .collection("admins")
      .where("email", "==", email)
      .get();

    if (adminDocs.empty) {
      return NextResponse.json(
        { error: "هذا البريد الإلكتروني غير مسجل ضمن فريق الإدارة." },
        { status: 403 }
      );
    }

    const adminDoc = adminDocs.docs[0];
    const adminData = adminDoc.data();

    if (adminData.status === "active") {
      return NextResponse.json(
        { error: "هذا الحساب مفعل مسبقاً." },
        { status: 409 }
      );
    }

    // Activate the admin
    await adminDoc.ref.update({ status: "active" });

    // Log the activity
    await adminDb.collection("activity_logs").add({
      adminEmail: email,
      adminName: adminData.name || email,
      action: "تفعيل حساب جديد",
      details: "تم تفعيل حساب المدير بنجاح",
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ أثناء التسجيل." }, { status: 500 });
  }
}
