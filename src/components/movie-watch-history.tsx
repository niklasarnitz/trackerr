"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { StarRatingDisplay } from "~/components/star-rating-display";
import { Calendar, MapPin } from "lucide-react";
import { MovieWatchCard } from "~/components/movie-watch-card";
import { AddMovieWatchDialog } from "~/components/add-movie-watch-dialog";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import type { RouterOutputs } from "~/trpc/react";

type Watch = RouterOutputs["movieWatch"]["getByMovieId"][number];

interface MovieWatchHistoryProps {
  watches: Watch[];
  movieId: string;
  openAddWatch?: boolean;
}

export function MovieWatchHistory({
  watches,
  movieId,
  openAddWatch = false,
}: MovieWatchHistoryProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const [isAddWatchOpen, setIsAddWatchOpen] = useState(openAddWatch);

  const handleAddWatchSuccess = () => {
    utils.movie.getById.invalidate({ id: movieId });
    router.refresh();
  };

  if (watches.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Watch History</CardTitle>
          <AddMovieWatchDialog
            movieId={movieId}
            onSuccess={handleAddWatchSuccess}
            isOpen={isAddWatchOpen}
            onOpenChange={setIsAddWatchOpen}
          />
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
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Watch History</CardTitle>
        <AddMovieWatchDialog
          movieId={movieId}
          onSuccess={handleAddWatchSuccess}
          isOpen={isAddWatchOpen}
          onOpenChange={setIsAddWatchOpen}
        />
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
