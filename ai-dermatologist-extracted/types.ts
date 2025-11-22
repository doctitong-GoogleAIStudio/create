export interface MostLikelyDiagnosis {
  conditionName: string;
  confidence: string;
  description: string;
  urgency: string;
  urgencyReason: string;
}

export interface DifferentialDiagnosis {
  conditionName: string;
  confidence: string;
  description: string;
}

export interface ImageQuality {
  score: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  feedback: string;
}

export interface Diagnosis {
  imageQuality: ImageQuality;
  mostLikelyDiagnosis: MostLikelyDiagnosis;
  differentialDiagnoses: DifferentialDiagnosis[];
  nextSteps: string[];
  disclaimer: string;
}

export interface HistoryItem {
  id: string;
  thumbnail: string; // A data URL for the first image
  images: string[]; // An array of data URLs
  diagnosis: Diagnosis;
  date: string;
}

export interface AnalyzedImageInfo {
  name: string;
  resolution: string;
}
