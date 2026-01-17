"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Trophy,
  Repeat,
  Calendar,
  TrendingUp,
  Film,
  Star,
  Clock,
  Sparkles,
} from "lucide-react";
import { CHART_COLORS, getChartColor } from "~/lib/chart-colors";
import { Badge } from "~/components/ui/badge";
import { StatCard } from "~/components/stat-card";
import type { RouterOutputs } from "~/trpc/react";

interface WatchInsightsPanelProps {
  topRated: RouterOutputs["movieWatch"]["getTopRatedMovies"];
  mostWatched: RouterOutputs["movieWatch"]["getMostWatchedMovies"];
  rewatches: RouterOutputs["movieWatch"]["getRewatchesStats"];
  ratingByLocation: RouterOutputs["movieWatch"]["getRatingByLocation"];
  ratingByService: RouterOutputs["movieWatch"]["getRatingByStreamingService"];
  decadeDistribution: RouterOutputs["movieWatch"]["getDecadeDistribution"];
  streakStats: RouterOutputs["movieWatch"]["getWatchStreakStats"];
  dayOfWeekStats: RouterOutputs["movieWatch"]["getDayOfWeekStats"];
  mostWatchedGenres: RouterOutputs["movieWatch"]["getMostWatchedGenres"];
}

export function WatchInsightsPanel({
  topRated,
  mostWatched,
  rewatches,
  ratingByLocation,
  ratingByService,
  decadeDistribution,
  streakStats,
  dayOfWeekStats,
  mostWatchedGenres,
}: WatchInsightsPanelProps) {
  const safeTopRated = topRated ?? [];
  const safeMostWatched = mostWatched ?? [];
  const safeRatingByLocation = ratingByLocation ?? [];
  const safeRatingByService = ratingByService ?? [];
  const safeDecadeDistribution = decadeDistribution ?? [];
  const safeDayOfWeekStats = dayOfWeekStats ?? [];
  const safeMostWatchedGenres = mostWatchedGenres ?? [];

  const peakDay = safeDayOfWeekStats.reduce(
    (best, current) => (current.count > (best?.count ?? 0) ? current : best),
    safeDayOfWeekStats[0],
  );

  const topGenre = safeMostWatchedGenres[0];
  const bestService = safeRatingByService[0];
  const bestLocation = safeRatingByLocation[0];
  const bestPlatform = bestService ?? bestLocation;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Watch Insights</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Current Streak"
          value={streakStats?.currentStreak ?? 0}
          description="days in a row"
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          title="Longest Streak"
          value={streakStats?.longestStreak ?? 0}
          description="days"
          icon={<Trophy className="h-4 w-4" />}
        />
        <StatCard
          title="Rewatch Rate"
          value={`${(rewatches?.rewatchRate ?? 0).toFixed(1)}%`}
          description={`${rewatches?.totalRewatches ?? 0} rewatches total`}
          icon={<Repeat className="h-4 w-4" />}
        />
        <StatCard
          title="Peak Day"
          value={peakDay?.day ?? "—"}
          description={`${peakDay?.count ?? 0} watches`}
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          title="Top Genre"
          value={topGenre?.genre ?? "—"}
          description={`${topGenre?.count ?? 0} watches`}
          icon={<Film className="h-4 w-4" />}
        />
        <StatCard
          title="Best Rated Platform"
          value={bestPlatform?.label ?? "—"}
          description={
            bestPlatform
              ? `${bestPlatform.averageRating.toFixed(2)}★ average`
              : "no ratings yet"
          }
          icon={<Star className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {safeTopRated.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Top Rated Movies
              </CardTitle>
              <CardDescription>Your highest-rated picks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {safeTopRated.slice(0, 5).map((item) => (
                  <div
                    key={item.movie.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.movie.title}</div>
                      {item.movie.releaseYear ? (
                        <div className="text-muted-foreground text-xs">
                          {item.movie.releaseYear}
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
                <Film className="h-5 w-5" />
                Most Watched Movies
              </CardTitle>
              <CardDescription>Your repeat favorites</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {safeMostWatched.slice(0, 5).map((item) => (
                  <div
                    key={item.movie.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.movie.title}</div>
                      {item.movie.releaseYear ? (
                        <div className="text-muted-foreground text-xs">
                          {item.movie.releaseYear}
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

        {safeDayOfWeekStats.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Watch Rhythm
              </CardTitle>
              <CardDescription>When you watch most movies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={safeDayOfWeekStats}>
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
                        "Movies",
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

        {safeMostWatchedGenres.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="h-5 w-5" />
                Genre Mix
              </CardTitle>
              <CardDescription>What you watch the most</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={safeMostWatchedGenres}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="genre"
                    >
                      {safeMostWatchedGenres.map((entry, index: number) => (
                        <Cell
                          key={`cell-${entry.genre}`}
                          fill={getChartColor(index)}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(
                        value: number | undefined,
                        name: string | undefined,
                      ) => [value ?? 0, name ?? ""]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {(safeRatingByLocation.length > 0 ||
        safeRatingByService.length > 0 ||
        safeDecadeDistribution.length > 0) && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <h3 className="text-lg font-semibold">More Insights</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {safeRatingByService.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Rating by Streaming Service
                  </CardTitle>
                  <CardDescription>Average rating by platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={safeRatingByService}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis
                          dataKey="label"
                          className="fill-muted-foreground text-xs"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis
                          domain={[0, 5]}
                          className="fill-muted-foreground text-xs"
                        />
                        <Tooltip
                          formatter={(value: number | undefined) => [
                            `${(value ?? 0).toFixed(2)}★`,
                            "Avg Rating",
                          ]}
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "6px",
                          }}
                        />
                        <Bar
                          dataKey="averageRating"
                          fill={CHART_COLORS.info}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {safeRatingByLocation.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Rating by Location
                  </CardTitle>
                  <CardDescription>
                    Average rating by watch location
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={safeRatingByLocation}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis
                          dataKey="label"
                          className="fill-muted-foreground text-xs"
                        />
                        <YAxis
                          domain={[0, 5]}
                          className="fill-muted-foreground text-xs"
                        />
                        <Tooltip
                          formatter={(value: number | undefined) => [
                            `${(value ?? 0).toFixed(2)}★`,
                            "Avg Rating",
                          ]}
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "6px",
                          }}
                        />
                        <Bar dataKey="averageRating" radius={[4, 4, 0, 0]}>
                          {safeRatingByLocation.map((entry, index: number) => (
                            <Cell
                              key={`cell-${entry.location}`}
                              fill={getChartColor(index)}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {safeDecadeDistribution.length > 0 ? (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Decade Distribution
                  </CardTitle>
                  <CardDescription>Movies by release decade</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={safeDecadeDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="decade"
                        >
                          {safeDecadeDistribution.map(
                            (entry, index: number) => (
                              <Cell
                                key={`cell-${entry.decade}`}
                                fill={getChartColor(index)}
                              />
                            ),
                          )}
                        </Pie>
                        <Tooltip
                          formatter={(
                            value: number | undefined,
                            name: string | undefined,
                          ) => [value ?? 0, name ?? ""]}
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "6px",
                          }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
