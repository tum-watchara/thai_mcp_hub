import { Suspense } from "react";
import { Skeleton } from "@repo/ui/components/skeleton";
import { PlaygroundView } from "@/features/playground/components/playground-view";
import { pageMetadata } from "@/lib/utils/metadata";

export const generateMetadata = pageMetadata("playground");

export default function PlaygroundPage() {
  return (
    // useSearchParams (?tool=) needs a Suspense boundary for static rendering.
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <PlaygroundView />
    </Suspense>
  );
}
