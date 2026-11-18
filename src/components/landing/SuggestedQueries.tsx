"use client";

import { Button } from "@/components/ui/button";
import { suggestions } from "@/data/suggestions";

export function SuggestedQueries({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {suggestions.map((s) => (
        <Button
          key={s}
          variant="ghost"
          size="sm"
          className="glass rounded-full font-normal transition-transform hover:-translate-y-0.5 hover:bg-card/70 dark:hover:bg-card/60"
          onClick={() => onPick(s)}
        >
          {s}
        </Button>
      ))}
    </div>
  );
}
