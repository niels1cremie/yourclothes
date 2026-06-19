import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { WARDROBE_CATEGORIES, type WardrobeCategory } from "../wardrobe-categories";

// AI Wardrobe Scanner — vision analysis layer.
//
// A real deployment would forward the image to a vision model. Until that
// gateway is wired up, this server function performs a deterministic
// pseudo-analysis: the same image always yields the same garment metadata,
// while different images spread realistically across categories/styles. The
// output shape matches what the persistence layer writes to `user_wardrobe`.

const STYLES = [
  "Minimalist",
  "Casual",
  "Streetwear",
  "Chic",
  "Business",
  "Sporty",
  "Bohemian",
  "Editorial",
  "Romantic",
] as const;

const COLORS = [
  "Off-white",
  "Charcoal",
  "Camel",
  "Black",
  "Navy",
  "Terracotta",
  "Sage",
  "Cream",
  "Burgundy",
  "Stone",
] as const;

const FABRICS = [
  "Cotton",
  "Wool",
  "Linen",
  "Silk",
  "Cashmere",
  "Denim",
  "Leather",
  "Viscose",
] as const;

const analysisSchema = z.object({
  fileName: z.string().default("garment"),
  sizeBytes: z.number().int().nonnegative().default(0),
  index: z.number().int().nonnegative().default(0),
});

export interface GarmentAnalysis {
  category: WardrobeCategory;
  style: string;
  color: string;
  fabric: string;
}

// Deterministic 32-bit string hash (FNV-1a).
function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function pick<T>(list: readonly T[], seed: number): T {
  return list[seed % list.length];
}

export function deriveGarmentAnalysis(
  fileName: string,
  sizeBytes: number,
  index: number,
): GarmentAnalysis {
  const base = hashString(`${fileName}:${sizeBytes}:${index}`);
  return {
    category: pick(WARDROBE_CATEGORIES, base),
    style: pick(STYLES, base >>> 3),
    color: pick(COLORS, base >>> 7),
    fabric: pick(FABRICS, base >>> 11),
  };
}

export const analyzeGarment = createServerFn({ method: "POST" })
  .inputValidator(analysisSchema)
  .handler(async ({ data }): Promise<GarmentAnalysis> => {
    return deriveGarmentAnalysis(data.fileName, data.sizeBytes, data.index);
  });
