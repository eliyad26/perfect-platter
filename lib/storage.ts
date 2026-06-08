import fs from "fs";
import path from "path";
import { defaultStore, migrateStore, type Store } from "./store-data";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");
const BLOB_STORE_NAME = "perfect-platter";
const BLOB_KEY = "main";

function isNetlify(): boolean {
  return (
    process.env.NETLIFY === "true" ||
    !!process.env.NETLIFY_BLOBS_CONTEXT ||
    !!process.env.AWS_LAMBDA_FUNCTION_NAME
  );
}

async function readFromNetlify(): Promise<Store | null> {
  const { getStore } = await import("@netlify/blobs");
  const blobStore = getStore(BLOB_STORE_NAME);
  return (await blobStore.get(BLOB_KEY, { type: "json" })) as Store | null;
}

async function writeToNetlify(store: Store): Promise<void> {
  const { getStore } = await import("@netlify/blobs");
  const blobStore = getStore(BLOB_STORE_NAME);
  await blobStore.setJSON(BLOB_KEY, store);
}

function readFromFile(): Store | null {
  if (!fs.existsSync(STORE_FILE)) return null;
  try {
    const content = fs.readFileSync(STORE_FILE, "utf-8");
    if (!content.trim()) return null;
    return JSON.parse(content) as Store;
  } catch {
    return null;
  }
}

function writeToFile(store: Store): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
}

export async function loadStore(): Promise<Store> {
  let store: Store | null = null;

  if (isNetlify()) {
    try {
      store = await readFromNetlify();
    } catch (e) {
      console.error("Netlify Blobs read failed:", e);
    }
  }

  if (!store) {
    store = readFromFile();
  }

  if (!store) {
    store = defaultStore();
    await saveStore(store);
    return store;
  }

  const { store: migrated, changed } = migrateStore(store);
  if (changed) {
    await saveStore(migrated);
  }
  return migrated;
}

export async function saveStore(store: Store): Promise<void> {
  if (isNetlify()) {
    try {
      await writeToNetlify(store);
      return;
    } catch (e) {
      console.error("Netlify Blobs write failed:", e);
      throw e;
    }
  }
  writeToFile(store);
}
