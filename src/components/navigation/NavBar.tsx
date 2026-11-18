"use client";

import { BookmarkIcon, LogOutIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

export function NavBar() {
  const { user, ready, signOut, requireAuth } = useAuth();
  const router = useRouter();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
      <Link
        href="/"
        className="flex items-center gap-2 font-heading text-xl font-semibold"
      >
        <Image src="/logo.png" alt="" width={32} height={32} className="rounded-lg" />
        Sous
      </Link>
      {!ready ? null : user ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Account menu" />
            }
          >
            <Avatar className="size-8">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
              <AvatarFallback>
                {(user.name ?? user.email ?? "?")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="truncate">
                {user.name ?? user.email}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/saved")}>
              <BookmarkIcon />
              Saved recipes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut}>
              <LogOutIcon />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => requireAuth(() => {})}>
          Sign in
        </Button>
      )}
    </header>
  );
}
