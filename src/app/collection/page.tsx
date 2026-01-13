import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { CollectionFilters } from "~/components/collection-filters";
import {
  CollectionGrid,
  type CollectionGridProps,
} from "~/components/collection-grid";
import { LoadingSkeleton } from "~/components/loading-skeleton";

interface CollectionPageProps {
  searchParams: Promise<CollectionGridProps>;
}

export default async function CollectionPage({
  searchParams,
}: CollectionPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const params = await searchParams;
  const search = params.search;
  const medium = params.medium;
  const type = params.type ?? "all";
  const ripped = params.ripped ?? "all";
  const page = Number(params.page) || 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="heading-lg mb-2">My Collection</h1>
        <p className="text-muted-foreground body-md">
          All physical and virtual media in your collection.
        </p>
      </div>

      <div className="space-y-6">
        {/* Client-side filters */}
        <CollectionFilters />

        {/* Server-side rendered results */}
        <Suspense fallback={<LoadingSkeleton cards={4} />}>
          <CollectionGrid
            search={search}
            medium={medium}
            type={type}
            ripped={ripped}
            page={page}
          />
        </Suspense>
      </div>
    </div>
  );
}
