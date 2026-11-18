"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  clearPendingAction,
  type PendingAction,
  setPendingAction,
} from "@/lib/pendingAction";
import { getSupabase } from "@/lib/supabase/client";
import { AuthDialog } from "./AuthDialog";

export type AuthProviderName = "google";

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  signIn: (provider: AuthProviderName) => Promise<void>;
  signOut: () => Promise<void>;
  requireAuth: (action: () => void, pending?: PendingAction) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(user: User | null | undefined): AuthUser | null {
  if (!user) return null;
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email,
    name: meta.full_name ?? meta.name,
    avatarUrl: meta.avatar_url ?? meta.picture,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    // fires once with the stored session, then on every sign-in or sign-out
    const { data } = getSupabase().auth.onAuthStateChange((_event, session) => {
      setUser(toAuthUser(session?.user));
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (provider: AuthProviderName) => {
    const next = window.location.pathname + window.location.search;
    const { error } = await getSupabase().auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) toast.error("Couldn't start sign-in", { description: error.message });
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase().auth.signOut();
    toast.success("Signed out");
  }, []);

  // run now if signed in, otherwise prompt and remember what to finish after login
  const requireAuth = useCallback(
    (action: () => void, pending?: PendingAction) => {
      if (user) {
        action();
        return;
      }
      if (pending) setPendingAction(pending);
      setDialogOpen(true);
    },
    [user],
  );

  const handleDialogChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    // closed without signing in, so forget the pending action
    if (!open) clearPendingAction();
  }, []);

  const value = useMemo(
    () => ({ user, ready, signIn, signOut, requireAuth }),
    [user, ready, signIn, signOut, requireAuth],
  );

  return (
    <AuthContext value={value}>
      {children}
      <AuthDialog open={dialogOpen} onOpenChange={handleDialogChange} />
    </AuthContext>
  );
}
