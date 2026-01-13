import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { toCalendarDate } from "~/lib/watch-date";
import Link from "next/link";
import { StarRatingDisplay } from "~/components/star-rating-display";
import { AddMovieLink } from "~/components/add-movie-button";
import type { RouterOutputs } from "~/trpc/react";

interface RecentWatchesListProps {
  watches: RouterOutputs["movieWatch"]["getRecent"];
}

export function RecentWatchesList({ watches }: RecentWatchesListProps) {
  const safeRecentWatches = watches ?? [];

  if (safeRecentWatches.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No movies watched yet</p>
          <AddMovieLink className="mt-4 inline-flex items-center gap-2 text-sm">
            Add first movie →
          </AddMovieLink>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {safeRecentWatches.map((watch) => {
        if (!watch?.movie) return null;

        return (
          <Card key={watch.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="line-clamp-1 text-lg">
                  {watch.movie.title}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {watch.movie.releaseYear ?? "—"}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                No description available
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Rating:</span>
                  {watch.rating ? (
                    <StarRatingDisplay rating={watch.rating} />
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      No rating
                    </span>
                  )}
                </div>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(toCalendarDate(watch.watchedAt), "dd MMMM yyyy", {
                    locale: enUS,
                  })}
                </span>
              </div>
              {watch.review && (
                <div className="text-sm">
                  <p className="line-clamp-2">{watch.review}</p>
                </div>
              )}
              <div className="pt-2">
                <Link
                  href={`/movies/${watch.movie.id}`}
                  className="text-primary text-sm hover:underline"
                >
                  View details →
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
