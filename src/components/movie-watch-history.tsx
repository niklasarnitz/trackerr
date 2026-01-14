"use client";

import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { StarRatingDisplay } from "~/components/star-rating-display";
import { Calendar, MapPin } from "lucide-react";
import { MovieWatchCard } from "~/components/movie-watch-card";
import type { RouterOutputs } from "~/trpc/react";

type Watch = RouterOutputs["movieWatch"]["getByMovieId"][number];

interface MovieWatchHistoryProps {
  watches: Watch[];
  movieId: string;
}

export function MovieWatchHistory({
  watches,
  movieId,
}: MovieWatchHistoryProps) {
  if (watches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Watch History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No watch history yet. Add a watch to track your viewing history.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Watch History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {watches.map((watch) => (
            <MovieWatchCard
              key={watch.id}
              watch={watch}
              onUpdate={() => {
                // Component will be refetched via query invalidation
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
