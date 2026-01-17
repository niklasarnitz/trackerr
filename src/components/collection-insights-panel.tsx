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
import { StatCard } from "~/components/stat-card";
import type { RouterOutputs } from "~/trpc/react";

interface CollectionInsightsPanelProps {
  collectionStats: RouterOutputs["mediaEntry"]["getCollectionStats"];
  mediumDist: RouterOutputs["mediaEntry"]["getMediumDistribution"];
  physicalVirtual: RouterOutputs["mediaEntry"]["getPhysicalVirtualStats"];
  rippedStats: RouterOutputs["mediaEntry"]["getRippedStats"];
  growth: RouterOutputs["mediaEntry"]["getCollectionGrowth"];
}

export function CollectionInsightsPanel({
  collectionStats,
  mediumDist,
  physicalVirtual,
  rippedStats,
  growth,
}: CollectionInsightsPanelProps) {
  const totalEntries = collectionStats?.totalEntries ?? 0;
  const physicalEntries = collectionStats?.physicalEntries ?? 0;
  const virtualEntries = collectionStats?.virtualEntries ?? 0;
  const physicalShare =
    totalEntries > 0 ? Math.round((physicalEntries / totalEntries) * 100) : 0;

  const recentGrowth = (growth ?? []).slice(-2);
  const latestMonth = recentGrowth.at(-1);
  const previousMonth = recentGrowth.length > 1 ? recentGrowth[0] : undefined;
  const momentumDelta =
    latestMonth && previousMonth
      ? latestMonth.count - previousMonth.count
      : undefined;

  const safeMediumDist = mediumDist ?? [];
  const safePhysicalVirtual = physicalVirtual ?? [];
  const safeGrowth = growth ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Database className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Collection Insights</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Entries"
          value={totalEntries}
          description="media entries"
          icon={<Package className="h-4 w-4" />}
        />
        <StatCard
          title="Movies with Media"
          value={collectionStats?.totalMovies ?? 0}
          description="movies with entries"
          icon={<Film className="h-4 w-4" />}
        />
        <StatCard
          title="Added This Year"
          value={collectionStats?.thisYearEntries ?? 0}
          description="new entries"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Avg per Movie"
          value={(collectionStats?.avgEntriesPerMovie ?? 0).toFixed(1)}
          description="entries per movie"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Physical Share"
          value={`${physicalShare}%`}
          description={`${physicalEntries} physical vs ${virtualEntries} virtual`}
          icon={<Disc className="h-4 w-4" />}
        />
        <StatCard
          title="Collection Momentum"
          value={latestMonth?.count ?? 0}
          description={
            momentumDelta === undefined
              ? "entries added last month"
              : `${momentumDelta >= 0 ? "+" : ""}${momentumDelta} vs previous month`
          }
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {safeGrowth.length > 0 ? (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Collection Growth
              </CardTitle>
              <CardDescription>
                Entries added over the last year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={safeGrowth}>
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
                      formatter={(
                        value: number | undefined,
                        name: string | undefined,
                      ) => [
                        value ?? 0,
                        name === "cumulative" ? "Total Collection" : "Added",
                      ]}
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
        ) : null}

        {safeMediumDist.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Disc className="h-5 w-5" />
                Medium Mix
              </CardTitle>
              <CardDescription>How your collection is stored</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={safeMediumDist}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="label"
                    >
                      {safeMediumDist.map((entry, index: number) => (
                        <Cell
                          key={`cell-${entry.medium}`}
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

        {safePhysicalVirtual.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Physical vs Virtual
              </CardTitle>
              <CardDescription>Format split across entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={safePhysicalVirtual}>
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
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {safePhysicalVirtual.map((entry, index: number) => (
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
        ) : null}
      </div>

      {rippedStats ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Preservation Progress
            </CardTitle>
            <CardDescription>
              How much of your physical media is ripped
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard
                title="Ripped"
                value={rippedStats.ripped}
                description={`${rippedStats.rippedPercentage}% of physical`}
                icon={<Download className="h-4 w-4" />}
              />
              <StatCard
                title="Not Ripped"
                value={rippedStats.unripped}
                description="still pending"
                icon={<Disc className="h-4 w-4" />}
              />
              <StatCard
                title="Total Physical"
                value={rippedStats.totalPhysical}
                description="physical entries"
                icon={<Package className="h-4 w-4" />}
              />
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
