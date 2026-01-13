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
  LineChart,
  Line,
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
  Database,
  Disc,
  HardDrive,
  Download,
  TrendingUp,
  Film,
  Package,
} from "lucide-react";
import { CHART_COLORS, getChartColor } from "~/lib/chart-colors";

export function CollectionStatistics() {
  const { data: collectionStats } = api.mediaEntry.getCollectionStats.useQuery();
  const { data: mediumDist } = api.mediaEntry.getMediumDistribution.useQuery();
  const { data: physicalVirtual } =
    api.mediaEntry.getPhysicalVirtualStats.useQuery();
  const { data: rippedStats } = api.mediaEntry.getRippedStats.useQuery();
  const { data: growth } = api.mediaEntry.getCollectionGrowth.useQuery();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center gap-2">
        <Database className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Collection Statistics</h2>
      </div>

      {/* Stats Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {collectionStats && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Entries
                </CardTitle>
                <Package className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {collectionStats.totalEntries}
                </div>
                <p className="text-muted-foreground text-xs">
                  media entries
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Movies</CardTitle>
                <Film className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {collectionStats.totalMovies}
                </div>
                <p className="text-muted-foreground text-xs">
                  with media entries
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Physical</CardTitle>
                <Disc className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {collectionStats.physicalEntries}
                </div>
                <p className="text-muted-foreground text-xs">
                  physical media
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Virtual</CardTitle>
                <HardDrive className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {collectionStats.virtualEntries}
                </div>
                <p className="text-muted-foreground text-xs">
                  virtual entries
                </p>
              </CardContent>
            </Card>

            {rippedStats && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ripped</CardTitle>
                    <Download className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {rippedStats.ripped}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {rippedStats.rippedPercentage}% of physical
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      This Year
                    </CardTitle>
                    <TrendingUp className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {collectionStats.thisYearEntries}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      entries added
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Avg per Movie
                    </CardTitle>
                    <TrendingUp className="text-muted-foreground h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {collectionStats.avgEntriesPerMovie.toFixed(1)}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      entries per movie
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Medium Distribution */}
        {mediumDist && mediumDist.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Disc className="h-5 w-5" />
                Medium Distribution
              </CardTitle>
              <CardDescription>Collection by media type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mediumDist}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="label"
                    >
                      {mediumDist.map((entry, index: number) => (
                        <Cell
                          key={`cell-${entry.medium}`}
                          fill={getChartColor(index)}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number | undefined, name: string | undefined) => [value ?? 0, name ?? ""]}
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

        {/* Physical vs Virtual */}
        {physicalVirtual && physicalVirtual.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Physical vs Virtual
              </CardTitle>
              <CardDescription>Collection type distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={physicalVirtual}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="type"
                      className="fill-muted-foreground text-xs"
                    />
                    <YAxis className="fill-muted-foreground text-xs" />
                    <Tooltip
                      formatter={(value: number | undefined) => value ?? 0}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      radius={[4, 4, 0, 0]}
                    >
                      {physicalVirtual.map((entry, index: number) => (
                        <Cell
                          key={`cell-${entry.type}`}
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

        {/* Collection Growth */}
        {growth && growth.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Collection Growth
              </CardTitle>
              <CardDescription>Entries added over time (last 12 months)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growth}>
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
                    />
                    <YAxis className="fill-muted-foreground text-xs" />
                    <Tooltip
                      formatter={(value: number | undefined, name: string | undefined) => [value ?? 0, name ?? (name === "count" ? "Added" : "Total")]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke={CHART_COLORS.info}
                      name="Added This Month"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulative"
                      stroke={CHART_COLORS.success}
                      name="Total Collection"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

