"use client";

import { ArrowUpIcon, LoaderIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { copy } from "@/data/copy";
import { ApiError, createSearch } from "@/lib/api";
import { SuggestedQueries } from "./SuggestedQueries";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);

  // page stays mounted (hidden) across navigations, so clear pending when it's hidden
  useLayoutEffect(() => () => setPending(false), []);

  async function submit(value: string) {
    const trimmed = value.trim();
    if (!trimmed || pending) return;
    setPending(true);
    try {
      const { sessionId } = await createSearch(trimmed);
      router.push(`/search/${sessionId}`);
    } catch (e) {
      setPending(false);
      toast.error("Search didn't go through", {
        description: e instanceof ApiError ? e.message : "Is sous-svc running?",
      });
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
        className="glass flex items-center gap-2 rounded-full py-2 pr-2 pl-6 outline-ring/40 transition-[outline] focus-within:outline-4"
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={copy.searchPlaceholder}
          aria-label="Search recipes"
          className="h-10 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
        <Button
          type="submit"
          size="icon-lg"
          disabled={!query.trim() || pending}
          aria-label="Search"
          className="rounded-full"
        >
          {pending ? <LoaderIcon className="animate-spin" /> : <ArrowUpIcon />}
        </Button>
      </form>
      <SuggestedQueries
        onPick={(s) => {
          setQuery(s);
          submit(s);
        }}
      />
    </div>
  );
}
