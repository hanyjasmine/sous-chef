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

// one page of the current view; the view is the whole pool or a chat-narrowed subset
export interface ResultsPage {
  recipes: Recipe[];
  nextCursor: number | null;
  total: number;
  poolSize: number;
  narrowed: boolean;
  // web results are still being fetched in the background
  webPending: boolean;
}

// recipes holds every page loaded so far
export interface SearchSession extends ResultsPage {
  id: string;
  query: string;
  filters?: SearchFilters;
}
