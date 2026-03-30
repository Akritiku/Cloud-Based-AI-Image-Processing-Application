export type RoomType = 'bedroom' | 'living room' | 'kitchen' | 'office' | 'bathroom' | 'dining room';
export type InteriorStyle = 'modern' | 'minimalist' | 'luxury' | 'scandinavian' | 'industrial' | 'bohemian' | 'vintage';
export type ColorTheme = 'light' | 'dark' | 'pastel' | 'warm' | 'cool' | 'monochrome';

export interface DesignConcept {
  id: string;
  userId: string;
  originalImageUrl: string;
  generatedImageUrl: string;
  roomType: RoomType;
  style: InteriorStyle;
  colorTheme: ColorTheme;
  prompt: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
}
