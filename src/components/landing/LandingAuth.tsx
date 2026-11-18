"use client";

import Link from "next/link";
import { SignInButtons } from "@/components/auth";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

export function LandingAuth() {
  const { user, ready } = useAuth();
  const { t } = useTranslation();

  // reserve the space so the page doesn't jump while auth loads
  if (!ready) return <div className="h-[76px]" />;

  if (user) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        {t("auth.signedInAs", { name: user.name ?? user.email })} ·{" "}
        <Link href="/saved" className="text-foreground underline underline-offset-4">
          {t("nav.savedRecipes")}
        </Link>
      </p>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3">
      <p className="text-center text-xs text-muted-foreground">
        {t("auth.signInPrompt")}
      </p>
      <SignInButtons />
    </div>
  );
}
