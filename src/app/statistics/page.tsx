import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { HydrateClient, api } from "~/trpc/server";
import { WatchAnalyticsCharts } from "~/components/watch-analytics-charts";
import { CinemaInsightsPanel } from "~/components/cinema-insights-panel";
import { WatchInsightsPanel } from "~/components/watch-insights-panel";
import { CollectionInsightsPanel } from "~/components/collection-insights-panel";
import { TvShowInsightsPanel } from "~/components/tv-show-insights-panel";
import { CreativeInsightsPanel } from "~/components/creative-insights-panel";
import { Suspense } from "react";
import { StatisticsSummaryCards } from "~/components/statistics-summary-cards";

export default async function StatisticsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const [allTimeStats, currentYearStats] = await Promise.all([
    api.movieWatch.getStats({ year: "all" }),
    api.movieWatch.getStats({ year: new Date().getFullYear() }),
  ]);

  return (
    <HydrateClient>
      <div className="container mx-auto space-y-8 px-4 py-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="heading-xl">Statistics</h1>
          <p className="text-muted-foreground body-lg">
            Detailed insights into your viewing habits and collection
          </p>
        </div>

        {/* Summary Cards */}
        <StatisticsSummaryCards
          allTimeStats={allTimeStats}
          currentYearStats={currentYearStats}
        />

        {/* Dashboard Content */}
        <div className="space-y-8">
          {/* Watch Analytics */}
          <div className="space-y-4">
            <h2 className="heading-sm">Watch Trends</h2>
            <Suspense
              fallback={
                <div className="bg-card rounded-lg border p-6">
                  <div className="bg-muted mb-4 h-6 w-48 animate-pulse rounded" />
                  <div className="bg-muted h-64 animate-pulse rounded" />
                </div>
              }
            >
              <WatchAnalyticsSection year="all" />
            </Suspense>
          </div>

          {/* Creative Insights */}
          <div className="space-y-4">
            <h2 className="heading-sm">Creative Insights</h2>
            <Suspense
              fallback={
                <div className="bg-card rounded-lg border p-6">
                  <div className="bg-muted mb-4 h-6 w-48 animate-pulse rounded" />
                  <div className="bg-muted h-64 animate-pulse rounded" />
                </div>
              }
            >
              <CreativeInsightsSection year="all" />
            </Suspense>
          </div>

          {/* Watch Insights */}
          <div className="space-y-4">
            <WatchInsightsSection year="all" />
          </div>

          {/* TV Show Insights */}
          <div className="space-y-4">
            <Suspense
              fallback={
                <div className="bg-card rounded-lg border p-6">
                  <div className="bg-muted mb-4 h-6 w-48 animate-pulse rounded" />
                  <div className="bg-muted h-64 animate-pulse rounded" />
                </div>
              }
            >
              <TvShowInsightsSection year="all" />
            </Suspense>
          </div>

          {/* Collection Insights */}
          <div className="space-y-4">
            <CollectionInsightsSection />
          </div>

          {/* Cinema Insights */}
          <div className="space-y-4">
            <Suspense
              fallback={
                <div className="bg-card rounded-lg border p-6">
                  <div className="bg-muted mb-4 h-6 w-48 animate-pulse rounded" />
                  <div className="bg-muted h-64 animate-pulse rounded" />
                </div>
              }
            >
              <CinemaInsightsSection />
            </Suspense>
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}

// Server component for charts
async function WatchAnalyticsSection({ year }: { year?: number | "all" }) {
  const [locationStats, ratingStats, monthlyTrends, streamingStats] =
    await Promise.all([
      api.movieWatch.getWatchLocationStats({ year }),
      api.movieWatch.getRatingDistribution({ year }),
      api.movieWatch.getMonthlyTrends({ year }),
      api.movieWatch.getStreamingServiceStats({ year }),
    ]);

  return (
    <WatchAnalyticsCharts
      locationStats={locationStats}
      ratingStats={ratingStats}
      monthlyTrends={monthlyTrends}
      streamingStats={streamingStats}
    />
  );
}

async function CreativeInsightsSection({ year }: { year?: number | "all" }) {
  const stats = await api.movieWatch.getCreativeStats({ year });
  return <CreativeInsightsPanel stats={stats} />;
}

async function WatchInsightsSection({ year }: { year?: number | "all" }) {
  const [
    topRated,
    mostWatched,
    rewatches,
    ratingByLocation,
    ratingByService,
    decadeDistribution,
    streakStats,
    dayOfWeekStats,
    mostWatchedGenres,
  ] = await Promise.all([
    api.movieWatch.getTopRatedMovies(),
    api.movieWatch.getMostWatchedMovies(),
    api.movieWatch.getRewatchesStats(),
    api.movieWatch.getRatingByLocation(),
    api.movieWatch.getRatingByStreamingService(),
    api.movieWatch.getDecadeDistribution(),
    api.movieWatch.getWatchStreakStats(),
    api.movieWatch.getDayOfWeekStats(),
    api.movieWatch.getMostWatchedGenres({ year }),
  ]);

  return (
    <WatchInsightsPanel
      topRated={topRated}
      mostWatched={mostWatched}
      rewatches={rewatches}
      ratingByLocation={ratingByLocation}
      ratingByService={ratingByService}
      decadeDistribution={decadeDistribution}
      streakStats={streakStats}
      dayOfWeekStats={dayOfWeekStats}
      mostWatchedGenres={mostWatchedGenres}
    />
  );
}

async function CollectionInsightsSection() {
  const [collectionStats, mediumDist, physicalVirtual, rippedStats, growth] =
    await Promise.all([
      api.mediaEntry.getCollectionStats(),
      api.mediaEntry.getMediumDistribution(),
      api.mediaEntry.getPhysicalVirtualStats(),
      api.mediaEntry.getRippedStats(),
      api.mediaEntry.getCollectionGrowth(),
    ]);

  return (
    <CollectionInsightsPanel
      collectionStats={collectionStats}
      mediumDist={mediumDist}
      physicalVirtual={physicalVirtual}
      rippedStats={rippedStats}
      growth={growth}
    />
  );
}

async function TvShowInsightsSection({ year }: { year?: number | "all" }) {
  const [stats, monthlyTrends, topRated, mostWatched, dayOfWeekStats] =
    await Promise.all([
      api.tvShowWatch.getStats({ year }),
      api.tvShowWatch.getMonthlyTrends({ year }),
      api.tvShowWatch.getTopRatedShows(),
      api.tvShowWatch.getMostWatchedShows(),
      api.tvShowWatch.getDayOfWeekStats(),
    ]);

  return (
    <TvShowInsightsPanel
      stats={stats}
      monthlyTrends={monthlyTrends}
      topRated={topRated}
      mostWatched={mostWatched}
      dayOfWeekStats={dayOfWeekStats}
    />
  );
}

async function CinemaInsightsSection() {
  const [
    cinemaStats,
    soundSystemStats,
    projectionTypeStats,
    languageTypeStats,
    aspectRatioStats,
    ticketPriceStats,
    monthlySpending,
  ] = await Promise.all([
    api.movieWatch.getCinemaStats(),
    api.movieWatch.getSoundSystemStats(),
    api.movieWatch.getProjectionTypeStats(),
    api.movieWatch.getLanguageTypeStats(),
    api.movieWatch.getAspectRatioStats(),
    api.movieWatch.getCinemaTicketPriceStats(),
    api.movieWatch.getMonthlySpendingStats(),
  ]);

  return (
    <CinemaInsightsPanel
      cinemaStats={cinemaStats}
      soundSystemStats={soundSystemStats}
      projectionTypeStats={projectionTypeStats}
      languageTypeStats={languageTypeStats}
      aspectRatioStats={aspectRatioStats}
      ticketPriceStats={ticketPriceStats}
      monthlySpending={monthlySpending}
    />
  );
}
