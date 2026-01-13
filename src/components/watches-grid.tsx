import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { toCalendarDate } from "~/lib/watch-date";
import { Calendar as CalendarIcon, Film } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ErrorDisplay } from "~/components/error-display";
import { Pagination } from "~/components/pagination";
import { StarRatingDisplay } from "~/components/star-rating-display";
import { getPosterUrl } from "~/lib/utils";
import { getLabelFromEnum } from "~/lib/label-utils";
import { WATCH_LOCATIONS } from "~/lib/form-schemas";
import { api } from "~/trpc/server";
import { AddMovieLink } from "~/components/add-movie-button";

interface WatchesGridProps {
  search?: string;
  rating?: string;
  page?: number;
}

const getWatchLocationBadge = (location: string) => {
  return getLabelFromEnum(location, WATCH_LOCATIONS);
};

export async function WatchesGrid({
  search,
  rating,
  page = 1,
}: WatchesGridProps) {
  try {
    const limit = 20;
    const skip = (page - 1) * limit;

    const ratingOptions = ["all", "unrated", "1", "2", "3", "4", "5"] as const;
    type RatingFilter = (typeof ratingOptions)[number];

    const ratingCandidate = (rating ?? "all") as RatingFilter;
    const ratingFilter: RatingFilter = ratingOptions.includes(ratingCandidate)
      ? ratingCandidate
      : "all";

    const result = await api.movieWatch.getAll({
      skip,
      limit,
      search,
      rating: ratingFilter,
    });

    if (result.watches.length === 0) {
      return (
        <Card>
          <CardContent className="py-16 text-center">
            <Film className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">
              No watch history found
            </h3>
            {search || (rating && rating !== "all") ? (
              <p className="text-muted-foreground mb-4">
                No watches match your current filters.
              </p>
            ) : (
              <p className="text-muted-foreground mb-4">
                You haven&apos;t recorded any movie watches yet.
              </p>
            )}
            <AddMovieLink>Add your first watch →</AddMovieLink>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Showing {result.watches.length} of {result.total} watches
            {search && ` matching "${search}"`}
            {rating &&
              rating !== "all" &&
              ` with ${rating === "unrated" ? "no rating" : `${rating}+ stars`}`}
          </p>
        </div>

        <div className="grid gap-4">
          {result.watches.map((watch) => {
            if (!watch.movie) return null;

            return (
              <Card
                key={watch.id}
                className="transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-4">
                  <div className="flex gap-4">
                    <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded">
                      <Image
                        src={getPosterUrl(watch.movie.posterPath)}
                        alt={watch.movie.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div>
                        <Link href={`/movies/${watch.movie.id}`}>
                          <CardTitle className="hover:underline">
                            {watch.movie.title}
                          </CardTitle>
                        </Link>
                        {watch.movie.originalTitle &&
                          watch.movie.originalTitle !== watch.movie.title && (
                            <p className="text-muted-foreground text-sm">
                              {watch.movie.originalTitle}
                            </p>
                          )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 text-sm">
                          <CalendarIcon className="h-4 w-4" />
                          <span>
                            {format(
                              toCalendarDate(watch.watchedAt),
                              "MMM d, yyyy",
                              { locale: enUS },
                            )}
                          </span>
                        </div>

                        <Badge variant="outline" className="text-xs">
                          {getWatchLocationBadge(watch.watchLocation)}
                        </Badge>

                        {watch.movie.releaseYear && (
                          <Badge variant="secondary" className="text-xs">
                            {watch.movie.releaseYear}
                          </Badge>
                        )}
                      </div>

                      {watch.rating && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Rating:</span>
                          <StarRatingDisplay rating={watch.rating} />
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {watch.review && (
                  <CardContent className="pt-0">
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-sm italic">
                        &quot;{watch.review}&quot;
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        <Pagination
          currentPage={page}
          totalPages={Math.ceil(result.total / limit)}
          hasMore={result.hasMore}
          baseUrl="/watches"
          pageSize={limit}
          searchParams={{
            ...(search && { search }),
            ...(rating && rating !== "all" && { rating }),
          }}
          total={result.total}
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading watches:", error);
    return (
      <ErrorDisplay
        title="Failed to load watch history"
        message="There was an error loading your watch history. Please try again."
      />
    );
  }
}
