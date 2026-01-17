"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Clapperboard,
  Clock,
  Star,
  TrendingUp,
  Tv,
  Sparkles,
  Calendar,
} from "lucide-react";
import { CHART_COLORS } from "~/lib/chart-colors";
import { Badge } from "~/components/ui/badge";
import { StatCard } from "~/components/stat-card";
import type { RouterOutputs } from "~/trpc/react";

interface TvShowInsightsPanelProps {
  stats: RouterOutputs["tvShowWatch"]["getStats"];
  monthlyTrends: RouterOutputs["tvShowWatch"]["getMonthlyTrends"];
  topRated: RouterOutputs["tvShowWatch"]["getTopRatedShows"];
  mostWatched: RouterOutputs["tvShowWatch"]["getMostWatchedShows"];
  dayOfWeekStats: RouterOutputs["tvShowWatch"]["getDayOfWeekStats"];
}

export function TvShowInsightsPanel({
  stats,
  monthlyTrends,
  topRated,
  mostWatched,
  dayOfWeekStats,
}: TvShowInsightsPanelProps) {
  const safeTrends = monthlyTrends ?? [];
  const safeTopRated = topRated ?? [];
  const safeMostWatched = mostWatched ?? [];
  const safeDayOfWeek = dayOfWeekStats ?? [];

  const peakDay = safeDayOfWeek.reduce(
    (best, current) => (current.count > (best?.count ?? 0) ? current : best),
    safeDayOfWeek[0],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6" />
        <h2 className="text-2xl font-bold">TV Show Insights</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Episodes Watched"
          value={stats?.totalWatches ?? 0}
          description="watch entries"
          icon={<Clapperboard className="h-4 w-4" />}
        />
        <StatCard
          title="Shows in Collection"
          value={stats?.totalShows ?? 0}
          description="tracked series"
          icon={<Tv className="h-4 w-4" />}
        />
        <StatCard
          title="Shows Watched"
          value={stats?.uniqueShowsWatched ?? 0}
          description="unique series"
          icon={<Tv className="h-4 w-4" />}
        />
        <StatCard
          title="Average Rating"
          value={
            stats?.averageRating ? `${stats.averageRating.toFixed(1)}★` : "—"
          }
          description="episode ratings"
          icon={<Star className="h-4 w-4" />}
        />
        <StatCard
          title="This Month"
          value={stats?.thisMonth ?? 0}
          description="episodes watched"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Avg per Month"
          value={(stats?.avgPerMonth ?? 0).toFixed(1)}
          description="episodes per month"
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Episode Trends
            </CardTitle>
            <CardDescription>How your TV watching evolves</CardDescription>
          </CardHeader>
          <CardContent>
            {safeTrends.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={safeTrends}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="label"
                      className="fill-muted-foreground text-xs"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                    />
                    <YAxis className="fill-muted-foreground text-xs" />
                    <Tooltip
                      formatter={(value: number | undefined) => [
                        value ?? 0,
                        "Episodes Watched",
                      ]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill={CHART_COLORS.info}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-muted-foreground flex h-64 items-center justify-center">
                No trend data available
              </div>
            )}
          </CardContent>
        </Card>

        {safeTopRated.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Top Rated Shows
              </CardTitle>
              <CardDescription>Your highest rated series</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {safeTopRated.slice(0, 5).map((item) => (
                  <div
                    key={item.tvShow.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.tvShow.title}</div>
                      {item.tvShow.firstAirDate ? (
                        <div className="text-muted-foreground text-xs">
                          {new Date(item.tvShow.firstAirDate).getFullYear()}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {item.averageRating.toFixed(1)}★
                      </Badge>
                      {item.watchCount > 1 ? (
                        <span className="text-muted-foreground text-xs">
                          ({item.watchCount}x)
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {safeMostWatched.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tv className="h-5 w-5" />
                Most Watched Shows
              </CardTitle>
              <CardDescription>Your repeat favorites</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {safeMostWatched.slice(0, 5).map((item) => (
                  <div
                    key={item.tvShow.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.tvShow.title}</div>
                      {item.tvShow.firstAirDate ? (
                        <div className="text-muted-foreground text-xs">
                          {new Date(item.tvShow.firstAirDate).getFullYear()}
                        </div>
                      ) : null}
                    </div>
                    <Badge variant="secondary">{item.watchCount}x</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {safeDayOfWeek.length > 0 ? (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                TV Watch Rhythm
              </CardTitle>
              <CardDescription>
                {peakDay
                  ? `Peak day: ${peakDay.day} (${peakDay.count} watches)`
                  : "When you watch the most"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={safeDayOfWeek}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="day"
                      className="fill-muted-foreground text-xs"
                    />
                    <YAxis className="fill-muted-foreground text-xs" />
                    <Tooltip
                      formatter={(value: number | undefined) => [
                        value ?? 0,
                        "Episodes",
                      ]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill={CHART_COLORS.success}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
