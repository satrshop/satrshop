import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// In-memory rate limiting (per IP, max 3 messages per 10 minutes)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 3;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  return true;
}

// Clean up old entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 30 * 60 * 1000);

/**
 * POST /api/contact — Public contact form submission with rate limiting.
 */
export async function POST(req: Request) {
  try {
    // Rate limiting by IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "لقد أرسلت عدة رسائل مؤخراً. يرجى الانتظار قليلاً." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, phone, content } = body;

    // Server-side input validation
    if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > 100) {
      return NextResponse.json({ error: "الاسم مطلوب (100 حرف كحد أقصى)" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@") || email.length > 254) {
      return NextResponse.json({ error: "بريد إلكتروني غير صالح" }, { status: 400 });
    }

    if (!content || typeof content !== "string" || content.trim().length === 0 || content.length > 2000) {
      return NextResponse.json({ error: "نص الرسالة مطلوب (2000 حرف كحد أقصى)" }, { status: 400 });
    }

    if (phone && (typeof phone !== "string" || phone.length > 20)) {
      return NextResponse.json({ error: "رقم الهاتف غير صالح" }, { status: 400 });
    }

    // Create message via Admin SDK (bypasses client Firestore rules)
    await adminDb.collection("messages").add({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      content: content.trim(),
      isRead: false,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ أثناء إرسال الرسالة" }, { status: 500 });
  }
}
