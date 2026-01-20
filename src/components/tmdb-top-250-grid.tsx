"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { OptimizedCoverImage } from "~/components/optimized-cover-image";
import { getPosterUrl } from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/react";

type TmdbTop250Movie = RouterOutputs["tmdbTop250"]["getAll"][number];

interface TmdbTop250GridProps {
  movies: TmdbTop250Movie[];
}

export function TmdbTop250Grid({ movies }: TmdbTop250GridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {movies.map((movie) => (
        <Card key={movie.id} className="group relative overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-2/3 w-full">
              {movie.posterPath ? (
                <OptimizedCoverImage
                  src={getPosterUrl(movie.posterPath, "w342")}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                />
              ) : (
                <div className="bg-muted flex h-full w-full items-center justify-center">
                  <span className="text-muted-foreground text-xs">
                    No poster
                  </span>
                </div>
              )}

              {/* Watch status indicator */}
              <div className="absolute top-2 right-2">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded ${
                    movie.isWatched
                      ? "bg-green-500"
                      : "border-2 border-white bg-white/20 backdrop-blur-sm"
                  }`}
                >
                  {movie.isWatched && <Check className="h-4 w-4 text-white" />}
                </div>
              </div>

              {/* Rank badge */}
              <div className="absolute bottom-2 left-2">
                <div className="rounded bg-black/80 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  #{movie.rank}
                </div>
              </div>
            </div>

            {/* Title and year */}
            <div className="p-3">
              <h3 className="line-clamp-2 text-sm font-medium">
                {movie.title}
              </h3>
              {movie.year && (
                <p className="text-muted-foreground mt-1 text-xs">
                  {movie.year}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
