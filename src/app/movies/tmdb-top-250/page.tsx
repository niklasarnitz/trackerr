import { Suspense } from "react";
import Link from "next/link";
import { TmdbTop250ListPosterLg } from "~/components/tmdb-top-250-list-poster-lg";
import { LoadingSkeleton } from "~/components/loading-skeleton";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { api } from "~/trpc/server";

async function TmdbTop250Content() {
  const movies = await api.tmdbTop250.getAll();

  const watchedCount = movies.filter((m) => m.isWatched).length;
  const totalCount = movies.length;
  const percentage =
    totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Progress</p>
            <p className="text-2xl font-bold">
              {watchedCount} / {totalCount}
            </p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-sm">Completion</p>
            <p className="text-2xl font-bold">{percentage}%</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4">
          <div className="bg-muted h-2 w-full rounded">
            <div
              className="h-2 rounded bg-green-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      <TmdbTop250ListPosterLg movies={movies} />
    </div>
  );
}

export default async function TmdbTop250Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="mb-4">
          <Button variant="ghost" asChild>
            <Link href="/movies">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Movies
            </Link>
          </Button>
        </div>
        <div>
          <h1 className="heading-lg mb-2">TMDB Top 250</h1>
          <p className="text-muted-foreground body-md">
            Track your progress through the top 250 movies on TMDB.
          </p>
        </div>
      </div>

      <Suspense fallback={<LoadingSkeleton cards={12} />}>
        <TmdbTop250Content />
      </Suspense>
    </div>
  );
}
