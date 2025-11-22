import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { MakeupRecommendation, UserProfile } from '../types';

// FIX: Initialize the GoogleGenAI client directly with the environment variable as per the guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        skinAnalysis: {
            type: Type.OBJECT,
            properties: {
                tone: { type: Type.STRING, description: "The user's overall skin tone (e.g., Fair, Light, Medium, Tan, Deep)." },
                type: { type: Type.STRING, description: "The user's skin type (e.g., Oily, Dry, Combination, Normal)." },
                undertone: { type: Type.STRING, description: "The user's skin undertone (e.g., Cool, Warm, Neutral, Olive)." },
                observations: { type: Type.STRING, description: "Any other visual observations about the skin relevant to makeup application." }
            },
            required: ["tone", "type", "undertone", "observations"],
        },
        productRecommendations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING, description: "The makeup category (e.g., Sunscreen, Primer, Foundation, Concealer, Blush, Bronzer, Highlighter, Lips, Eyeshadow, etc.)." },
                    notes: { type: Type.STRING, description: "General advice or notes for this product category based on the analysis." },
                    highEnd: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                brand: { type: Type.STRING },
                                name: { type: Type.STRING },
                                shade: { type: Type.STRING, description: "Specific shade name/number or color description." },
                                hexColor: { type: Type.STRING, description: "A hex color code (e.g., '#D35D6E') representing the shade. Required for color products. Can be empty ('') for non-color items." }
                            },
                            required: ["brand", "name", "shade", "hexColor"],
                        }
                    },
                    drugstore: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                brand: { type: Type.STRING },
                                name: { type: Type.STRING },
                                shade: { type: Type.STRING, description: "Specific shade name/number or color description." },
                                hexColor: { type: Type.STRING, description: "A hex color code (e.g., '#D35D6E') representing the shade. Required for color products. Can be empty ('') for non-color items." }
                            },
                            required: ["brand", "name", "shade", "hexColor"],
                        }
                    },
                    commonlyAvailable: {
                        type: Type.ARRAY,
                        description: "Products from popular, mid-range brands found in stores like Target, Ulta, etc.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                brand: { type: Type.STRING },
                                name: { type: Type.STRING },
                                shade: { type: Type.STRING, description: "Specific shade name/number or color description." },
                                hexColor: { type: Type.STRING, description: "A hex color code (e.g., '#D35D6E') representing the shade. Required for color products. Can be empty ('') for non-color items." }
                            },
                            required: ["brand", "name", "shade", "hexColor"],
                        }
                    }
                },
                required: ["category", "highEnd", "drugstore", "commonlyAvailable"],
            }
        }
    },
    required: ["skinAnalysis", "productRecommendations"],
};


export const getMakeupRecommendations = async (imageBase64: string, mimeType: string, profile: UserProfile): Promise<MakeupRecommendation> => {
  const model = 'gemini-2.5-flash';
  
  const profileInfo = `
    In addition to the image analysis, consider the following user profile for even more personalized recommendations:
    - Name: ${profile.name || 'User'}
    - Preferred Makeup Style: ${profile.style}
    - Preferred Makeup Finish: ${profile.finish}
    ${profile.concerns.length > 0 ? `- Skin Concerns: ${profile.concerns.join(', ')}` : ''}
    ${profile.priorities.length > 0 ? `- Product Priorities: Prioritize recommendations for ${profile.priorities.join(', ')}.` : ''}
    ${profile.avoidances.length > 0 ? `- Products/Ingredients to Avoid: Avoid products containing ${profile.avoidances.join(', ')}.` : ''}

    Tailor your suggestions accordingly.
    - For makeup style: If style is 'Natural', recommend lighter coverage products and neutral palettes.
    - For makeup finish: If finish is 'Matte', suggest matte foundations, powders, and lipsticks. If 'Dewy' or 'Radiant', suggest hydrating primers, luminous foundations, and cream products.
    - For skin concerns: If concerns include 'Sensitive Skin', prioritize gentle, hypoallergenic formulas. If 'Acne-prone', suggest non-comedogenic products.
    - For avoidances: Strictly adhere to the list of items to avoid. For example, if 'Glitter' is listed, do not recommend any highlighters, eyeshadows, or lip products with glitter particles.
    If the user provided a name, you can use it to make the tone more personal.
  `;
  
  const prompt = `
    You are a world-class makeup artist and skin expert. Your goal is to analyze the user's photo and provide personalized, detailed makeup recommendations.

    ${profileInfo}

    Analyze the provided image to determine the user's skin tone, skin type, and undertone. Make sure everything will match their body/neck for a seamless look. Based on this analysis AND the user profile provided, recommend specific makeup products.

    Provide recommendations for the following categories:
    - Sunscreen: Suggest products suitable for the identified skin type and concerns.
    - Primer: Suggest products for the identified skin type and concerns, aligned with the preferred finish.
    - Foundation: Provide a specific shade match and finish that aligns with the user's style and finish preference.
    - Concealer: Provide a shade that is slightly lighter but still matches the undertone.
    - Blush: Suggest colors and formulas (cream, powder) that flatter the skin tone and undertone, fitting the user's style.
    - Bronzer: Recommend a shade to add warmth and dimension.
    - Highlighter: Recommend a shade and formula that complements the undertone and avoids any specified 'avoidances' like glitter.
    - Lips: Suggest flattering colors and finishes (matte, satin, gloss) that align with user preferences.
    - Eyeshadow: Recommend palettes and color families that align with the user's preferred style and avoidances.
    - You can add other product categories like Setting Spray if you think they are beneficial for the final look.

    For each product category, provide three types of options:
    1.  High-End (luxury brands from specialty stores like Sephora).
    2.  Commonly Available (popular, mid-range brands from stores like Target or Ulta).
    3.  Drugstore (most affordable, widely available options from pharmacies).

    For all color-specific products (Foundation, Concealer, Blush, Bronzer, Highlighter, Lips, Eyeshadow), you MUST provide a \`hexColor\` value that visually represents the shade. For eyeshadow palettes, provide the hex code for the most representative or dominant shade. For non-color products like Sunscreen or Primer, you MUST provide an empty string "" for \`hexColor\`.
    
    For the Foundation category, you MUST include a detailed 'notes' field. This note should explain why the recommended shade is a good match based on the skin tone and undertone analysis, and it must include this tip: "Pro Tip: Always test a new foundation shade on your jawline and check it in natural daylight to ensure a perfect match with your neck."

    For the Bronzer and Highlighter categories specifically, you MUST include a 'notes' field explaining when and where to apply them (e.g., for Bronzer: "Apply lightly to the hollows of cheeks, jawline, and temples to add warmth."; for Highlighter: "Apply to the high points of your face like cheekbones, brow bone, and tip of the nose for a radiant glow.").

    You MUST provide your response in a JSON format that adheres to the schema. Do not include any text or markdown formatting outside of the JSON object.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
          parts: [
              { text: prompt },
              { inlineData: { mimeType, data: imageBase64 } }
          ]
      },
      config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.2,
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as MakeupRecommendation;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get recommendations from the AI model.");
  }
};

function formatRecommendationsForImagePrompt(recommendations: MakeupRecommendation): string {
    const { skinAnalysis, productRecommendations } = recommendations;
    let prompt = `Apply a realistic, natural-looking makeup look to the person in the image based on these recommendations:\n`;
    prompt += `- Skin Tone: ${skinAnalysis.tone} with ${skinAnalysis.undertone} undertones.\n`;

    const foundation = productRecommendations.find(p => p.category === 'Foundation')?.commonlyAvailable[0];
    if (foundation) {
        prompt += `- Foundation: Apply a foundation matching shade "${foundation.shade}".\n`;
    }

    const blush = productRecommendations.find(p => p.category === 'Blush')?.commonlyAvailable[0];
    if (blush) {
        prompt += `- Blush: Apply a blush in a color similar to "${blush.shade}".\n`;
    }

    const lips = productRecommendations.find(p => p.category === 'Lips')?.commonlyAvailable[0];
    if (lips) {
        prompt += `- Lips: Apply a lipstick in a color similar to "${lips.shade}".\n`;
    }
    
    const eyeshadow = productRecommendations.find(p => p.category === 'Eyeshadow')?.notes;
    if (eyeshadow) {
        prompt += `- Eyeshadow: Apply eyeshadow as described: "${eyeshadow}".\n`;
    }
    
    prompt += `The final result should look like a professionally applied makeup look that enhances the user's natural features. Do not alter the person's facial structure or identity.`;

    return prompt;
}

export const applyMakeup = async (imageBase64: string, mimeType: string, recommendations: MakeupRecommendation): Promise<string> => {
    const model = 'gemini-2.5-flash-image';
    const prompt = formatRecommendationsForImagePrompt(recommendations);

    try {
        const response = await ai.models.generateContent({
            model,
            contents: {
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType, data: imageBase64 } }
                ]
            },
            config: {
                responseModalities: [Modality.IMAGE],
            }
        });

        // The response will contain the edited image in its parts.
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        throw new Error("No image data returned from the model.");

    } catch (error) {
        console.error("Error calling Gemini API for image generation:", error);
        throw new Error("Failed to generate the makeup-applied image.");
    }
};