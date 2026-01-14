"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { RouterOutputs } from "~/trpc/react";
import { TvShowWatchCard } from "~/components/tv-show-watch-card";

type Watch = RouterOutputs["tvShow"]["getById"]["watches"][number];

interface TvShowWatchHistoryProps {
  tvShowId: string;
  watches: Watch[];
  onUpdate?: () => void;
}

export function TvShowWatchHistory({
  watches,
  onUpdate,
}: TvShowWatchHistoryProps) {
  if (watches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Watch History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No watch history yet. Mark episodes as watched to track your
            progress.
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
            <TvShowWatchCard
              key={watch.id}
              watch={watch}
              onUpdate={() => onUpdate?.()}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
