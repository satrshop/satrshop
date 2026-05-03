import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Increment the views counter using FieldValue.increment
    // We use adminDb to bypass normal client security rules
    const docRef = adminDb.collection("products").doc(id);
    await docRef.update({
      views: FieldValue.increment(1)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to increment views:", error);
    // Even if it fails, we return a 200 so we don't break the client app
    // Analytics failures should not impact user experience
    return NextResponse.json({ success: false });
  }
}
