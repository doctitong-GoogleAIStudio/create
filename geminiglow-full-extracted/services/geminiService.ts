import { GoogleGenAI, Type, Modality } from '@google/genai';
import type { MakeupRecommendation, UserProfile } from '../types';

// FIX: Initialize the GoogleGenAI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const productSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: 'A unique identifier for the product, in kebab-case. e.g., "fenty-beauty-pro-filtr-foundation"' },
        brand: { type: Type.STRING },
        name: { type: Type.STRING },
        shade: { type: Type.STRING },
        hexColor: { type: Type.STRING, description: 'A hex color code representing the product shade, e.g., #D1A78B' },
        store: { type: Type.STRING, description: 'The name of a store in the Philippines where this product can be commonly found, e.g., Watsons, SM Department Store, Sephora.ph' },
        notes: { type: Type.STRING, description: 'Optional. A brief note explaining why this specific product is a good fit, e.g., "Great for oily skin due to its matte finish."' },
    },
    required: ['id', 'brand', 'name', 'shade', 'store'],
};

const productRecommendationSchema = {
    type: Type.OBJECT,
    properties: {
        category: { type: Type.STRING, description: 'e.g., Foundation, Lipstick, Eyeshadow' },
        notes: { type: Type.STRING, description: 'Application tips or reasons for the recommendation. e.g., "This will even out your skin tone and provide a smooth base."' },
        highEnd: { type: Type.ARRAY, items: productSchema },
        commonlyAvailable: { type: Type.ARRAY, items: productSchema },
        drugstore: { type: Type.ARRAY, items: productSchema },
        dupesAffordable: { type: Type.ARRAY, items: productSchema, description: "Affordable alternatives or 'dupes' for popular high-end products." },
    },
    required: ['category', 'highEnd', 'commonlyAvailable', 'drugstore', 'dupesAffordable'],
};

const recommendationSchema = {
    type: Type.OBJECT,
    properties: {
        skinAnalysis: {
            type: Type.OBJECT,
            properties: {
                tone: { type: Type.STRING, description: 'e.g., Fair, Light, Medium, Tan, Deep' },
                undertone: { type: Type.STRING, description: 'e.g., Cool, Warm, Neutral, Olive' },
                type: { type: Type.STRING, description: 'e.g., Oily, Dry, Combination, Normal' },
                observations: { type: Type.STRING, description: 'Any other relevant observations about the user\'s skin, like visible pores, redness, or dark circles.' },
            },
            required: ['tone', 'undertone', 'type', 'observations'],
        },
        productRecommendations: {
            type: Type.ARRAY,
            items: productRecommendationSchema,
        },
    },
    required: ['skinAnalysis', 'productRecommendations'],
};

export const getMakeupRecommendations = async (
    base64Image: string,
    mimeType: string,
    profile: UserProfile
): Promise<MakeupRecommendation> => {
    
    const profileString = `
      User Profile:
      - Preferred Style: ${profile.style || 'Not specified'}
      - Skin Concerns: ${profile.concerns.length > 0 ? profile.concerns.join(', ') : 'None specified'}
      - Preferred Finish: ${profile.finish || 'Not specified'}
      - Product Priorities: ${profile.priorities.length > 0 ? profile.priorities.join(', ') : 'None specified'}
      - Things to Avoid: ${profile.avoidances.length > 0 ? profile.avoidances.join(', ') : 'None specified'}
    `;

    const prompt = `
      Analyze the user's face in the provided image to determine their skin tone, undertone, and skin type.
      Based on this analysis and their user profile, recommend a complete makeup look targeted for a user in the Philippines.
      
      For each makeup category (e.g., Foundation, Concealer, Blush, Eyeshadow, Mascara, Lipstick), provide product recommendations from four tiers: High-End, Commonly Available, Drugstore, and Dupes/Affordable.
      
      For EACH of these four tiers (High-End, Commonly Available, Drugstore, and Dupes/Affordable), you MUST provide a minimum of 5 product recommendations that are popular and easily accessible in the Philippines.

      For every product, you MUST generate a unique 'id' field. The ID should be a simple kebab-case string based on the brand and product name (e.g., "fenty-beauty-pro-filtr-foundation").
      
      The "Dupes/Affordable" tier should contain affordable alternatives or 'dupes' for popular high-end products.
      
      For every single product recommended, you MUST provide the name of a specific store in the Philippines where it is sold (e.g., "Watsons", "SM Department Store", "Sephora.ph").
      
      For individual products, if there is a specific reason for the recommendation (e.g., "Great for oily skin," "Provides a natural glow"), add it to the 'notes' field for that product.
      
      Ensure all recommendations are specific, including brand, product name, and a suitable shade name.
      Provide brief notes for each category explaining why the products were chosen or how to apply them.
      
      ${profile.name ? `The user's name is ${profile.name}.` : ''}
      ${profileString}

      Here is the expected JSON schema. Make sure hexColor is a valid hex code string starting with #. The 'store' and 'id' fields are mandatory for all products.
    `;
    
    try {
        // FIX: Use the correct API call `ai.models.generateContent` for generating content.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: mimeType,
                        },
                    },
                ],
            },
            config: {
                responseMimeType: 'application/json',
                responseSchema: recommendationSchema,
            },
        });
        
        // FIX: Directly access the `text` property for the response.
        const jsonText = response.text.trim();
        // Sometimes the model wraps the JSON in markdown backticks
        const cleanedJson = jsonText.replace(/^```json\n?/, '').replace(/```$/, '');
        const result = JSON.parse(cleanedJson) as MakeupRecommendation;
        
        // Basic validation
        if (!result.skinAnalysis || !result.productRecommendations) {
          throw new Error("Invalid response structure from API.");
        }

        return result;

    } catch (error) {
        console.error("Error getting makeup recommendations:", error);
        throw new Error("Failed to get makeup recommendations from the AI. Please try again.");
    }
};


export const generateAfterImage = async (
  base64Image: string,
  mimeType: string,
  recommendations: MakeupRecommendation
): Promise<string> => {
    const recommendationText = recommendations.productRecommendations
        .map(rec => {
            const products = [...rec.highEnd, ...rec.commonlyAvailable, ...rec.drugstore, ...(rec.dupesAffordable || [])];
            if (products.length === 0) return '';
            const exampleProduct = products[0]; // Take the first available product as an example for the look
            return `${rec.category}: ${exampleProduct.brand} ${exampleProduct.name} in shade ${exampleProduct.shade}.`;
        }).join('\n');

    const prompt = `
      Using the provided image as a base, apply a full face of makeup based on the following product list and style.
      The goal is to create a realistic "after" photo.
      
      Makeup Look:
      ${recommendationText}
    `;

    try {
        // FIX: Use the correct model and parameters for image editing.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: mimeType,
                        },
                    },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
        if (imagePart && imagePart.inlineData) {
            return imagePart.inlineData.data;
        } else {
            throw new Error("API did not return an image.");
        }
    } catch (error) {
        console.error("Error generating 'after' image:", error);
        throw new Error("Failed to generate the virtual try-on image. Please try again.");
    }
};