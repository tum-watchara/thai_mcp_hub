"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@repo/ui/components/button-variants";
import { PlanCard, PlanCardSkeleton } from "@/components/domain/plan-card";
import { ErrorState } from "@/components/states";
import { Link } from "@/i18n/navigation";
import { usePlansQuery } from "@/lib/query/usage";
import { MarketingSection } from "./section";

export function PlanSummary() {
  const t = useTranslations("landing.plans");
  const query = usePlansQuery();
  return (
    <MarketingSection
      title={t("title")}
      description={t("description")}
      subtle
      actions={
        <Link href="/pricing" className={buttonVariants({ variant: "secondary" })}>
          {t("viewPricing")}
          <ArrowRight aria-hidden />
        </Link>
      }
    >
      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} retrying={query.isFetching} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {query.isPending
            ? Array.from({ length: 4 }, (_, i) => <PlanCardSkeleton key={i} />)
            : query.data.map((plan) => <PlanCard key={plan.id} plan={plan} maxFeatures={3} />)}
        </div>
      )}
    </MarketingSection>
  );
}
