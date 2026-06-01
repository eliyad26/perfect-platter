import { NextResponse } from "next/server";
import { getPlatterImage } from "@/lib/images";
import type { PlatterSize } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID: PlatterSize[] = ["small", "medium", "party"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size } = await params;
  if (!VALID.includes(size as PlatterSize)) {
    return new NextResponse(null, { status: 404 });
  }

  const image = await getPlatterImage(size as PlatterSize);
  if (!image) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(new Uint8Array(image.buffer), {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
