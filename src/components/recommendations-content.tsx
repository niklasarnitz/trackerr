"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback } from "react";
import { Plus, Star, Calendar, CheckCircle, ExternalLink } from "lucide-react";

import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { getPosterUrl } from "~/lib/utils";
import { useMovieMutations } from "~/hooks/use-movie-mutations";

export function RecommendationsContent() {
  const { data, isLoading, error } =
    api.recommendation.getRecommendations.useQuery(undefined);

  const utils = api.useUtils();
  const { createMovie } = useMovieMutations();

  const formatRating = useCallback((rating: number) => {
    return (rating / 2).toFixed(1);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">Loading recommendations...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-8">{error.message}</CardContent>
      </Card>
    );
  }

  const recommendations = data?.recommendations ?? [];

  return (
    <div className="space-y-6">
      {data?.basedOnGenres && data.basedOnGenres.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Based on your genres</CardTitle>
            <CardDescription>{data.basedOnGenres.join(", ")}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((movie) => {
          const MovieCardContent = (
            <Card
              key={movie.id}
              className={`overflow-hidden ${movie.inCollection ? "cursor-pointer transition-shadow hover:shadow-lg" : ""}`}
            >
              <div className="relative aspect-2/3">
                <Image
                  src={getPosterUrl(movie.posterPath)}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
                {movie.inCollection && (
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      In Collection
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-lg leading-tight">
                  {movie.title}
                </CardTitle>
                {movie.originalTitle && movie.originalTitle !== movie.title && (
                  <CardDescription className="text-sm">
                    {movie.originalTitle}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="pt-0">
                <div className="text-muted-foreground mb-3 flex items-center gap-4 text-sm">
                  {movie.releaseYear && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {movie.releaseYear}
                    </div>
                  )}
                  {typeof movie.voteAverage === "number" &&
                    movie.voteAverage > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {formatRating(movie.voteAverage)}/5
                      </div>
                    )}
                </div>

                {movie.overview && (
                  <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
                    {movie.overview}
                  </p>
                )}

                <Button
                  onClick={async () => {
                    if (movie.inCollection) return;
                    await createMovie.mutateAsync({ tmdbId: movie.id });
                    await utils.recommendation.getRecommendations.invalidate();
                  }}
                  disabled={movie.inCollection || createMovie.isPending}
                  className="w-full"
                  variant={movie.inCollection ? "secondary" : "default"}
                >
                  {movie.inCollection ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      In Collection
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add to Collection
                    </>
                  )}
                </Button>

                {movie.inCollection && movie.movieId && (
                  <Button variant="default" className="mt-2 w-full" asChild>
                    <Link href={`/movies/${movie.movieId}`}>
                      <ExternalLink className="mr-1 h-3 w-3" />
                      Go to Movie
                    </Link>
                  </Button>
                )}

                <Button variant="outline" className="mt-2 w-full" asChild>
                  <a
                    href={`https://www.themoviedb.org/movie/${movie.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-1 h-3 w-3" />
                    TMDB
                  </a>
                </Button>
              </CardContent>
            </Card>
          );

          if (movie.inCollection && movie.movieId) {
            return (
              <Link key={movie.id} href={`/movies/${movie.movieId}`}>
                {MovieCardContent}
              </Link>
            );
          }

          return MovieCardContent;
        })}

        {recommendations.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No recommendations yet</CardTitle>
              <CardDescription>
                Rate more movies (4+ stars) to improve recommendations.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
