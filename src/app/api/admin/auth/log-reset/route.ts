import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// In-memory rate limiting (max 3 reset requests per IP per 10 minutes)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 3;

/**
 * POST /api/admin/auth/log-reset
 * Logs a password reset request without requiring authentication.
 */
export async function POST(req: Request) {
  try {
    // Rate limiting by IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (entry && now < entry.resetTime) {
      if (entry.count >= RATE_LIMIT_MAX) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }
      entry.count += 1;
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }

    const body = await req.json();
    const email = body.email;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Verify if this email actually belongs to an admin before logging to prevent spam
    const adminsSnap = await adminDb
      .collection("admins")
      .where("email", "==", email.toLowerCase())
      .get();

    if (!adminsSnap.empty) {
      const adminData = adminsSnap.docs[0].data();
      await adminDb.collection("activity_logs").add({
        adminEmail: adminData.email,
        adminName: adminData.name || "مدير",
        action: "طلب إعادة تعيين كلمة المرور",
        details: `طلب هذا المدير إرسال رابط لاستعادة كلمة مروره إلى البريد الإلكتروني.`,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Log reset error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
