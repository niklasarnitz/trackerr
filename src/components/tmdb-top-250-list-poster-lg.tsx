"use client";

import { CheckSquare, Square } from "lucide-react";
import { OptimizedCoverImage } from "~/components/optimized-cover-image";
import { getPosterUrl } from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/react";

type TmdbTop250Movie = RouterOutputs["tmdbTop250"]["getAll"][number];

interface TmdbTop250ListPosterLgProps {
  movies: TmdbTop250Movie[];
}

export function TmdbTop250ListPosterLg({
  movies,
}: TmdbTop250ListPosterLgProps) {
  return (
    <div className="divide-border rounded-lg border">
      {movies.map((movie) => (
        <div
          key={movie.id}
          className="bg-card hover:bg-muted/50 flex items-center gap-3 p-3"
        >
          {/* Rank before the movie */}
          <div className="text-muted-foreground w-10 shrink-0 text-right text-xs font-semibold">
            #{movie.rank}
          </div>

          {/* Larger poster thumbnail */}
          <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded">
            <OptimizedCoverImage
              src={getPosterUrl(movie.posterPath)}
              alt={movie.title}
              width={64}
              height={96}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{movie.title}</p>
              {movie.year && (
                <p className="text-muted-foreground text-xs">{movie.year}</p>
              )}
            </div>

            <div className="flex items-center">
              {movie.isWatched ? (
                <CheckSquare className="h-5 w-5 text-green-500" />
              ) : (
                <Square className="text-muted-foreground h-5 w-5" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
