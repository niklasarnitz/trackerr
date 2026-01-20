import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Star,
  TrendingUp,
  Database,
  Trophy,
} from "lucide-react";
import type { RouterOutputs } from "~/trpc/react";
import { cn } from "~/lib/utils";

interface DashboardStatsCardsProps {
  stats: RouterOutputs["movieWatch"]["getDashboardStats"];
  top250Stats?: RouterOutputs["movieWatch"]["getImdbTop250Stats"];
}

export function DashboardStatsCards({
  stats,
  top250Stats,
}: DashboardStatsCardsProps) {
  const safeStats = stats ?? {
    totalWatches: 0,
    totalMovies: 0,
    physicalMovies: 0,
    averageRating: null,
    thisMonth: 0,
    thisYear: 0,
    avgPerMonth: 0,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      <Link href="/watches">
        <Card className="hover:bg-muted/50 transition-colors h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movies Watched</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.totalWatches}</div>
            <p className="text-muted-foreground text-xs">movies watched</p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/collection">
        <Card className="hover:bg-muted/50 transition-colors h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Physical Collection
            </CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.physicalMovies}</div>
            <p className="text-muted-foreground text-xs">physical movies</p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/movies">
        <Card className="hover:bg-muted/50 transition-colors h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Movies in Database
            </CardTitle>
            <Database className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.totalMovies}</div>
            <p className="text-muted-foreground text-xs">movies in database</p>
          </CardContent>
        </Card>
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {safeStats.averageRating
              ? `${safeStats.averageRating.toFixed(1)}★`
              : "—"}
          </div>
          <p className="text-muted-foreground text-xs">out of 5 stars</p>
        </CardContent>
      </Card>

      {top250Stats && (
        <Link href="/lists">
          <Card className="hover:bg-muted/50 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">IMDb Top 250</CardTitle>
              <Trophy className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {top250Stats.watchedCount}/{top250Stats.totalCount}
              </div>
              <p className="text-muted-foreground text-xs">top rated watched</p>
            </CardContent>
          </Card>
        </Link>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <TrendingUp className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{safeStats.thisMonth}</div>
          <p className="text-muted-foreground text-xs">movies watched</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Year</CardTitle>
          <Calendar className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{safeStats.thisYear ?? 0}</div>
          <p className="text-muted-foreground text-xs">movies watched</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg per Month</CardTitle>
          <TrendingUp className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {safeStats.avgPerMonth?.toFixed(1) ?? "0.0"}
          </div>
          <p className="text-muted-foreground text-xs">movies per month</p>
        </CardContent>
      </Card>
    </div>
  );
}
