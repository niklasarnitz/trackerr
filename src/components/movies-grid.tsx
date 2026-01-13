import { MovieCard } from "~/components/movie-card";
import { ErrorDisplay } from "~/components/error-display";
import { Pagination } from "~/components/pagination";
import { Card, CardContent } from "~/components/ui/card";
import { Film } from "lucide-react";
import { api } from "~/trpc/server";
import { AddMovieLink } from "~/components/add-movie-button";

type MovieSort =
  | "title"
  | "created"
  | "watched"
  | "releaseYear"
  | "rating"
  | "runtime";

interface MoviesGridProps {
  readonly search?: string;
  readonly sort?: MovieSort;
  readonly page?: number;
  readonly watchlist?: boolean;
  readonly favorites?: boolean;
  readonly baseUrl?: string;
  readonly advancedFilters?: {
    search?: string;
    genres?: string[];
    releaseYearMin?: number;
    releaseYearMax?: number;
    ratingMin?: number;
    ratingMax?: number;
    runtimeMin?: number;
    runtimeMax?: number;
    isInWatchlist?: boolean;
    isFavorite?: boolean;
    hasWatches?: boolean;
    hasMediaEntries?: boolean;
    tagIds?: string[];
    sort?: MovieSort;
  };
}

export async function MoviesGrid({
  search,
  sort = "created",
  page = 1,
  watchlist = false,
  favorites = false,
  baseUrl = "/movies",
  advancedFilters,
}: MoviesGridProps) {
  try {
    const limit = 20;
    const skip = (page - 1) * limit;

    const useAdvancedFiltering =
      Boolean(advancedFilters) && !watchlist && !favorites;

    const sortForGetAll: "title" | "created" | "watched" =
      sort === "title" || sort === "created" || sort === "watched"
        ? sort
        : "created";

    const sortForFiltered: MovieSort =
      sort === "title" ||
      sort === "created" ||
      sort === "watched" ||
      sort === "releaseYear" ||
      sort === "rating" ||
      sort === "runtime"
        ? sort
        : "created";

    const result = useAdvancedFiltering
      ? await api.movie.getFiltered({
          ...advancedFilters,
          search,
          sort: sortForFiltered,
          skip,
          limit,
        })
      : await api.movie.getAll({
          search,
          sort: sortForGetAll,
          skip,
          limit,
          watchlist: watchlist ? true : undefined,
          favorites: favorites ? true : undefined,
        });

    if (!result.movies || result.movies.length === 0) {
      return (
        <Card>
          <CardContent className="py-16 text-center">
            <Film className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No movies found</h3>
            {search ? (
              <p className="text-muted-foreground mb-4">
                No movies match your search for &quot;{search}&quot;
              </p>
            ) : (
              <p className="text-muted-foreground mb-4">
                You haven&apos;t added any movies to your collection yet.
              </p>
            )}
            <AddMovieLink />
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Showing {result.movies.length} of {result.total} movies
            {search && ` for "${search}"`}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {result.movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        <Pagination
          currentPage={page}
          totalPages={Math.ceil(result.total / limit)}
          hasMore={result.hasMore}
          baseUrl={baseUrl}
          pageSize={limit}
          searchParams={{
            ...(search && { search }),
            ...(sort && sort !== "created" && { sort }),
            ...(useAdvancedFiltering &&
              advancedFilters?.genres &&
              advancedFilters.genres.length > 0 && {
                genres: advancedFilters.genres.join(","),
              }),
            ...(useAdvancedFiltering &&
              typeof advancedFilters?.releaseYearMin === "number" && {
                releaseYearMin: String(advancedFilters.releaseYearMin),
              }),
            ...(useAdvancedFiltering &&
              typeof advancedFilters?.releaseYearMax === "number" && {
                releaseYearMax: String(advancedFilters.releaseYearMax),
              }),
            ...(useAdvancedFiltering &&
              typeof advancedFilters?.ratingMin === "number" && {
                ratingMin: String(advancedFilters.ratingMin),
              }),
            ...(useAdvancedFiltering &&
              typeof advancedFilters?.ratingMax === "number" && {
                ratingMax: String(advancedFilters.ratingMax),
              }),
            ...(useAdvancedFiltering &&
              typeof advancedFilters?.runtimeMin === "number" && {
                runtimeMin: String(advancedFilters.runtimeMin),
              }),
            ...(useAdvancedFiltering &&
              typeof advancedFilters?.runtimeMax === "number" && {
                runtimeMax: String(advancedFilters.runtimeMax),
              }),
            ...(useAdvancedFiltering &&
              typeof advancedFilters?.isInWatchlist === "boolean" && {
                isInWatchlist: String(advancedFilters.isInWatchlist),
              }),
            ...(useAdvancedFiltering &&
              typeof advancedFilters?.isFavorite === "boolean" && {
                isFavorite: String(advancedFilters.isFavorite),
              }),
            ...(useAdvancedFiltering &&
              advancedFilters?.tagIds &&
              advancedFilters.tagIds.length > 0 && {
                tags: advancedFilters.tagIds.join(","),
              }),
          }}
          total={result.total}
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading movies:", error);
    return (
      <ErrorDisplay
        title="Failed to load movies"
        message="There was an error loading your movie collection. Please try again."
      />
    );
  }
}
