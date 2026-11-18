import { getSupabase } from "@/lib/supabase/client";
import type { ChatMessage, Recipe, ResultsPage, SearchSession } from "@/types";

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
export function cacheSession(session: SearchSession) {
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

export function getResults(id: string, cursor: number, limit = 10) {
  return request<ResultsPage>(
    `/sessions/${encodeURIComponent(id)}/results?cursor=${cursor}&limit=${limit}`,
  );
}

export async function getMessages(id: string) {
  const { messages } = await request<{ messages: ChatMessage[] }>(
    `/sessions/${encodeURIComponent(id)}/messages`,
  );
  return messages;
}

export type ChatEvent =
  | { type: "message"; content: string }
  | { type: "results"; page: ResultsPage }
  | { type: "error"; message: string }
  | { type: "done" };

// greet opens the chat with the original query, otherwise send a message
export async function streamChat(
  id: string,
  body: { greet: true } | { message: string },
  onEvent: (event: ChatEvent) => void,
) {
  const res = await fetch(`${SVC}/sessions/${encodeURIComponent(id)}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => null);
    throw new ApiError(
      res.status,
      err?.error ?? "unknown",
      err?.message ?? `Chat failed (${res.status})`,
    );
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    // sse frames end with a blank line
    let end: number;
    while ((end = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      const event = parseFrame(frame);
      if (event) onEvent(event);
    }
  }
}

function parseFrame(frame: string): ChatEvent | null {
  let name = "";
  let data = "";
  for (const line of frame.split("\n")) {
    if (line.startsWith("event: ")) name = line.slice(7);
    else if (line.startsWith("data: ")) data += line.slice(6);
  }
  const payload = data ? JSON.parse(data) : {};
  switch (name) {
    case "message":
      return { type: "message", content: payload.content };
    case "results":
      return { type: "results", page: payload };
    case "error":
      return { type: "error", message: payload.message };
    case "done":
      return { type: "done" };
    default:
      return null;
  }
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
