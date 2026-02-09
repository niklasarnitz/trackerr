import Link from "next/link";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { HydrateClient, api } from "~/trpc/server";
import { RecentWatchesList } from "~/components/recent-watches-list";
import { DashboardCrossMediaStats } from "~/components/dashboard-cross-media-stats";
import { DashboardRecentlyAddedSection } from "~/components/dashboard-recently-added-section";
import { DashboardCurrentlyConsumingSection } from "~/components/dashboard-currently-consuming-section";
import { DashboardQuickActions } from "~/components/dashboard-quick-actions";
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
            Manage your movies, shows, and books in one place
          </p>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-8">
          {/* Cross-Media Overview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="heading-sm">Cross-Media Overview</h2>
              <Link href="/statistics">
                <Button variant="outline" size="sm" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  View Detailed Statistics
                </Button>
              </Link>
            </div>
            <Suspense
              fallback={
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  {Array.from({ length: 6 }).map((_, i) => (
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
              <DashboardCrossMediaOverview />
            </Suspense>
          </div>

          {/* Recently Added */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="heading-sm">Recently Added</h2>
              <Link
                href="/collection"
                className="text-muted-foreground hover:text-foreground body-sm"
              >
                Show all →
              </Link>
            </div>
            <Suspense fallback={<LoadingSkeleton cards={6} />}>
              <DashboardRecentlyAdded />
            </Suspense>
          </div>

          {/* Currently Consuming */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="heading-sm">Currently Consuming</h2>
              <Link
                href="/books"
                className="text-muted-foreground hover:text-foreground body-sm"
              >
                Show all →
              </Link>
            </div>
            <Suspense fallback={<LoadingSkeleton cards={4} />}>
              <DashboardCurrentlyConsuming />
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
        <div className="space-y-4">
          <h2 className="heading-sm">Quick Actions</h2>
          <DashboardQuickActions />
        </div>
      </div>
    </HydrateClient>
  );
}

// Server component for cross-media stats
async function DashboardCrossMediaOverview() {
  const year = new Date().getFullYear();
  const [movieStats, tvStats, bookStats] = await Promise.all([
    api.movieWatch.getStats({ year }),
    api.tvShowWatch.getStats({ year }),
    api.book.getStats(),
  ]);

  return (
    <DashboardCrossMediaStats
      movieStats={movieStats}
      tvStats={tvStats}
      bookStats={bookStats}
    />
  );
}

// Server component for recently added items
async function DashboardRecentlyAdded() {
  const [moviesResult, tvShowsResult, booksResult] = await Promise.all([
    api.movie.getAll({ sort: "created", skip: 0, limit: 4 }),
    api.tvShow.getAll({ sort: "created", skip: 0, limit: 4 }),
    api.book.getAll({ sort: "created", skip: 0, limit: 4 }),
  ]);

  return (
    <DashboardRecentlyAddedSection
      movies={moviesResult.movies}
      tvShows={tvShowsResult.tvShows}
      books={booksResult.books}
    />
  );
}

// Server component for currently consuming items
async function DashboardCurrentlyConsuming() {
  const [readingBooksResult, watchingShowsResult] = await Promise.all([
    api.book.getAll({ status: "READING", sort: "updated", skip: 0, limit: 4 }),
    api.tvShow.getAll({ sort: "watched", skip: 0, limit: 6 }),
  ]);

  const watchingShows = watchingShowsResult.tvShows
    .filter((show) => show._count.watches > 0)
    .slice(0, 4);

  return (
    <DashboardCurrentlyConsumingSection
      readingBooks={readingBooksResult.books}
      watchingShows={watchingShows}
    />
  );
}

// Server component for recent watches
async function DashboardRecentWatches() {
  const recentWatches = await api.movieWatch.getRecent();
  return <RecentWatchesList watches={recentWatches} />;
}
