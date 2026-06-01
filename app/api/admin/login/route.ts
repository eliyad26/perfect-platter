import { NextRequest, NextResponse } from "next/server";
import { loginAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: "נא להזין סיסמה" }, { status: 400 });
    }
    const ok = await loginAdmin(password);
    if (!ok) {
      return NextResponse.json({ error: "סיסמה שגויה" }, { status: 401 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאה" }, { status: 500 });
  }
}
