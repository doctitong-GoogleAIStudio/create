export interface SkinAnalysis {
  tone: string;
  undertone: string;
  type: string;
  observations: string;
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  shade: string;
  hexColor?: string;
  store?: string;
  notes?: string;
}

export interface ProductRecommendation {
  category: string;
  notes?: string;
  highEnd: Product[];
  commonlyAvailable: Product[];
  drugstore: Product[];
  dupesAffordable: Product[];
}

export interface MakeupRecommendation {
  skinAnalysis: SkinAnalysis;
  productRecommendations: ProductRecommendation[];
}

export interface UserProfile {
  name: string;
  style: string;
  concerns: string[];
  finish: string;
  priorities: string[];
  avoidances: string[];
}

export interface SavedAnalysis {
  id: string;
  imageUrl: string;
  skinAnalysis: SkinAnalysis;
}

export interface SavedProduct extends ProductRecommendation {
    id: string;
    savedRatings?: { [key: string]: number };
}