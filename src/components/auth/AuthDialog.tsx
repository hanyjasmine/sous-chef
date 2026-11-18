"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { copy } from "@/data/copy";
import { SignInButtons } from "./SignInButtons";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {copy.authDialogTitle}
          </DialogTitle>
          <DialogDescription>{copy.authDialogBody}</DialogDescription>
        </DialogHeader>
        <SignInButtons className="flex-col" />
      </DialogContent>
    </Dialog>
  );
}
