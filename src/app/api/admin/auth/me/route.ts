import { NextResponse } from "next/server";
import { verifyAdmin, AdminAuthError } from "@/lib/api/admin-auth";

/**
 * GET /api/admin/auth/me — Get current admin profile and role without logging activity.
 */
export async function GET(req: Request) {
  try {
    const admin = await verifyAdmin(req);
    return NextResponse.json({
      success: true,
      admin: { email: admin.email, name: admin.name, role: admin.role },
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
