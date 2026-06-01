import fs from "fs";
import path from "path";
import type { PlatterSize } from "./types";

const IMAGE_STORE_NAME = "perfect-platter-images";
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function isNetlify(): boolean {
  return (
    process.env.NETLIFY === "true" ||
    !!process.env.NETLIFY_BLOBS_CONTEXT ||
    !!process.env.AWS_LAMBDA_FUNCTION_NAME
  );
}

export function platterImageApiPath(size: PlatterSize): string {
  return `/api/platter-image/${size}`;
}

export async function savePlatterImage(
  size: PlatterSize,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (isNetlify()) {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore(IMAGE_STORE_NAME);
    await store.set(
      `platter-${size}`,
      new Blob([Uint8Array.from(buffer)], { type: contentType }),
      { metadata: { contentType } }
    );
    return platterImageApiPath(size);
  }

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  const ext =
    contentType.includes("png")
      ? "png"
      : contentType.includes("webp")
        ? "webp"
        : "jpg";
  const filename = `platter-${size}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

export async function getPlatterImage(
  size: PlatterSize
): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (isNetlify()) {
    try {
      const { getStore } = await import("@netlify/blobs");
      const store = getStore(IMAGE_STORE_NAME);
      const result = await store.getWithMetadata(`platter-${size}`, {
        type: "arrayBuffer",
      });
      if (!result?.data) return null;
      const contentType =
        (result.metadata?.contentType as string) || "image/jpeg";
      return {
        buffer: Buffer.from(result.data as ArrayBuffer),
        contentType,
      };
    } catch {
      return null;
    }
  }

  const localPath = path.join(UPLOAD_DIR, `platter-${size}.jpg`);
  const pngPath = path.join(UPLOAD_DIR, `platter-${size}.png`);
  const webpPath = path.join(UPLOAD_DIR, `platter-${size}.webp`);
  const filePath = [localPath, pngPath, webpPath].find((p) => fs.existsSync(p));

  if (filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
          ? "image/webp"
          : "image/jpeg";
    return { buffer: fs.readFileSync(filePath), contentType };
  }

  if (fs.existsSync(UPLOAD_DIR)) {
    const anyFile = fs
      .readdirSync(UPLOAD_DIR, { withFileTypes: true })
      .find((f) => f.isFile() && f.name.startsWith(`platter-${size}`));
    if (anyFile) {
      const full = path.join(UPLOAD_DIR, anyFile.name);
      const ext = path.extname(full).toLowerCase();
      const contentType =
        ext === ".png"
          ? "image/png"
          : ext === ".webp"
            ? "image/webp"
            : "image/jpeg";
      return { buffer: fs.readFileSync(full), contentType };
    }
  }

  return null;
}
