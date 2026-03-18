import { GoogleGenAI, Type } from "@google/genai";
import { RewriteRequest, RewriteResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateAlternateEnding(request: RewriteRequest, lang: 'en' | 'zh' = 'en'): Promise<RewriteResult> {
  const { movie, mode, prompt, direction, faithfulness, intensity } = request;

  const systemInstruction = `You are a world-class cinematic storyteller and script doctor. 
Your goal is to generate emotionally grounded, causally coherent alternate endings for movies.
You must preserve the original movie's tone, character motivations, and genre consistency.
Do not generate generic fan fiction. The output must feel like it could have been the actual movie.

IMPORTANT: You MUST generate the entire response in ${lang === 'en' ? 'English' : 'Chinese'}.

Follow this structure for your response:
1. Original Emotional Core: A short paragraph explaining why the original ending works emotionally.
2. Impact Analysis: A short analysis of what causal or emotional chain the user's change affects.
3. Three Alternate Branches: 
   - Faithful Version: Stays closest to the original spirit.
   - Healing Version: Focuses on resolution and emotional repair.
   - Dramatic Version: Leans into high stakes or tragic consequences.
4. Polished Rewritten Ending: A full, cinematic prose description of the new ending based on the user's selected style.

User's selected style:
- Emotional Direction: ${direction}
- Faithfulness: ${faithfulness}
- Change Intensity: ${intensity}
`;

  const userPrompt = `Movie: ${lang === 'en' ? movie.title : movie.titleZh}
Original Ending Summary: ${lang === 'en' ? movie.endingSummary : movie.endingSummaryZh}
Tone Profile: ${lang === 'en' ? movie.toneProfile : movie.toneProfileZh}
Rewrite Mode: ${mode}
User's "What If" Change: ${prompt}

Generate the alternate ending structure in JSON format.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          originalCore: { type: Type.STRING },
          impactAnalysis: { type: Type.STRING },
          branches: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["title", "summary", "description"]
            }
          },
          polishedEnding: { type: Type.STRING }
        },
        required: ["originalCore", "impactAnalysis", "branches", "polishedEnding"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to generate content");
  
  return JSON.parse(text) as RewriteResult;
}
