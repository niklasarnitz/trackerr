import { Suspense } from "react";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { api } from "~/trpc/server";
import { MovieActions } from "~/components/movie-actions";
import { MovieWatchHistory } from "~/components/movie-watch-history";
import { MediaDetailHeader } from "~/components/media-detail-header";
import {
  MediaTitleSection,
  createMetadataBadges,
} from "~/components/media-title-section";
import { MediaDetailSection } from "~/components/media-detail-section";
import { TagList } from "~/components/tag-list";

interface MovieDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    addWatch?: string;
  }>;
}

export default async function MovieDetailPage({
  params,
  searchParams,
}: MovieDetailPageProps) {
  const { id } = await params;
  const { addWatch } = await searchParams;

  let movie;
  try {
    movie = await api.movie.getById({ id });
  } catch {
    notFound();
  }

  const releaseYear = movie.releaseYear
    ? format(new Date(movie.releaseYear, 0, 1), "yyyy")
    : null;

  const badges = createMetadataBadges({
    year: releaseYear,
    runtime: movie.runtime,
    watchCount: movie._count.watches,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* Poster */}
        <MediaDetailHeader
          type="movie"
          posterPath={movie.posterPath}
          blurDataUrl={movie.blurDataUrl}
          title={movie.title}
          alt={movie.title}
          actions={<MovieActions movie={movie} />}
        />

        {/* Details */}
        <div className="space-y-6">
          <MediaTitleSection
            title={movie.title}
            originalTitle={movie.originalTitle}
            badges={badges}
          />

          {movie.overview && (
            <MediaDetailSection title="Overview">
              <p className="text-muted-foreground">{movie.overview}</p>
            </MediaDetailSection>
          )}

          {movie.genres.length > 0 && (
            <MediaDetailSection title="Genres">
              <TagList tags={movie.genres} />
            </MediaDetailSection>
          )}

          {movie.director && (
            <MediaDetailSection title="Director">
              <p className="text-muted-foreground">{movie.director}</p>
            </MediaDetailSection>
          )}

          {movie.cast.length > 0 && (
            <MediaDetailSection title="Cast">
              <TagList tags={movie.cast} variant="outline" />
            </MediaDetailSection>
          )}

          {movie.notes && (
            <MediaDetailSection title="Notes">
              <p className="text-muted-foreground whitespace-pre-wrap">
                {movie.notes}
              </p>
            </MediaDetailSection>
          )}

          <Suspense fallback={<div>Loading watch history...</div>}>
            <MovieWatchHistory
              movieId={id}
              watches={movie.watches}
              openAddWatch={addWatch === "true"}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
