import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { updatePlatterImage } from "@/lib/db";
import { savePlatterImage } from "@/lib/images";
import type { PlatterSize } from "@/lib/types";

const VALID_SIZES: PlatterSize[] = ["small", "medium", "party"];

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const size = formData.get("size") as PlatterSize | null;

    if (!file || !size || !VALID_SIZES.includes(size)) {
      return NextResponse.json({ error: "קובץ או סוג מגש לא תקין" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "יש להעלות תמונה בלבד" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "הקובץ גדול מדי (מקסימום 5MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageUrl = await savePlatterImage(size, buffer, file.type);
    await updatePlatterImage(size, imageUrl);

    return NextResponse.json({ success: true, imageUrl });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "שגיאה בהעלאה" }, { status: 500 });
  }
}
