import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Zod validation for the request
const ScanClothingInput = z.object({
  imageUrl: z.string().url("Must be a valid URL"),
});

// Define the response types
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

/**
 * AI Clothing Scanner Server Function
 * Analyzes an uploaded clothing photo using OpenAI's Vision API (gpt-4o)
 * and returns structured data about detected garments.
 *
 * Usage from client:
 *   const result = await scanClothing({ data: { imageUrl: "https://..." } })
 */
export const scanClothing = createServerFn({ method: "POST" })
  .inputValidator(ScanClothingInput)
  .handler(async ({ data }): Promise<ScanClothingResponse> => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("OPENAI_API_KEY not configured");
      return {
        error: "AI-service niet beschikbaar. Probeer het later opnieuw.",
      };
    }

    try {
      // Try to read cached scan from Supabase first
      try {
        const { data: cached, error: cacheErr } = await supabaseAdmin
          .from("wardrobe_scans")
          .select("response_json, created_at")
          .eq("image_url", data.imageUrl)
          .limit(1)
          .maybeSingle();

        if (!cacheErr && cached && cached.response_json) {
          // Return cached response directly
          const parsed = typeof cached.response_json === "string" ? JSON.parse(cached.response_json) : cached.response_json;
          if (parsed.error) {
            return { error: parsed.error };
          }
          if (parsed.items && Array.isArray(parsed.items)) {
            return { items: parsed.items, rawDescription: JSON.stringify(parsed) };
          }
        }
      } catch (cacheExc) {
        console.warn("Cache lookup failed, continuing without cache:", cacheExc);
      }

      // Call OpenAI Vision API with the image URL
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze this clothing photo and provide a detailed JSON response. 

IMPORTANT VALIDATION RULES:
1. If NO clothing item is visible, respond with: {"error": "Geen kledingstuk herkend. Upload alstublieft een duidelijke foto van een kledingstuk."}
2. If the photo is rotated, upside down, or unclear, respond with: {"error": "De foto is gedraaid of onduidelijk. Zorg dat het kledingstuk recht in beeld staat."}
3. If multiple garments are visible (outfit with top AND bottom), return an array of items in this format:

{
  "items": [
    {
      "category": "top" | "bottom" | "shoes" | "dress" | "outerwear" | "accessories" | "unknown",
      "style": "descriptive style name (e.g., 'crew neck t-shirt', 'straight leg jeans')",
      "color": "primary color(s)",
      "formality": "casual" | "business" | "formal" | "sporty",
      "fabric": "detected fabric type if possible",
      "description": "Brief description of the garment",
      "boundingBox": { "x": 0.1, "y": 0.2, "width": 0.3, "height": 0.6 }
    }
  ]
}

Respond ONLY with valid JSON, no markdown or extra text. Bounding box coordinates should be normalized (0-1 range).`,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: data.imageUrl,
                  },
                },
              ],
            },
          ],
          max_tokens: 1024,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("OpenAI API error:", error);
        return {
          error: "Fout bij het analyseren van de foto. Probeer het opnieuw.",
        };
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content;

      if (!content) {
        return {
          error: "Geen antwoord van AI-service.",
        };
      }

      // Parse the JSON response from GPT
      try {
        const parsed = JSON.parse(content);

        // If error is returned from GPT, pass it through
        if (parsed.error) {
          // Cache the error response too to avoid repeated failing calls
          try {
            await supabaseAdmin.from("wardrobe_scans").insert({ image_url: data.imageUrl, response_json: parsed });
          } catch (e) {
            console.warn("Failed to cache error response", e);
          }

          return { error: parsed.error };
        }

        // Validate and return items
        if (parsed.items && Array.isArray(parsed.items)) {
          // Cache successful response
          try {
            await supabaseAdmin.from("wardrobe_scans").insert({ image_url: data.imageUrl, response_json: parsed });
          } catch (e) {
            console.warn("Failed to cache scan result", e);
          }

          return { items: parsed.items, rawDescription: content };
        }

        return { error: "Onverwacht antwoord van AI-service." };
      } catch (parseError) {
        console.error("Failed to parse AI response:", content);
        return { error: "Fout bij verwerking van AI-antwoord." };
      }
    } catch (error) {
      console.error("Clothing scanner error:", error);
      return {
        error: "Fout bij het analyseren van de foto. Controleer je internetverbinding.",
      };
    }
  });
