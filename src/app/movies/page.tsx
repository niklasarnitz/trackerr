import { Suspense, useMemo } from "react";
import Link from "next/link";
import { AdvancedFilters } from "~/components/advanced-filters";
import { MoviesGrid } from "~/components/movies-grid";
import { LoadingSkeleton } from "~/components/loading-skeleton";
import { AddMovieButton } from "~/components/add-movie-button";
import { Button } from "~/components/ui/button";
import { Search } from "lucide-react";
import { parseBoolean } from "../../helpers/parseBoolean";
import { parseNumber } from "../../helpers/parseNumber";

const sortOptions = [
  "title",
  "created",
  "watched",
  "releaseYear",
  "rating",
  "runtime",
] as const;

type MovieSort = (typeof sortOptions)[number];

interface MoviesPageProps {
  readonly searchParams: Promise<{
    search?: string;
    sort?: string;
    genres?: string;
    tags?: string;
    releaseYearMin?: string;
    releaseYearMax?: string;
    ratingMin?: string;
    ratingMax?: string;
    runtimeMin?: string;
    runtimeMax?: string;
    isInWatchlist?: string;
    isFavorite?: string;
    page?: string;
  }>;
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const params = await searchParams;
  const search = params.search;

  const sortCandidate = (params.sort ?? "created") as MovieSort;
  const sort: MovieSort = sortOptions.includes(sortCandidate)
    ? sortCandidate
    : "created";
  const page = Number(params.page) || 1;

  const advancedFilters = (() => {
    const genres = (params.genres ?? "")
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);

    const tagIds = (params.tags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    return {
      ...(genres.length > 0 ? { genres } : {}),
      ...(tagIds.length > 0 ? { tagIds } : {}),
      ...(typeof parseNumber(params.releaseYearMin) === "number"
        ? { releaseYearMin: parseNumber(params.releaseYearMin) }
        : {}),
      ...(typeof parseNumber(params.releaseYearMax) === "number"
        ? { releaseYearMax: parseNumber(params.releaseYearMax) }
        : {}),
      ...(typeof parseNumber(params.ratingMin) === "number"
        ? { ratingMin: parseNumber(params.ratingMin) }
        : {}),
      ...(typeof parseNumber(params.ratingMax) === "number"
        ? { ratingMax: parseNumber(params.ratingMax) }
        : {}),
      ...(typeof parseNumber(params.runtimeMin) === "number"
        ? { runtimeMin: parseNumber(params.runtimeMin) }
        : {}),
      ...(typeof parseNumber(params.runtimeMax) === "number"
        ? { runtimeMax: parseNumber(params.runtimeMax) }
        : {}),
      ...(typeof parseBoolean(params.isInWatchlist) === "boolean"
        ? { isInWatchlist: parseBoolean(params.isInWatchlist) }
        : {}),
      ...(typeof parseBoolean(params.isFavorite) === "boolean"
        ? { isFavorite: parseBoolean(params.isFavorite) }
        : {}),
    };
  })();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="heading-lg">My Movies</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/movies/search">
                <Search className="mr-2 h-4 w-4" />
                Search Movies
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/movies/tmdb-top-250">TMDB Top 250</Link>
            </Button>
            <AddMovieButton />
          </div>
        </div>
        <p className="text-muted-foreground body-md">
          Browse and manage your movie collection.
        </p>
      </div>

      <div className="space-y-6">
        <AdvancedFilters />

        {/* Server-side rendered results */}
        <Suspense fallback={<LoadingSkeleton cards={6} />}>
          <MoviesGrid
            search={search}
            sort={sort}
            page={page}
            advancedFilters={advancedFilters}
          />
        </Suspense>
      </div>
    </div>
  );
}
