import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const AnalyzeUserInput = z.object({
  fullBodyImageUrl: z.string().url(),
  faceImageUrl: z.string().url(),
});

export interface UserAnalysisResponse {
  bodyShape: string;
  skinUndertone: string;
  colorSeason: string;
  suggestedPalette: string[];
  stylePersona: string;
  error?: string;
}

const SUPABASE_URL = process.env.SUPABASE_URL || "https://aqqxvacyvbucvkupzoya.supabase.co";
const SUPABASE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/user-analyzer`;
const SUPABASE_ANON_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxcXh2YWN5dmJ1Y3ZrdXB6b3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTYxNzksImV4cCI6MjA5NzI3MjE3OX0.v7-lq3qOru83Oy0nOJIXhxxEw6LY01Ty9uwv2MSnROQ";

export const analyzeUser = createServerFn({ method: "POST" })
  .inputValidator(AnalyzeUserInput)
  .handler(async ({ data }): Promise<UserAnalysisResponse> => {
    try {
      const response = await fetch(SUPABASE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("User analyzer proxy error:", error);
      return {
        bodyShape: "",
        skinUndertone: "",
        colorSeason: "",
        suggestedPalette: [],
        stylePersona: "",
        error: "Fout bij de AI-analyse."
      };
    }
  });
