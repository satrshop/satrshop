import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdmin, AdminAuthError } from "@/lib/api/admin-auth";

/**
 * GET /api/admin/messages — List all messages (sorted by createdAt desc).
 */
export async function GET(req: Request) {
  try {
    await verifyAdmin(req);

    const snapshot = await adminDb
      .collection("messages")
      .orderBy("createdAt", "desc")
      .get();

    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ messages });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
