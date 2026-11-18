"use client";

import { use } from "react";
import { AuthContext } from "@/components/auth/AuthProvider";

export function useAuth() {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
