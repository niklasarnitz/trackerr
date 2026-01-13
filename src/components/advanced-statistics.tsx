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
import { api } from "~/trpc/react";
import {
  Trophy,
  Repeat,
  Calendar,
  TrendingUp,
  Film,
  Star,
  Clock,
} from "lucide-react";
import { CHART_COLORS, getChartColor } from "~/lib/chart-colors";
import { Badge } from "~/components/ui/badge";

export function AdvancedStatistics() {
  const { data: topRated } = api.movieWatch.getTopRatedMovies.useQuery();
  const { data: mostWatched } = api.movieWatch.getMostWatchedMovies.useQuery();
  const { data: rewatches } = api.movieWatch.getRewatchesStats.useQuery();
  const { data: ratingByLocation } =
    api.movieWatch.getRatingByLocation.useQuery();
  const { data: ratingByService } =
    api.movieWatch.getRatingByStreamingService.useQuery();
  const { data: decadeDist } = api.movieWatch.getDecadeDistribution.useQuery();
  const { data: streakStats } = api.movieWatch.getWatchStreakStats.useQuery();
  const { data: dayOfWeekStats } = api.movieWatch.getDayOfWeekStats.useQuery();
  const { data: mostWatchedGenres } =
    api.movieWatch.getMostWatchedGenres.useQuery({ year: "all" });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Advanced Statistics</h2>
      </div>

      {/* Stats Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Rewatches Stats */}
        {rewatches && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rewatches</CardTitle>
                <Repeat className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {rewatches.totalRewatches}
                </div>
                <p className="text-muted-foreground text-xs">
                  {rewatches.uniqueRewatchedMovies} movies rewatched
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Rewatch Rate
                </CardTitle>
                <TrendingUp className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {rewatches.rewatchRate.toFixed(1)}%
                </div>
                <p className="text-muted-foreground text-xs">
                  of movies rewatched
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Streak Stats */}
        {streakStats && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Current Streak
                </CardTitle>
                <Clock className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {streakStats.currentStreak}
                </div>
                <p className="text-muted-foreground text-xs">days in a row</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Longest Streak
                </CardTitle>
                <Trophy className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {streakStats.longestStreak}
                </div>
                <p className="text-muted-foreground text-xs">days</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Rated Movies */}
        {topRated && topRated.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Top Rated Movies
              </CardTitle>
              <CardDescription>Your highest rated movies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topRated.slice(0, 5).map((item, index) => (
                  <div
                    key={item.movie.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.movie.title}</div>
                      {item.movie.releaseYear && (
                        <div className="text-muted-foreground text-xs">
                          {item.movie.releaseYear}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {item.averageRating.toFixed(1)}★
                      </Badge>
                      {item.watchCount > 1 && (
                        <span className="text-muted-foreground text-xs">
                          ({item.watchCount}x)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Most Watched Movies */}
        {mostWatched && mostWatched.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="h-5 w-5" />
                Most Watched Movies
              </CardTitle>
              <CardDescription>Your most rewatched movies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mostWatched.slice(0, 5).map((item) => (
                  <div
                    key={item.movie.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.movie.title}</div>
                      {item.movie.releaseYear && (
                        <div className="text-muted-foreground text-xs">
                          {item.movie.releaseYear}
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary">{item.watchCount}x</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Average Rating by Location */}
        {ratingByLocation && ratingByLocation.length > 0 && (
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
                  <BarChart data={ratingByLocation}>
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
                      {ratingByLocation.map((entry, index: number) => (
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
        )}

        {/* Average Rating by Streaming Service */}
        {ratingByService && ratingByService.length > 0 && (
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
                  <BarChart data={ratingByService}>
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
        )}

        {/* Decade Distribution */}
        {decadeDist && decadeDist.length > 0 && (
          <Card>
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
                      data={decadeDist}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="decade"
                    >
                      {decadeDist.map((entry, index: number) => (
                        <Cell
                          key={`cell-${entry.decade}`}
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
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value: string) => value}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Day of Week Statistics */}
        {dayOfWeekStats && dayOfWeekStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Day of Week
              </CardTitle>
              <CardDescription>When you watch most movies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayOfWeekStats}>
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
        )}

        {/* Most Watched Genres */}
        {mostWatchedGenres && mostWatchedGenres.length > 0 && (
          <Card className="col-span-full lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="h-5 w-5" />
                Most Watched Genres
              </CardTitle>
              <CardDescription>
                Distribution of genres in your watch history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mostWatchedGenres}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="genre"
                    >
                      {mostWatchedGenres.map((entry, index: number) => (
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
                        color: "white",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value: string) => value}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
