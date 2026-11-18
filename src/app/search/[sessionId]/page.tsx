import { Suspense } from "react";
import { SearchView } from "@/views";

export default function SearchPage({
  params,
}: PageProps<"/search/[sessionId]">) {
  return (
    <Suspense fallback={<div className="h-dvh" />}>
      <SearchView params={params} />
    </Suspense>
  );
}
