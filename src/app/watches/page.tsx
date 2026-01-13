import { Suspense } from "react";
import { WatchesFilters } from "~/components/watches-filters";
import { WatchesGrid } from "~/components/watches-grid";
import { LoadingSkeleton } from "~/components/loading-skeleton";

interface WatchesPageProps {
  searchParams: Promise<{
    search?: string;
    rating?: string;
    page?: string;
  }>;
}

export default async function WatchesPage({ searchParams }: WatchesPageProps) {
  const params = await searchParams;
  const search = params.search;
  const rating = params.rating ?? "all";
  const page = Number(params.page) || 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="heading-lg mb-2">My Watches</h1>
        <p className="text-muted-foreground body-md">
          All movies you have watched with your ratings and reviews.
        </p>
      </div>

      <div className="space-y-6">
        {/* Client-side filters */}
        <WatchesFilters />

        {/* Server-side rendered results */}
        <Suspense fallback={<LoadingSkeleton cards={5} />}>
          <WatchesGrid search={search} rating={rating} page={page} />
        </Suspense>
      </div>
    </div>
  );
}
