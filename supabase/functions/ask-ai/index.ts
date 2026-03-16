import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, subject, grade, videoContext, userId, subscriptionPlan } = await req.json();
    
    if (!question) {
      return new Response(
        JSON.stringify({ error: "Question is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Determine AI model based on subscription plan
    const aiModel = subscriptionPlan === "premium" 
      ? "google/gemini-2.5-pro" 
      : "google/gemini-2.5-flash";

    // Build context-aware system prompt with video information
    let systemPrompt = `You are an AI tutor helping Ethiopian students in Grade ${grade || '7-12'} with ${subject || 'their studies'}.
Your responses should:
1. Be clear, concise, and easy to understand for high school students
2. Use simple language and break down complex concepts
3. Provide relevant examples from everyday life or Ethiopian context when possible
4. Be encouraging and supportive
5. Keep answers under 150 words unless more detail is specifically requested
6. Align with the Ethiopian curriculum standards`;

    // Add video context if available
    if (videoContext) {
      systemPrompt += `

IMPORTANT: The student is asking about a specific educational video with the following details:
- Video Title: "${videoContext.title}"
- Subject: ${videoContext.subject}
- Grade Level: ${videoContext.grade}
${videoContext.description ? `- Description: ${videoContext.description}` : ''}

When the student asks questions like "what is this video about", "explain this video", "summarize this", or similar questions referring to "this video", you should analyze and explain the topic based on the video title and subject.

For example, if the video is titled "Pythagorean Theorem Explained", you should explain the Pythagorean theorem, provide examples, and relate it to the grade level.

Answer questions about the video's content based on the title, subject, and your knowledge of Ethiopian curriculum topics.`;
    } else {
      systemPrompt += `

If the question is about a specific topic, explain the key concepts, provide an example, and suggest how it's used in real life.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service unavailable. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";

    console.log("AI Response generated successfully");

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ask-ai function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
