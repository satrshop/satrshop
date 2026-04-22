import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdmin, logAdminActivity, AdminAuthError } from "@/lib/api/admin-auth";

/**
 * GET /api/admin/logs — List recent activity logs. Requires superadmin.
 */
export async function GET(req: Request) {
  try {
    await verifyAdmin(req, "superadmin");

    const url = new URL(req.url);
    const limitCount = Math.min(parseInt(url.searchParams.get("limit") || "100"), 500);

    const snapshot = await adminDb
      .collection("activity_logs")
      .orderBy("createdAt", "desc")
      .limit(limitCount)
      .get();

    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ logs });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/logs — Clear all activity logs. Requires superadmin.
 */
export async function DELETE(req: Request) {
  try {
    const admin = await verifyAdmin(req, "superadmin");

    // Delete all docs in batches of 500
    const logsRef = adminDb.collection("activity_logs");
    let deleted = 0;

    while (true) {
      const snapshot = await logsRef.limit(500).get();
      if (snapshot.empty) break;

      const batch = adminDb.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      deleted += snapshot.size;
    }

    // Log the clear action itself
    await logAdminActivity(admin, "تنظيف السجل", `تم حذف ${deleted} سجل نشاط`);

    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
