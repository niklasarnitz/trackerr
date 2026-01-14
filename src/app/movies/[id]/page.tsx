import { Suspense } from "react";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { api } from "~/trpc/server";
import { OptimizedCoverImage } from "~/components/optimized-cover-image";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Film, Calendar, Clock, Star, Eye } from "lucide-react";
import { MovieActions } from "~/components/movie-actions";
import { MovieWatchHistory } from "~/components/movie-watch-history";

interface MovieDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MovieDetailPage({
  params,
}: MovieDetailPageProps) {
  const { id } = await params;

  let movie;
  try {
    movie = await api.movie.getById({ id });
  } catch {
    notFound();
  }

  const releaseYear = movie.releaseYear
    ? format(new Date(movie.releaseYear, 0, 1), "yyyy")
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* Poster */}
        <div>
          <div className="sticky top-8">
            <div className="bg-muted relative aspect-2/3 overflow-hidden rounded-lg">
              {movie.posterPath ? (
                <OptimizedCoverImage
                  src={movie.posterPath}
                  alt={movie.title}
                  fill
                  sizes="300px"
                  className="object-cover"
                  blurDataUrl={movie.blurDataUrl ?? undefined}
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Film className="text-muted-foreground h-24 w-24" />
                </div>
              )}
            </div>

            <MovieActions movie={movie} />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h1 className="heading-lg mb-2">{movie.title}</h1>
                {movie.originalTitle && movie.originalTitle !== movie.title && (
                  <p className="text-muted-foreground">{movie.originalTitle}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {releaseYear && (
                <Badge variant="secondary">
                  <Calendar className="mr-1 h-3 w-3" />
                  {releaseYear}
                </Badge>
              )}
              {movie.runtime && (
                <Badge variant="secondary">
                  <Clock className="mr-1 h-3 w-3" />
                  {movie.runtime}m
                </Badge>
              )}
              {movie._count.watches > 0 && (
                <Badge variant="secondary">
                  <Eye className="mr-1 h-3 w-3" />
                  {movie._count.watches} watch
                  {movie._count.watches !== 1 ? "es" : ""}
                </Badge>
              )}
            </div>
          </div>

          {movie.overview && (
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{movie.overview}</p>
              </CardContent>
            </Card>
          )}

          {movie.genres.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Genres</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {movie.director && (
            <Card>
              <CardHeader>
                <CardTitle>Director</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{movie.director}</p>
              </CardContent>
            </Card>
          )}

          {movie.cast.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Cast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {movie.cast.map((actor) => (
                    <Badge key={actor} variant="outline">
                      {actor}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {movie.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {movie.notes}
                </p>
              </CardContent>
            </Card>
          )}

          <Suspense fallback={<div>Loading watch history...</div>}>
            <MovieWatchHistory movieId={id} watches={movie.watches} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
