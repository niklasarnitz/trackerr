import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { OptimizedCoverImage } from "~/components/optimized-cover-image";
import type { RouterOutputs } from "~/trpc/react";

type Movie = RouterOutputs["movie"]["getById"];

interface MovieDetailHeaderProps {
  movie: Movie;
}

export function MovieDetailHeader({ movie }: MovieDetailHeaderProps) {
  const getPosterUrl = (posterPath: string | null) => {
    return posterPath ? `${posterPath}` : "/placeholder-movie.jpg";
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/movies">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex-1" />
      </div>

      {/* Movie Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
              <div className="relative aspect-2/3 overflow-hidden rounded-lg">
                <OptimizedCoverImage
                  src={movie.posterPath}
                  alt={movie.title}
                  blurDataUrl={movie.blurDataUrl}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">{movie.title}</h1>
                  {movie.originalTitle &&
                    movie.originalTitle !== movie.title && (
                      <p className="text-muted-foreground mt-1 text-lg">
                        {movie.originalTitle}
                      </p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {movie.releaseYear && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <CalendarIcon className="h-3 w-3" />
                      {movie.releaseYear}
                    </Badge>
                  )}
                  {movie.runtime && (
                    <Badge variant="secondary">{movie.runtime} min</Badge>
                  )}
                  <Badge variant="outline">
                    {movie._count.watches} watch
                    {movie._count.watches !== 1 ? "es" : ""}
                  </Badge>
                  <Badge variant="outline">
                    {movie._count.mediaEntries} media entr
                    {movie._count.mediaEntries !== 1 ? "ies" : "y"}
                  </Badge>
                </div>

                {movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <Badge key={genre} variant="outline">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                )}

                {(movie.director || movie.cast.length > 0) && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {movie.director && (
                      <div>
                        <div className="text-sm font-semibold">Director</div>
                        <div className="text-muted-foreground text-sm">
                          {movie.director}
                        </div>
                      </div>
                    )}
                    {movie.cast.length > 0 && (
                      <div>
                        <div className="text-sm font-semibold">Cast</div>
                        <div className="text-muted-foreground text-sm">
                          {movie.cast.join(", ")}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {movie.overview && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Overview</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {movie.overview}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />
    </>
  );
}
