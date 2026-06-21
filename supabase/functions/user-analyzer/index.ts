import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fullBodyImageUrl, faceImageUrl } = await req.json()

    if (!fullBodyImageUrl || !faceImageUrl) {
      throw new Error('Both full body and face images are required')
    }

    const prompt = `Analyze these two images (A: full body, B: face) for a fashion profile.
    Image A (Full Body): Identify body shape (hourglass, pear, apple, rectangle, inverted-triangle).
    Image B (Face): Identify skin undertone (warm, cool, neutral) and color season (spring, summer, autumn, winter).

    Provide the output in strict JSON format:
    {
      "bodyShape": "...",
      "skinUndertone": "...",
      "colorSeason": "...",
      "suggestedPalette": ["#hex1", "#hex2", ...],
      "stylePersona": "A short descriptive name for their style DNA"
    }`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: fullBodyImageUrl } },
              { type: "image_url", image_url: { url: faceImageUrl } }
            ]
          }
        ],
        response_format: { type: "json_object" }
      }),
    })

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
