import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdmin, logAdminActivity, AdminAuthError } from "@/lib/api/admin-auth";

const PRODUCTS_COLLECTION = "products";

/**
 * GET /api/admin/products/[id] — Get a single product (with costPrice).
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    const { id } = await params;

    const doc = await adminDb.collection(PRODUCTS_COLLECTION).doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const data = doc.data()!;
    return NextResponse.json({
      product: {
        id: doc.id,
        ...data,
        costPrice: typeof data.costPrice === "number" ? data.costPrice : 0,
      },
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/products/[id] — Update a product.
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    const { id } = await params;
    const body = await req.json();

    const docRef = adminDb.collection(PRODUCTS_COLLECTION).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await docRef.update(body);
    await logAdminActivity(admin, "تعديل منتج", `تم تعديل منتج: ${body.name || id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/products/[id] — Delete a product.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    const { id } = await params;

    const docRef = adminDb.collection(PRODUCTS_COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const productName = doc.data()?.name || id;
    await docRef.delete();
    await logAdminActivity(admin, "حذف منتج", `تم حذف المنتج: ${productName}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
