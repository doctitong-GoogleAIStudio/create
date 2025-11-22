export interface Product {
  brand: string;
  name: string;
  shade: string;
  hexColor?: string;
}

export interface ProductRecommendation {
  category: string;
  notes?: string;
  highEnd: Product[];
  drugstore: Product[];
  commonlyAvailable: Product[];
}

export interface SkinAnalysis {
  tone: string;
  type: string;
  undertone: string;
  observations: string;
}

export interface MakeupRecommendation {
  skinAnalysis: SkinAnalysis;
  productRecommendations: ProductRecommendation[];
}

// FIX: Define the SavedProduct interface. It extends ProductRecommendation with an 'id' for saved items.
export interface SavedProduct extends ProductRecommendation {
  id: string;
}

// FIX: Define the SavedAnalysis interface. It represents a saved skin analysis result with an id and the associated image URL.
export interface SavedAnalysis {
  id: string;
  imageUrl: string;
  skinAnalysis: SkinAnalysis;
}

export interface UserProfile {
  name: string;
  style: string;
  concerns: string[];
  finish: string;
  priorities: string[];
  avoidances: string[];
}
