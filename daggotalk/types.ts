export type Emotion = 'excited' | 'playful' | 'sad' | 'scared' | 'curious' | 'alert' | 'protective' | 'relaxed';
export type TranslationMode = 'human-to-dog' | 'dog-to-human';

export interface EmotionDetection {
  emotion: Emotion;
  confidence: number;
  timestamp: string;
}

export interface DogSoundMapping {
  emotion: Emotion;
  dogText: string;
  emoji: string;
  audioUrl: string;
  behaviorDescription: string;
}

export interface Translation {
  id: string;
  mode: TranslationMode;
  inputAudio: {
    url: string;
    duration: number;
    size: number;
  };
  emotion: Emotion;
  result: {
    text: string;
    emoji: string;
    audioUrl?: string;
  };
  timestamp: string;
  duration: number;
}

export interface UserProfile {
  name: string;
  preferredBreed?: 'small' | 'large' | 'puppy';
  audioQuality: 'standard' | 'premium';
  dailyUsageCount: number;
  lastUsageDate: string;
  translationHistory: Translation[];
}

export interface DailyUsage {
  date: string;
  count: number;
  limit: number;
}

export interface DogSoundLibrary {
  [key: string]: {
    standard: string;
    premium: string;
  };
}

export interface TranslationResponse {
  success: boolean;
  emotion: Emotion;
  translation: string;
  audioUrl: string;
  emoji: string;
  remainingUsage?: number;
  error?: string;
}

export interface LicenseInfo {
  isValid: boolean;
  isPremium: boolean;
  installationId: string;
  expiryDate?: string;
}

export interface SavedTranslation {
  id: string;
  timestamp: string;
  mode: TranslationMode;
  emotion: Emotion;
  inputText?: string;
  resultText: string;
  emoji: string;
  audioUrl?: string;
  duration?: number;
}