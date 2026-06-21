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
    const { items, occasion, weather, profile } = await req.json()

    const prompt = `You are a personal stylist for MIRROR.
    User Profile: ${JSON.stringify(profile)}
    Available Clothes: ${JSON.stringify(items.map((i: any) => ({ id: i.id, category: i.category, color: i.color, style: i.style })))}
    Occasion: ${occasion}
    Weather: ${JSON.stringify(weather)}

    Suggest 1-3 best matching items from the Available Clothes list to form one complete outfit.
    Return ONLY JSON:
    {
      "selected_item_ids": ["uuid1", "uuid2"],
      "reasoning": "A short explanation in Dutch why this matches the weather and occasion."
    }`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      }),
    })

    const data = await response.json()
    return new Response(data.choices[0].message.content, {
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
