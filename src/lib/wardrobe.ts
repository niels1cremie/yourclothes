import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";
import { getCurrentUserId } from "./auth";
import { analyzeGarment, type GarmentAnalysis } from "./api/clothing-scanner.functions";
import { isWardrobeCategory, type WardrobeCategory } from "./wardrobe-categories";

// Persistence pipeline for scanned garments. Primary path writes/reads the
// Supabase `user_wardrobe` table (per-user, RLS-protected). When no user is
// signed in (the app has no login UI yet) it transparently falls back to a
// localStorage store so the scan → persist → render round trip stays
// demonstrable.

export interface WardrobeItem {
  id: string;
  user_id: string;
  image_url: string;
  category: WardrobeCategory;
  style: string;
  color: string;
  fabric: string;
  created_at: string;
}

interface RawWardrobeRow {
  id: string;
  user_id: string;
  image_url: string;
  category: string;
  style: string;
  color: string;
  fabric: string;
  created_at: string;
}

const LOCAL_KEY = "mirror.wardrobe.items";
const LOCAL_USER = "local";

function normalizeRow(row: RawWardrobeRow): WardrobeItem {
  return {
    ...row,
    category: isWardrobeCategory(row.category) ? row.category : "Accessoires",
  };
}

function readLocal(): WardrobeItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(LOCAL_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as RawWardrobeRow[]).map(normalizeRow);
  } catch {
    return [];
  }
}

function writeLocal(items: WardrobeItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

export async function fetchWardrobe(): Promise<WardrobeItem[]> {
  const userId = await getCurrentUserId();

  if (userId) {
    const { data, error } = await supabase
      .from("user_wardrobe")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data.map((row) => normalizeRow(row as RawWardrobeRow));
    }
  }

  return readLocal().sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function saveGarment(
  imageUrl: string,
  analysis: GarmentAnalysis,
): Promise<WardrobeItem> {
  const userId = await getCurrentUserId();

  if (userId) {
    const insert: TablesInsert<"user_wardrobe"> = {
      user_id: userId,
      image_url: imageUrl,
      category: analysis.category,
      style: analysis.style,
      color: analysis.color,
      fabric: analysis.fabric,
    };

    const { data, error } = await supabase
      .from("user_wardrobe")
      .insert(insert)
      .select("*")
      .single();

    if (!error && data) {
      return normalizeRow(data as RawWardrobeRow);
    }
  }

  const item: WardrobeItem = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
    user_id: LOCAL_USER,
    image_url: imageUrl,
    created_at: new Date().toISOString(),
    ...analysis,
  };
  writeLocal([item, ...readLocal()]);
  return item;
}

// Downscales an uploaded image to a compact JPEG data URL so it persists across
// reloads (object URLs do not) without bloating the row.
export async function fileToThumbnailDataUrl(file: File, maxSize = 512): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return objectUrl;
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } catch {
    return objectUrl;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// End-to-end: analyze one uploaded file (server vision fn) then persist it.
export async function scanAndSaveFile(file: File, index: number): Promise<WardrobeItem> {
  const imageUrl = await fileToThumbnailDataUrl(file);
  const analysis = await analyzeGarment({
    data: { fileName: file.name, sizeBytes: file.size, index },
  });
  return saveGarment(imageUrl, analysis);
}
