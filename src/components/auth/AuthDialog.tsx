"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SignInButtons } from "./SignInButtons";
import { useTranslation } from "react-i18next";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {t("auth.dialogTitle")}
          </DialogTitle>
          <DialogDescription>{t("auth.dialogBody")}</DialogDescription>
        </DialogHeader>
        <SignInButtons className="flex-col" />
      </DialogContent>
    </Dialog>
  );
}
