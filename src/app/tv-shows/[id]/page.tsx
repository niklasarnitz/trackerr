import { Suspense } from "react";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { api } from "~/trpc/server";
import { OptimizedCoverImage } from "~/components/optimized-cover-image";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tv, Calendar, Star, Eye } from "lucide-react";
import { TvShowActions } from "./tv-show-actions";
import { TvShowSeasons } from "./tv-show-seasons";
import { TvShowWatchHistory } from "./tv-show-watch-history";

interface TvShowDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TvShowDetailPage({
  params,
}: TvShowDetailPageProps) {
  const { id } = await params;

  let tvShow;
  try {
    tvShow = await api.tvShow.getById({ id });
  } catch {
    notFound();
  }

  const firstAirYear = tvShow.firstAirDate
    ? format(new Date(tvShow.firstAirDate), "yyyy")
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* Poster */}
        <div>
          <div className="sticky top-8">
            <div className="bg-muted relative aspect-[2/3] overflow-hidden rounded-lg">
              {tvShow.posterPath ? (
                <OptimizedCoverImage
                  src={tvShow.posterPath}
                  alt={tvShow.title}
                  fill
                  sizes="300px"
                  className="object-cover"
                  blurDataUrl={tvShow.blurDataUrl ?? undefined}
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Tv className="text-muted-foreground h-24 w-24" />
                </div>
              )}
            </div>

            <TvShowActions tvShow={tvShow} />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h1 className="heading-lg mb-2">{tvShow.title}</h1>
                {tvShow.originalTitle &&
                  tvShow.originalTitle !== tvShow.title && (
                    <p className="text-muted-foreground">
                      {tvShow.originalTitle}
                    </p>
                  )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {firstAirYear && (
                <Badge variant="secondary">
                  <Calendar className="mr-1 h-3 w-3" />
                  {firstAirYear}
                </Badge>
              )}
              {tvShow.status && (
                <Badge variant="outline">{tvShow.status}</Badge>
              )}
              {tvShow.network && (
                <Badge variant="outline">{tvShow.network}</Badge>
              )}
              {tvShow._count.watches > 0 && (
                <Badge variant="secondary">
                  <Eye className="mr-1 h-3 w-3" />
                  {tvShow._count.watches} watch
                  {tvShow._count.watches !== 1 ? "es" : ""}
                </Badge>
              )}
            </div>
          </div>

          {tvShow.overview && (
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{tvShow.overview}</p>
              </CardContent>
            </Card>
          )}

          {tvShow.genres.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Genres</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tvShow.genres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {tvShow.cast.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Cast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tvShow.cast.map((actor) => (
                    <Badge key={actor} variant="outline">
                      {actor}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {tvShow.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {tvShow.notes}
                </p>
              </CardContent>
            </Card>
          )}

          <Suspense fallback={<div>Loading seasons...</div>}>
            <TvShowSeasons tvShowId={id} seasons={tvShow.seasons} />
          </Suspense>

          <Suspense fallback={<div>Loading watch history...</div>}>
            <TvShowWatchHistory tvShowId={id} watches={tvShow.watches} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
