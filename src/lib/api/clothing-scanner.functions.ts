import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ScanClothingInput = z.object({
  imageUrl: z.string().url("Must be a valid URL"),
});

export interface ClothingItem {
  category: "top" | "bottom" | "shoes" | "dress" | "outerwear" | "accessories" | "unknown";
  style: string;
  color: string;
  formality: "casual" | "business" | "formal" | "sporty";
  fabric?: string;
  description: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ScanClothingResponse {
  error?: string;
  items?: ClothingItem[];
  rawDescription?: string;
}

const SUPABASE_FUNCTION_URL =
  "https://aqqxvacyvbucvkupzoya.supabase.co/functions/v1/clothing-scanner";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxcXh2YWN5dmJ1Y3ZrdXB6b3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTYxNzksImV4cCI6MjA5NzI3MjE3OX0.v7-lq3qOru83Oy0nOJIXhxxEw6LY01Ty9uwv2MSnROQ";

export const scanClothing = createServerFn({ method: "POST" })
  .inputValidator(ScanClothingInput)
  .handler(async ({ data }): Promise<ScanClothingResponse> => {
    try {
      const response = await fetch(SUPABASE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ imageUrl: data.imageUrl }),
      });

      const result = await response.json().catch(() => null);

      if (!result) {
        return { error: "Fout bij verwerking van AI-antwoord." };
      }

      if (result.error) {
        return { error: result.error };
      }

      if (result.items && Array.isArray(result.items)) {
        return { items: result.items, rawDescription: result.rawDescription };
      }

      return { error: "Onverwacht antwoord van AI-service." };
    } catch (error) {
      console.error("Clothing scanner proxy error:", error);
      return {
        error: "Fout bij het analyseren van de foto. Controleer je internetverbinding.",
      };
    }
  });
