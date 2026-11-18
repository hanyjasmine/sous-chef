import {
  Carrot,
  Cherry,
  Citrus,
  Croissant,
  Egg,
  type LucideIcon,
  Soup,
} from "lucide-react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface Blob {
  className: string;
  duration: number;
  delay: number;
}

// same three brand hues as the ui, kept low so the cream still leads
const blobs: Blob[] = [
  { className: "-top-40 -left-32 size-[34rem] bg-sunny/30 dark:bg-sunny/15", duration: 34, delay: 0 },
  { className: "-right-40 top-[15%] size-[30rem] bg-highlight/15 dark:bg-highlight/15", duration: 28, delay: -9 },
  // green muddies cream fast, so keep it faint
  { className: "-bottom-48 left-[20%] size-[36rem] bg-leaf/8 dark:bg-leaf/25", duration: 38, delay: -17 },
  // sits behind the search bar so the glass has color to frost
  { className: "top-[40%] left-[28%] size-[20rem] bg-sunny/25 dark:bg-highlight/10", duration: 24, delay: -5 },
  { className: "top-[38%] right-[26%] size-[16rem] bg-highlight/10 dark:bg-leaf/20", duration: 26, delay: -12 },
];

interface Bubble {
  icon: LucideIcon;
  className: string;
  tilt: number;
  delay: number;
}

const bubbles: Bubble[] = [
  { icon: Carrot, className: "top-[14%] left-[10%] text-highlight", tilt: -8, delay: 0 },
  { icon: Cherry, className: "top-[22%] right-[12%] text-highlight", tilt: 10, delay: -2 },
  { icon: Egg, className: "bottom-[20%] left-[14%] text-leaf", tilt: 6, delay: -4 },
  { icon: Citrus, className: "bottom-[14%] right-[16%] text-leaf", tilt: -10, delay: -1 },
  { icon: Croissant, className: "top-[8%] left-[44%] hidden text-highlight md:grid", tilt: 4, delay: -3 },
  { icon: Soup, className: "top-[52%] right-[5%] hidden text-leaf lg:grid", tilt: -6, delay: -5 },
];

export function LandingBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {blobs.map(({ className, duration, delay }) => (
        <div
          key={className}
          className={cn("absolute animate-drift rounded-full blur-3xl", className)}
          style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
        />
      ))}
      {bubbles.map(({ icon: Icon, className, tilt, delay }) => (
        <div
          key={className}
          className={cn(
            "glass absolute grid size-14 animate-bob place-items-center rounded-2xl",
            className,
          )}
          style={
            { "--tilt": `${tilt}deg`, animationDelay: `${delay}s` } as CSSProperties
          }
        >
          <Icon className="size-6" strokeWidth={1.75} />
        </div>
      ))}
    </div>
  );
}
