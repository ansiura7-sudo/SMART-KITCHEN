
export enum Difficulty {
  EASY = 'Легко',
  MEDIUM = 'Средне',
  HARD = 'Сложно'
}

export interface Recipe {
  name: string;
  description: string;
  ingredients: string[];
  steps: string[];
  time: string;
  difficulty: Difficulty;
  imageUrl?: string;
}

export enum UserPlan {
  BASIC = 'Basic',
  PREMIUM = 'Premium'
}

export interface GenerationState {
  loading: boolean;
  error: string | null;
  recipes: Recipe[];
}
