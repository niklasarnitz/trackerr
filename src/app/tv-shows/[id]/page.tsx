import { Suspense } from "react";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { api } from "~/trpc/server";
import { TvShowActions } from "./tv-show-actions";
import { TvShowSeasons } from "./tv-show-seasons";
import { TvShowWatchHistory } from "./tv-show-watch-history";
import { MediaDetailHeader } from "~/components/media-detail-header";
import {
  MediaTitleSection,
  createMetadataBadges,
} from "~/components/media-title-section";
import { MediaDetailSection } from "~/components/media-detail-section";
import { TagList } from "~/components/tag-list";

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

  const badges = createMetadataBadges({
    year: firstAirYear,
    status: tvShow.status ?? undefined,
    network: tvShow.network,
    watchCount: tvShow._count.watches,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* Poster */}
        <MediaDetailHeader
          type="tvshow"
          posterPath={tvShow.posterPath}
          blurDataUrl={tvShow.blurDataUrl}
          title={tvShow.title}
          alt={tvShow.title}
          actions={<TvShowActions tvShow={tvShow} />}
        />

        {/* Details */}
        <div className="space-y-6">
          <MediaTitleSection
            title={tvShow.title}
            originalTitle={tvShow.originalTitle}
            badges={badges}
          />

          {tvShow.overview && (
            <MediaDetailSection title="Overview">
              <p className="text-muted-foreground">{tvShow.overview}</p>
            </MediaDetailSection>
          )}

          {tvShow.genres.length > 0 && (
            <MediaDetailSection title="Genres">
              <TagList tags={tvShow.genres} />
            </MediaDetailSection>
          )}

          {tvShow.cast.length > 0 && (
            <MediaDetailSection title="Cast">
              <TagList tags={tvShow.cast} variant="outline" />
            </MediaDetailSection>
          )}

          {tvShow.notes && (
            <MediaDetailSection title="Notes">
              <p className="text-muted-foreground whitespace-pre-wrap">
                {tvShow.notes}
              </p>
            </MediaDetailSection>
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
