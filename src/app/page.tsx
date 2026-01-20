import Link from "next/link";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { HydrateClient, api } from "~/trpc/server";
import { DashboardStatsCards } from "~/components/dashboard-stats-cards";
import { RecentWatchesList } from "~/components/recent-watches-list";
import { DashboardAddMovieCard } from "~/components/dashboard-add-movie-card";
import { Suspense } from "react";
import { LoadingSkeleton } from "~/components/loading-skeleton";
import { Button } from "~/components/ui/button";
import { BarChart3 } from "lucide-react";

export default async function Home() {
  const session = await auth();

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

        {/* Dashboard Content */}
        <div className="space-y-8">
          {/* Overview Stats Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="heading-sm">Overview</h2>
              <Link href="/statistics">
                <Button variant="outline" size="sm" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  View Detailed Statistics
                </Button>
              </Link>
            </div>
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
              <DashboardStats />
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
async function DashboardStats() {
  const [stats, top250Stats] = await Promise.all([
    api.movieWatch.getDashboardStats(),
    api.movieWatch.getImdbTop250Stats(),
  ]);
  return <DashboardStatsCards stats={stats} top250Stats={top250Stats} />;
}

// Server component for recent watches
async function DashboardRecentWatches() {
  const recentWatches = await api.movieWatch.getRecent();
  return <RecentWatchesList watches={recentWatches} />;
}
