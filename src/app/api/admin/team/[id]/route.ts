import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdmin, logAdminActivity, AdminAuthError } from "@/lib/api/admin-auth";

const ADMINS_COLLECTION = "admins";

/**
 * DELETE /api/admin/team/[id] — Delete an admin. Requires superadmin.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req, "superadmin");
    const { id } = await params;

    const docRef = adminDb.collection(ADMINS_COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const deletedEmail = doc.data()?.email || id;
    await docRef.delete();
    await logAdminActivity(admin, "حذف مدير", `تم حذف المدير: ${deletedEmail}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
