import { GoogleGenAI, Type } from '@google/genai';
import type { Emotion, TranslationMode, TranslationResponse, EmotionDetection } from '../types';
import { getDogSoundMapping, generateDogExplanation } from './doggoService';

const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });

const emotionDetectionSchema = {
  type: Type.OBJECT,
  properties: {
    emotion: {
      type: Type.STRING,
      description: 'The predominant emotion from this list: excited, playful, sad, scared, curious, alert, protective, relaxed'
    },
    confidence: {
      type: Type.NUMBER,
      description: 'Confidence level from 0 to 1'
    },
    reasoning: {
      type: Type.STRING,
      description: 'Brief explanation of why this emotion was detected'
    }
  },
  required: ['emotion', 'confidence', 'reasoning']
};

const EMOTION_DETECTION_PROMPT = `
You analyze human voice recordings and label only the predominant emotion and intent.
Return a single word from this list: excited, playful, sad, scared, curious, alert, protective, relaxed.
Focus on tone, pitch, intensity, and rhythm, not the exact words.

Analyze the vocal patterns in the audio and determine the primary emotional state.
`;

const DOG_TO_HUMAN_EXPLANATION_PROMPT = `
You are a Dog-Sound to Human-Meaning explainer with a friendly, casual style like talking to another pet owner.
Input: emotion label inferred from dog sounds (excited, playful, sad, scared, curious, alert, protective, relaxed).
Output: 1-2 short sentences explaining what the dog might be feeling and doing, in friendly everyday language.
Make it relatable and helpful, not overly technical.
Example: 'Sounds like your dog is feeling playful! They probably want to play fetch or are excited to see you.'
`;

export const detectEmotionFromAudio = async (
  audioBase64: string,
  mimeType: string = 'audio/webm'
): Promise<EmotionDetection> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: {
        parts: [
          { text: EMOTION_DETECTION_PROMPT },
          {
            inlineData: {
              data: audioBase64,
              mimeType: mimeType,
            },
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: emotionDetectionSchema,
      },
    });

    const jsonText = response.text.trim();
    const cleanedJson = jsonText.replace(/^```json\n?/, '').replace(/```$/, '');
    const result = JSON.parse(cleanedJson);

    // Validate the emotion
    const validEmotions: Emotion[] = ['excited', 'playful', 'sad', 'scared', 'curious', 'alert', 'protective', 'relaxed'];
    if (!validEmotions.includes(result.emotion)) {
      throw new Error(`Invalid emotion detected: ${result.emotion}`);
    }

    return {
      emotion: result.emotion as Emotion,
      confidence: result.confidence,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error("Error detecting emotion from audio:", error);
    throw new Error("Failed to detect emotion from audio. Please try again.");
  }
};

export const generateDogToHumanExplanation = async (
  emotion: Emotion,
  audioBase64: string,
  mimeType: string = 'audio/webm'
): Promise<string> => {
  try {
    // For dog-to-human mode, we can use a simpler approach with static explanations
    // since Gemini audio analysis for dog sounds might be less reliable
    return generateDogExplanation(emotion, 'dog-to-human');

  } catch (error) {
    console.error("Error generating dog-to-human explanation:", error);
    throw new Error("Failed to generate explanation. Please try again.");
  }
};

export const translateAudio = async (
  audioBlob: Blob,
  mode: TranslationMode,
  installationId: string,
  breed?: 'small' | 'large' | 'puppy',
  audioQuality: 'standard' | 'premium' = 'standard'
): Promise<TranslationResponse> => {
  try {
    // Convert audio blob to base64
    const audioBase64 = await blobToBase64(audioBlob);
    const mimeType = audioBlob.type || 'audio/webm';

    // Detect emotion from audio
    const emotionDetection = await detectEmotionFromAudio(audioBase64, mimeType);

    let resultText: string;
    let audioUrl: string;

    if (mode === 'human-to-dog') {
      // Get dog sound mapping
      const dogSound = getDogSoundMapping(emotionDetection.emotion);
      resultText = dogSound.dogText;
      audioUrl = dogSound.audioUrl;
    } else {
      // Dog to human mode
      resultText = await generateDogToHumanExplanation(emotionDetection.emotion, audioBase64, mimeType);
      audioUrl = ''; // No dog sound in dog-to-human mode
    }

    // Get emoji for the emotion
    const emoji = getEmotionEmoji(emotionDetection.emotion);

    return {
      success: true,
      emotion: emotionDetection.emotion,
      translation: resultText,
      audioUrl,
      emoji,
    };

  } catch (error: any) {
    console.error("Error in translateAudio:", error);
    return {
      success: false,
      emotion: 'relaxed' as Emotion,
      translation: '',
      audioUrl: '',
      emoji: '😊',
      error: error.message || 'Translation failed'
    };
  }
};

const getEmotionEmoji = (emotion: Emotion): string => {
  const emojiMap = {
    excited: '🐕',
    playful: '🦮',
    sad: '😢',
    scared: '😨',
    curious: '🤔',
    alert: '🚨',
    protective: '🛡️',
    relaxed: '😊'
  };
  return emojiMap[emotion];
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix to get just the base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const simulateTranslation = async (
  mode: TranslationMode,
  breed?: 'small' | 'large' | 'puppy',
  audioQuality: 'standard' | 'premium' = 'standard'
): Promise<TranslationResponse> => {
  // Mock emotions for testing/demo purposes
  const mockEmotions: Emotion[] = ['excited', 'playful', 'curious', 'relaxed'];
  const randomEmotion = mockEmotions[Math.floor(Math.random() * mockEmotions.length)];

  if (mode === 'human-to-dog') {
    const dogSound = getDogSoundMapping(randomEmotion);
    return {
      success: true,
      emotion: randomEmotion,
      translation: dogSound.dogText,
      audioUrl: dogSound.audioUrl,
      emoji: dogSound.emoji,
    };
  } else {
    return {
      success: true,
      emotion: randomEmotion,
      translation: generateDogExplanation(randomEmotion, 'dog-to-human'),
      audioUrl: '',
      emoji: getEmotionEmoji(randomEmotion),
    };
  }
};

// Fallback function for when API is unavailable
export const getFallbackTranslation = (
  mode: TranslationMode,
  emotion?: Emotion
): TranslationResponse => {
  const fallbackEmotion: Emotion = emotion || 'relaxed';

  if (mode === 'human-to-dog') {
    const dogSound = getDogSoundMapping(fallbackEmotion);
    return {
      success: true,
      emotion: fallbackEmotion,
      translation: dogSound.dogText,
      audioUrl: dogSound.audioUrl,
      emoji: dogSound.emoji,
      error: 'Using offline mode - emotion detection unavailable'
    };
  } else {
    return {
      success: true,
      emotion: fallbackEmotion,
      translation: generateDogExplanation(fallbackEmotion, 'dog-to-human'),
      audioUrl: '',
      emoji: getEmotionEmoji(fallbackEmotion),
      error: 'Using offline mode - emotion detection unavailable'
    };
  }
};