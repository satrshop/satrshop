import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdmin, AdminAuthError } from "@/lib/api/admin-auth";

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
