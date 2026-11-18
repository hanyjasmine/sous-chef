export const copy = {
  tagline: { before: "What are we ", accent: "cooking", after: " today?" },
  searchPlaceholder: "Describe what you're craving…",
  signInPrompt: "Sign in to save recipes and send shopping lists to your phone",
  authDialogTitle: "Sign in to save recipes",
  authDialogBody:
    "Searching is free for everyone. Sign in to bookmark recipes and pick up where you left off.",
  greeting: (query: string) =>
    `Thanks for choosing Sous! Looks like you're after "${query}". Any dietary needs, a time limit, or ingredients you want to use up?`,
  sessionExpired:
    "This search has expired. Search results are kept for an hour, so start a fresh one.",
  sessionLoadFailed: "Couldn't load this search. Check that sous-svc is running.",
  savedSignedOut: "Sign in to see the recipes you've saved.",
  savedEmpty:
    "Nothing saved yet. Tap the bookmark on any recipe to keep it here.",
  noResults:
    "No recipes matched. Try fewer constraints, or tell Sous what to loosen in the chat.",
  mockReply:
    "Chat isn't connected yet. Once sous-svc is wired up, I'll narrow these results or run a new search based on what you tell me.",
};
