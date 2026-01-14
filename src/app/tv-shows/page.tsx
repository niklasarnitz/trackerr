import { Suspense } from "react";
import Link from "next/link";
import { TvShowsGrid } from "~/components/tv-shows-grid";
import { LoadingSkeleton } from "~/components/loading-skeleton";
import { AddTvShowButton } from "~/components/add-tv-show-button";
import { Button } from "~/components/ui/button";
import { Search, Bookmark, Heart } from "lucide-react";
import { api } from "~/trpc/server";

const sortOptions = ["title", "created", "watched"] as const;
type TvShowSort = (typeof sortOptions)[number];

interface TvShowsPageProps {
  readonly searchParams: Promise<{
    search?: string;
    sort?: string;
    page?: string;
    watchlist?: string;
    favorites?: string;
  }>;
}

export default async function TvShowsPage({ searchParams }: TvShowsPageProps) {
  const params = await searchParams;
  const search = params.search;

  const sortCandidate = (params.sort ?? "created") as TvShowSort;
  const sort: TvShowSort = sortOptions.includes(sortCandidate)
    ? sortCandidate
    : "created";
  const page = Number(params.page) || 1;
  const watchlist = params.watchlist === "true";
  const favorites = params.favorites === "true";

  const skip = (page - 1) * 20;
  const limit = 20;

  const { tvShows, total, hasMore } = await api.tvShow.getAll({
    search,
    sort,
    skip,
    limit,
    watchlist,
    favorites,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="heading-lg">My TV Shows</h1>
          <div className="flex items-center gap-2">
            <AddTvShowButton />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant={watchlist ? "default" : "outline"} asChild>
            <Link
              href={`/tv-shows?${new URLSearchParams({ ...(watchlist ? {} : { watchlist: "true" }), ...(search ? { search } : {}), sort }).toString()}`}
            >
              <Bookmark className="mr-2 h-4 w-4" />
              Watchlist
            </Link>
          </Button>
          <Button variant={favorites ? "default" : "outline"} asChild>
            <Link
              href={`/tv-shows?${new URLSearchParams({ ...(favorites ? {} : { favorites: "true" }), ...(search ? { search } : {}), sort }).toString()}`}
            >
              <Heart className="mr-2 h-4 w-4" />
              Favorites
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <TvShowsGrid tvShows={tvShows} />
      </Suspense>

      {/* Pagination */}
      {(page > 1 || hasMore) && (
        <div className="mt-8 flex justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" asChild>
              <Link
                href={`/tv-shows?${new URLSearchParams({ ...(search ? { search } : {}), sort, page: String(page - 1), ...(watchlist ? { watchlist: "true" } : {}), ...(favorites ? { favorites: "true" } : {}) }).toString()}`}
              >
                Previous
              </Link>
            </Button>
          )}
          <Button variant="outline" disabled>
            Page {page}
          </Button>
          {hasMore && (
            <Button variant="outline" asChild>
              <Link
                href={`/tv-shows?${new URLSearchParams({ ...(search ? { search } : {}), sort, page: String(page + 1), ...(watchlist ? { watchlist: "true" } : {}), ...(favorites ? { favorites: "true" } : {}) }).toString()}`}
              >
                Next
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
