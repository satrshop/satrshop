import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdmin, logAdminActivity, AdminAuthError } from "@/lib/api/admin-auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    // Only superadmin can delete customers
    const adminUser = await verifyAdmin(req, "superadmin");
    const { phone } = await params;

    if (!phone) {
      return NextResponse.json({ error: "رقم الهاتف مطلوب" }, { status: 400 });
    }

    // Find all orders for this phone number
    const snapshot = await adminDb
      .collection("orders")
      .get();
      
    const batch = adminDb.batch();
    let deletedCount = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const orderPhone = (data.customer?.phone || '').replace(/\\D/g, '');
      const targetPhone = phone.replace(/\\D/g, '');
      
      if (orderPhone === targetPhone) {
        batch.delete(doc.ref);
        deletedCount++;
      }
    });

    if (deletedCount > 0) {
      await batch.commit();
      await logAdminActivity(
        adminUser,
        "delete_customer",
        `تم حذف زبون (رقم: ${phone}) بجميع طلباته (${deletedCount} طلب)`
      );
      return NextResponse.json({ success: true, deletedCount });
    } else {
      return NextResponse.json({ error: "لم يتم العثور على زبون بهذا الرقم" }, { status: 404 });
    }
  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
