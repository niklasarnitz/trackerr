"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/trpc/react";
import { MapPin, Star, TrendingUp } from "lucide-react";
import { CHART_COLORS, getChartColor } from "~/lib/chart-colors";

interface DashboardChartsProps {
  year?: number | "all";
}

export function DashboardCharts({ year }: DashboardChartsProps) {
  const { data: locationStats } = api.movieWatch.getWatchLocationStats.useQuery(
    { year },
  );
  const { data: ratingStats } = api.movieWatch.getRatingDistribution.useQuery({
    year,
  });
  const { data: monthlyTrends } = api.movieWatch.getMonthlyTrends.useQuery({
    year,
  });
  const { data: streamingStats } =
    api.movieWatch.getStreamingServiceStats.useQuery({ year });

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Watch Location Distribution */}
      <Card className="col-span-full md:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Where You Watch
          </CardTitle>
          <CardDescription>Distribution of watch locations</CardDescription>
        </CardHeader>
        <CardContent>
          {locationStats && locationStats.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={locationStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="label"
                  >
                    {locationStats.map((entry, index: number) => (
                      <Cell
                        key={`cell-${entry.label}`}
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
          ) : (
            <div className="text-muted-foreground flex h-64 items-center justify-center">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rating Distribution */}
      <Card className="col-span-full md:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Rating Distribution
          </CardTitle>
          <CardDescription>How you rate your movies</CardDescription>
        </CardHeader>
        <CardContent>
          {ratingStats && ratingStats.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ratingStats}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="label"
                    className="fill-muted-foreground text-xs"
                  />
                  <YAxis className="fill-muted-foreground text-xs" />
                  <Tooltip
                    formatter={(value: number | undefined) => [
                      value ?? 0,
                      "Movies",
                    ]}
                    labelFormatter={(label: string) => `Rating: ${label}`}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      color: "white",
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {ratingStats.map((entry, index: number) => (
                      <Cell
                        key={`cell-${entry.label}`}
                        fill={getChartColor(index)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-muted-foreground flex h-64 items-center justify-center">
              No ratings available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card className="col-span-full lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Trends
          </CardTitle>
          <CardDescription>Movies watched over time</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyTrends && monthlyTrends.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyTrends}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
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
                      "Movies Watched",
                    ]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      color: "white",
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

      {/* Streaming Service Distribution */}
      {streamingStats && streamingStats.length > 0 && (
        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Streaming Services
            </CardTitle>
            <CardDescription>
              Distribution of streaming platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={streamingStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="label"
                  >
                    {streamingStats.map((entry, index: number) => (
                      <Cell
                        key={`cell-${entry.label}`}
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
  );
}
