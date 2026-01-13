import { Suspense } from "react";
import Link from "next/link";
import { MoviesSearchFilters } from "~/components/movies-search-filters";
import { MoviesGrid } from "~/components/movies-grid";
import { LoadingSkeleton } from "~/components/loading-skeleton";
import { AddMovieButton } from "~/components/add-movie-button";
import { Button } from "~/components/ui/button";
import { Search } from "lucide-react";

interface WatchlistPageProps {
  readonly searchParams: Promise<{
    search?: string;
    sort?: "title" | "created" | "watched";
    page?: string;
  }>;
}

export default async function WatchlistPage({
  searchParams,
}: WatchlistPageProps) {
  const params = await searchParams;
  const search = params.search;
  const sort = params.sort ?? "created";
  const page = Number(params.page) || 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="heading-lg">Watchlist</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/movies/search">
                <Search className="mr-2 h-4 w-4" />
                Search Movies
              </Link>
            </Button>
            <AddMovieButton />
          </div>
        </div>
        <p className="text-muted-foreground body-md">
          Movies you want to watch next.
        </p>
      </div>

      <div className="space-y-6">
        <MoviesSearchFilters baseUrl="/movies/watchlist" />
        <Suspense fallback={<LoadingSkeleton cards={6} />}>
          <MoviesGrid
            search={search}
            sort={sort}
            page={page}
            watchlist
            baseUrl="/movies/watchlist"
          />
        </Suspense>
      </div>
    </div>
  );
}
