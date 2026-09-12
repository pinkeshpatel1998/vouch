"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { supabaseConfigured } from "@/lib/supabase/env";

/**
 * Recorded video, kept in IndexedDB.
 *
 * localStorage cannot hold a 90-second file, and an object URL does not survive
 * a reload -- so the row stores the sentinel `blob:<id>` and the bytes live
 * here. When Supabase Storage arrives, `video_url` becomes a real URL and
 * `useBlobUrl` passes it straight through, so nothing else has to change.
 */

const DB = "vouch-media";
const STORE = "blobs";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const BLOB_PREFIX = "blob-store:";

/** webm on Chrome and Firefox, mp4 on Safari -- keep whatever we were handed. */
function extensionFor(type: string) {
  if (type.includes("mp4")) return "mp4";
  if (type.includes("quicktime")) return "mov";
  if (type.startsWith("image/")) return type.includes("png") ? "png" : "jpg";
  return "webm";
}

/**
 * Stores a recording and returns whatever belongs in `video_url`.
 *
 * With Supabase configured this uploads to the `testimonial-videos` bucket
 * under `{space_id}/…`, which is the path shape the storage policies check,
 * and returns a real public URL. Without it, the bytes go to IndexedDB and the
 * row carries a `blob-store:` sentinel that `useBlobUrl` resolves. Callers pass
 * the same arguments either way.
 */
export async function putBlob(blob: Blob, spaceId: string): Promise<string> {
  if (supabaseConfigured()) {
    const supabase = createClient();
    const path = `${spaceId}/${crypto.randomUUID()}.${extensionFor(blob.type)}`;
    const bucket = blob.type.startsWith("image/") ? "testimonial-images" : "testimonial-videos";

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, blob, { contentType: blob.type || undefined, upsert: false });
    if (error) throw new Error(error.message);

    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  const id = crypto.randomUUID();
  const db = await open();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return `${BLOB_PREFIX}${id}`;
}

async function getBlob(id: string): Promise<Blob | null> {
  const db = await open();
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve((req.result as Blob) ?? null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return blob;
}

/* Object URLs are expensive to churn, so hand back the same one per id. */
const cache = new Map<string, string>();

/**
 * Resolves whatever is in `video_url` to something a <video> can play:
 * a stored blob, or a real URL once the backend exists.
 */
export function useBlobUrl(stored: string | null | undefined): string | null {
  const [url, setUrl] = React.useState<string | null>(
    stored && !stored.startsWith(BLOB_PREFIX) ? stored : null,
  );

  React.useEffect(() => {
    if (!stored) return setUrl(null);
    if (!stored.startsWith(BLOB_PREFIX)) return setUrl(stored);

    const id = stored.slice(BLOB_PREFIX.length);
    const hit = cache.get(id);
    if (hit) return setUrl(hit);

    let live = true;
    getBlob(id)
      .then((blob) => {
        if (!live || !blob) return;
        const objectUrl = URL.createObjectURL(blob);
        cache.set(id, objectUrl);
        setUrl(objectUrl);
      })
      .catch(() => live && setUrl(null));

    return () => {
      live = false;
    };
  }, [stored]);

  return url;
}
