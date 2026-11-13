import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/data-table";
import { CredentialsView } from "@/features/credentials/components/credentials-view";
import { pageMetadata } from "@/lib/utils/metadata";

export const generateMetadata = pageMetadata("credentials");

export default function CredentialsPage() {
  return (
    // useSearchParams (?add=sourceId) needs a Suspense boundary for static rendering.
    <Suspense fallback={<DataTableSkeleton columns={7} rows={3} />}>
      <CredentialsView />
    </Suspense>
  );
}
