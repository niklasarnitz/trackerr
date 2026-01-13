import Link from "next/link";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { HydrateClient, api } from "~/trpc/server";
import { DashboardStatsCards } from "~/components/dashboard-stats-cards";
import { RecentWatchesList } from "~/components/recent-watches-list";
import { DashboardCharts } from "~/components/dashboard-charts";
import { CinemaDashboardCharts } from "~/components/cinema-dashboard-charts";
import { DashboardAddMovieCard } from "~/components/dashboard-add-movie-card";
import { AdvancedStatistics } from "~/components/advanced-statistics";
import { CollectionStatistics } from "~/components/collection-statistics";
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
            <h2 className="heading-sm">Watch Analytics</h2>
            <Suspense
              fallback={
                <div className="bg-card rounded-lg border p-6">
                  <div className="bg-muted mb-4 h-6 w-48 animate-pulse rounded" />
                  <div className="bg-muted h-64 animate-pulse rounded" />
                </div>
              }
            >
              <DashboardChartsWrapper year={year} />
            </Suspense>
          </div>

          {/* Collection Statistics */}
          <div className="space-y-4">
            <CollectionStatistics />
          </div>

          {/* Advanced Watch Statistics */}
          <div className="space-y-4">
            <AdvancedStatistics />
          </div>

          {/* Cinema Statistics */}
          <div className="space-y-4">
            <Suspense
              fallback={
                <div className="bg-card rounded-lg border p-6">
                  <div className="bg-muted mb-4 h-6 w-48 animate-pulse rounded" />
                  <div className="bg-muted h-64 animate-pulse rounded" />
                </div>
              }
            >
              <CinemaDashboardCharts />
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
  const stats = await api.movieWatch.getStats({ year });
  return <DashboardStatsCards stats={stats} />;
}

// Server component for charts
async function DashboardChartsWrapper({ year }: { year?: number | "all" }) {
  return <DashboardCharts year={year} />;
}

// Server component for recent watches
async function DashboardRecentWatches() {
  const recentWatches = await api.movieWatch.getRecent();
  return <RecentWatchesList watches={recentWatches} />;
}
