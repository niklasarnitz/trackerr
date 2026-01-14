"use client";

import { TvShowCard } from "~/components/tv-show-card";
import type { RouterOutputs } from "~/trpc/react";

type TvShow = RouterOutputs["tvShow"]["getAll"]["tvShows"][number];

interface TvShowsGridProps {
  tvShows: TvShow[];
  onTvShowUpdated?: () => void;
}

export function TvShowsGrid({ tvShows, onTvShowUpdated }: TvShowsGridProps) {
  if (tvShows.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">
            No TV shows found. Start by adding your first show!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {tvShows.map((tvShow) => (
        <TvShowCard
          key={tvShow.id}
          tvShow={tvShow}
          onTvShowUpdated={onTvShowUpdated}
        />
      ))}
    </div>
  );
}
