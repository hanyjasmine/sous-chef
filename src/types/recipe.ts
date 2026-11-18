export type RecipeSource = "spoonacular" | "web" | "nyt";

// optional fields arrive as null from sous-svc
export interface Ingredient {
  name: string;
  quantity?: string | null;
  aisle?: string | null;
}

export interface Recipe {
  id: string;
  source: RecipeSource;
  sourceUrl?: string | null;
  title: string;
  author?: string | null;
  imageUrl?: string | null;
  summary: string;
  ingredients: Ingredient[];
  steps: string[];
  tags: string[];
  totalMinutes?: number | null;
  servings?: number | null;
}

export interface SearchFilters {
  query: string;
  cuisines: string[];
  diets: string[];
  intolerances: string[];
  include_ingredients: string[];
  exclude_ingredients: string[];
  meal_type: string | null;
  max_ready_minutes: number | null;
}

export interface SearchSession {
  id: string;
  query: string;
  filters?: SearchFilters;
  recipes: Recipe[];
}
