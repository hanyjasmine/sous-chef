// survives the google redirect so we can finish what the guest started
export type PendingAction = { kind: "save"; recipeId: string };

const KEY = "sous:pending-action";

export function setPendingAction(action: PendingAction) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(action));
  } catch {
    // storage blocked, the user just repeats the action after sign-in
  }
}

export function takePendingAction(): PendingAction | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return raw ? (JSON.parse(raw) as PendingAction) : null;
  } catch {
    return null;
  }
}

export function clearPendingAction() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // nothing to clear
  }
}
