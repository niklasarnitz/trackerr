import Link from "next/link";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { HydrateClient, api } from "~/trpc/server";
import { DashboardStatsCards } from "~/components/dashboard-stats-cards";
import { RecentWatchesList } from "~/components/recent-watches-list";
import { WatchAnalyticsCharts } from "~/components/watch-analytics-charts";
import { CinemaInsightsPanel } from "~/components/cinema-insights-panel";
import { DashboardAddMovieCard } from "~/components/dashboard-add-movie-card";
import { WatchInsightsPanel } from "~/components/watch-insights-panel";
import { CollectionInsightsPanel } from "~/components/collection-insights-panel";
import { TvShowInsightsPanel } from "~/components/tv-show-insights-panel";
import { Suspense } from "react";
import { DashboardYearSelector } from "~/components/dashboard-year-selector";
import { LoadingSkeleton } from "~/components/loading-skeleton";

interface HomeProps {
  searchParams: Promise<{
    year?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const session = await auth();
  const params = await searchParams;
  const year =
    params.year === "all"
      ? "all"
      : params.year
        ? parseInt(params.year)
        : undefined;

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <HydrateClient>
      <div className="container mx-auto space-y-8 px-4 py-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="heading-xl">Trackerr</h1>
          <p className="text-muted-foreground body-lg">
            Manage your movies and track your viewing habits
          </p>
        </div>

        {/* Year Selector */}
        <DashboardYearSelector currentYear={year} />

        {/* Dashboard Content */}
        <div className="space-y-8">
          {/* Overview Stats Cards */}
          <div className="space-y-4">
            <h2 className="heading-sm">Overview</h2>
            <Suspense
              fallback={
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-card animate-pulse rounded-lg border p-6"
                    >
                      <div className="bg-muted mb-2 h-4 w-24 rounded" />
                      <div className="bg-muted mb-1 h-8 w-16 rounded" />
                      <div className="bg-muted h-3 w-20 rounded" />
                    </div>
                  ))}
                </div>
              }
            >
              <DashboardStats year={year} />
            </Suspense>
          </div>

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
              <WatchAnalyticsSection year={year} />
            </Suspense>
          </div>

          {/* Watch Insights */}
          <div className="space-y-4">
            <WatchInsightsSection year={year} />
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
              <TvShowInsightsSection year={year} />
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

          {/* Recent Watches */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="heading-sm">Recently Watched Movies</h2>
              <Link
                href="/watches"
                className="text-muted-foreground hover:text-foreground body-sm"
              >
                Show all →
              </Link>
            </div>
            <Suspense fallback={<LoadingSkeleton cards={5} />}>
              <DashboardRecentWatches />
            </Suspense>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-1">
          <DashboardAddMovieCard />
        </div>
      </div>
    </HydrateClient>
  );
}

// Server component for stats
async function DashboardStats({ year }: { year?: number | "all" }) {
  const [stats, top250Stats] = await Promise.all([
    api.movieWatch.getStats({ year }),
    api.movieWatch.getImdbTop250Stats(),
  ]);
  return <DashboardStatsCards stats={stats} top250Stats={top250Stats} />;
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

// Server component for recent watches
async function DashboardRecentWatches() {
  const recentWatches = await api.movieWatch.getRecent();
  return <RecentWatchesList watches={recentWatches} />;
}
