import Image from "next/image";
import { LandingAuth, LandingBackdrop, SearchBar } from "@/components/landing";
import { copy } from "@/data/copy";

export function LandingView() {
  return (
    <main className="relative isolate flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-16">
      <LandingBackdrop />
      <div className="flex w-full max-w-2xl flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="flex items-center gap-3 font-heading text-6xl font-semibold tracking-tight [font-variation-settings:'SOFT'_100,'WONK'_1] sm:gap-4 sm:text-7xl">
            Sous
            <Image
              src="/tomato.png"
              alt=""
              width={80}
              height={80}
              loading="eager"
              className="size-16 drop-shadow-[0_6px_10px_oklch(0.5_0.15_30/0.18)] sm:size-20"
            />
          </h1>
          <p className="text-xl text-muted-foreground">
            {copy.tagline.before}
            <span className="font-heading text-highlight italic">
              {copy.tagline.accent}
            </span>
            {copy.tagline.after}
          </p>
        </div>
        <SearchBar />
        <div className="pt-6">
          <LandingAuth />
        </div>
      </div>
    </main>
  );
}
