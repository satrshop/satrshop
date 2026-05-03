import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdmin, logAdminActivity, AdminAuthError } from "@/lib/api/admin-auth";

const PRODUCTS_COLLECTION = "products";
const DEFAULT_STOCK = 10;

/**
 * GET /api/admin/products — List all products (includes costPrice for admin).
 */
export async function GET(req: Request) {
  try {
    const admin = await verifyAdmin(req);

    const snapshot = await adminDb.collection(PRODUCTS_COLLECTION).get();
    const products = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        stock: typeof data.stock === "number" ? data.stock : DEFAULT_STOCK,
        costPrice: typeof data.costPrice === "number" ? data.costPrice : 0,
      };
    });

    return NextResponse.json({ products });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/products — Create a new product.
 */
export async function POST(req: Request) {
  try {
    const admin = await verifyAdmin(req);
    const body = await req.json();

    const { name, price, image, images, category, description, stock, costPrice, hasColors, colors, hasSizes, sizes, isBestSeller, isNew, isFeatured } = body;

    if (!name || typeof price !== "number" || !image || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const productData = {
      name,
      price,
      image,
      images: Array.isArray(images) ? images : [],
      category,
      rating: 0,
      description: description || "",
      stock: typeof stock === "number" ? stock : DEFAULT_STOCK,
      costPrice: typeof costPrice === "number" ? costPrice : 0,
      hasColors: !!hasColors,
      colors: Array.isArray(colors) ? colors : [],
      hasSizes: !!hasSizes,
      sizes: Array.isArray(sizes) ? sizes : [],
      isBestSeller: !!isBestSeller,
      isNew: typeof isNew === "boolean" ? isNew : true,
      isFeatured: !!isFeatured,
    };

    const docRef = await adminDb.collection(PRODUCTS_COLLECTION).add(productData);
    await logAdminActivity(admin, "إضافة منتج", `تمت إضافة منتج جديد: ${name}`);

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
