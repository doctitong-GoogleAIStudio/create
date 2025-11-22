import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Diagnosis } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export const getSkinDiagnosis = async (images: File[]): Promise<Diagnosis> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // FIX: Simplified prompt and added a response schema for reliable JSON output.
  const prompt = `First, assess the quality of the provided image(s) for clinical analysis. Rate the quality as 'Excellent', 'Good', 'Fair', or 'Poor' based on factors like lighting, focus/clarity, and framing. Provide brief feedback on your assessment. Then, you will act as an expert AI dermatologist. Your purpose is to analyze images of skin lesions and provide a preliminary analysis based on visual characteristics. Analyze the morphology of the lesion(s) including color, shape, border, size, and texture. Identify key features. Provide your analysis based only on the visual information in the image. Do not ask for more information. Ensure the disclaimer is always present and clearly states that this is an AI-generated analysis and not a substitute for professional medical advice.`;
  
  const diagnosisSchema = {
    type: Type.OBJECT,
    properties: {
      imageQuality: {
        type: Type.OBJECT,
        description: "An assessment of the uploaded image's quality.",
        properties: {
          score: { type: Type.STRING, description: "A quality rating ('Excellent', 'Good', 'Fair', 'Poor')." },
          feedback: { type: Type.STRING, description: "Brief feedback on the image quality (e.g., 'Image is sharp and well-lit.')." },
        },
        required: ['score', 'feedback']
      },
      mostLikelyDiagnosis: {
        type: Type.OBJECT,
        description: "The most likely diagnosis based on the analysis.",
        properties: {
          conditionName: { type: Type.STRING, description: "The name of the condition." },
          confidence: { type: Type.STRING, description: "Confidence level (e.g., 'High', 'Medium', 'Low')." },
          description: { type: Type.STRING, description: "A detailed description of the condition." },
          urgency: { type: Type.STRING, description: "Urgency level (e.g., 'Routine', 'Requires Prompt Attention', 'Urgent')." },
          urgencyReason: { type: Type.STRING, description: "Explanation for the urgency level." },
        },
        required: ['conditionName', 'confidence', 'description', 'urgency', 'urgencyReason']
      },
      differentialDiagnoses: {
        type: Type.ARRAY,
        description: "A list of other possible conditions.",
        items: {
          type: Type.OBJECT,
          properties: {
            conditionName: { type: Type.STRING, description: "The name of the alternative condition." },
            confidence: { type: Type.STRING, description: "Confidence level for this alternative." },
            description: { type: Type.STRING, description: "A brief description of this alternative." },
          },
          required: ['conditionName', 'confidence', 'description']
        }
      },
      nextSteps: {
        type: Type.ARRAY,
        description: "Recommended next steps for the user.",
        items: {
          type: Type.STRING
        }
      },
      disclaimer: {
        type: Type.STRING,
        description: "A mandatory disclaimer."
      }
    },
    required: ['imageQuality', 'mostLikelyDiagnosis', 'differentialDiagnoses', 'nextSteps', 'disclaimer']
  };

  const imageParts = await Promise.all(
    images.map(async (image) => {
      const base64Image = await fileToBase64(image);
      return {
        inlineData: {
          mimeType: image.type,
          data: base64Image,
        },
      };
    })
  );

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: prompt }, ...imageParts] },
    config: {
      responseMimeType: "application/json",
      responseSchema: diagnosisSchema,
    }
  });
  
  try {
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as Diagnosis;
  } catch (e) {
    console.error("Failed to parse JSON response:", response.text);
    throw new Error("The AI returned an invalid response format. Please try again.");
  }
};
