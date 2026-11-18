import { getSupabase } from "@/lib/supabase/client";
import type { Recipe, SearchSession } from "@/types";

// next rewrites /api/svc/* to sous-svc
const SVC = "/api/svc";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

// sous-svc verifies this token to know who's signed in
async function authHeader(): Promise<Record<string, string>> {
  const { data } = await getSupabase().auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${SVC}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(await authHeader()),
      ...init?.headers,
    },
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.error ?? "unknown",
      body?.message ?? `Request failed (${res.status})`,
    );
  }
  return body as T;
}

const cacheKey = (id: string) => `sous:session:${id}`;

// cache the session so the results page renders without a second round trip
function cacheSession(session: SearchSession) {
  try {
    sessionStorage.setItem(cacheKey(session.id), JSON.stringify(session));
  } catch {
    // storage full or blocked, the page will refetch
  }
}

function readCachedSession(id: string): SearchSession | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(id));
    return raw ? (JSON.parse(raw) as SearchSession) : null;
  } catch {
    return null;
  }
}

export async function createSearch(query: string) {
  const session = await request<SearchSession>("/search", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
  cacheSession(session);
  return { sessionId: session.id };
}

export async function getSearchSession(id: string): Promise<SearchSession> {
  const cached = readCachedSession(id);
  if (cached) return cached;
  const session = await request<SearchSession>(
    `/sessions/${encodeURIComponent(id)}`,
  );
  cacheSession(session);
  return session;
}

export async function listSaved() {
  const { recipes } = await request<{ recipes: Recipe[] }>("/saved");
  return recipes;
}

export function saveRecipe(recipeId: string) {
  return request<void>(`/saved/${encodeURIComponent(recipeId)}`, {
    method: "PUT",
  });
}

export function unsaveRecipe(recipeId: string) {
  return request<void>(`/saved/${encodeURIComponent(recipeId)}`, {
    method: "DELETE",
  });
}

export function getHealth() {
  return request<{ status: string; features: Record<string, boolean> }>(
    "/health",
  );
}
