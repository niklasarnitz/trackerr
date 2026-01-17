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
import {
  MapPin,
  Speaker,
  Film,
  Languages,
  Monitor,
  TrendingUp,
  Ticket,
  Sparkles,
} from "lucide-react";
import { CHART_COLORS, getChartColor } from "~/lib/chart-colors";
import { StatCard } from "~/components/stat-card";
import type { RouterOutputs } from "~/trpc/react";

interface CinemaInsightsPanelProps {
  cinemaStats: RouterOutputs["movieWatch"]["getCinemaStats"];
  soundSystemStats: RouterOutputs["movieWatch"]["getSoundSystemStats"];
  projectionTypeStats: RouterOutputs["movieWatch"]["getProjectionTypeStats"];
  languageTypeStats: RouterOutputs["movieWatch"]["getLanguageTypeStats"];
  aspectRatioStats: RouterOutputs["movieWatch"]["getAspectRatioStats"];
  ticketPriceStats: RouterOutputs["movieWatch"]["getCinemaTicketPriceStats"];
  monthlySpending: RouterOutputs["movieWatch"]["getMonthlySpendingStats"];
}

const standardLegendFormatter = (value: string) => (
  <span style={{ display: "inline-block", maxWidth: "120px" }}>{value}</span>
);

const aspectRatioLegendFormatter = (value: string) =>
  value.length > 25 ? `${value.substring(0, 25)}...` : value;

export function CinemaInsightsPanel({
  cinemaStats,
  soundSystemStats,
  projectionTypeStats,
  languageTypeStats,
  aspectRatioStats,
  ticketPriceStats,
  monthlySpending,
}: CinemaInsightsPanelProps) {
  const safeCinemaStats = cinemaStats ?? [];
  const safeSoundSystemStats = soundSystemStats ?? [];
  const safeProjectionTypeStats = projectionTypeStats ?? [];
  const safeLanguageTypeStats = languageTypeStats ?? [];
  const safeAspectRatioStats = aspectRatioStats ?? [];
  const safeMonthlySpending = monthlySpending ?? [];

  const favoriteCinema = safeCinemaStats[0];
  const preferredProjection = safeProjectionTypeStats[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Cinema Insights</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Spent This Year"
          value={
            ticketPriceStats
              ? `€${ticketPriceStats.totalSpentThisYear.toFixed(2)}`
              : "€0.00"
          }
          description="cinema tickets"
          icon={<Ticket className="h-4 w-4" />}
        />
        <StatCard
          title="Avg Ticket"
          value={
            ticketPriceStats
              ? `€${ticketPriceStats.meanTicketPrice.toFixed(2)}`
              : "€0.00"
          }
          description="per ticket"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Favorite Cinema"
          value={favoriteCinema?.label ?? "—"}
          description={
            favoriteCinema ? `${favoriteCinema.count} visits` : "no cinema data"
          }
          icon={<MapPin className="h-4 w-4" />}
        />
        <StatCard
          title="Preferred Format"
          value={preferredProjection?.label ?? "—"}
          description={
            preferredProjection
              ? `${preferredProjection.count} watches`
              : "no format data"
          }
          icon={<Film className="h-4 w-4" />}
        />
      </div>

      {safeMonthlySpending.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Cinema Spending
            </CardTitle>
            <CardDescription>
              Money spent on cinema tickets this year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={safeMonthlySpending}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="label"
                    className="fill-muted-foreground text-xs"
                  />
                  <YAxis
                    className="fill-muted-foreground text-xs"
                    tickFormatter={(value) => `€${value}`}
                  />
                  <Tooltip
                    formatter={(value: number | undefined) => [
                      `€${(value ?? 0).toFixed(2)}`,
                      "Amount Spent",
                    ]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    fill={CHART_COLORS.success}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Favorite Cinemas
            </CardTitle>
            <CardDescription>Most visited cinemas</CardDescription>
          </CardHeader>
          <CardContent>
            {safeCinemaStats.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={safeCinemaStats}
                      cx="50%"
                      cy="45%"
                      outerRadius={50}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="label"
                    >
                      {safeCinemaStats.map((entry, index: number) => (
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
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={60}
                      wrapperStyle={{
                        paddingTop: "10px",
                        fontSize: "12px",
                        overflow: "hidden",
                      }}
                      formatter={standardLegendFormatter}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-muted-foreground flex h-80 items-center justify-center">
                No cinema data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="h-5 w-5" />
              Projection Types
            </CardTitle>
            <CardDescription>Viewing format preferences</CardDescription>
          </CardHeader>
          <CardContent>
            {safeProjectionTypeStats.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={safeProjectionTypeStats}
                      cx="50%"
                      cy="45%"
                      outerRadius={50}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="label"
                    >
                      {safeProjectionTypeStats.map((entry, index: number) => (
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
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={60}
                      wrapperStyle={{
                        paddingTop: "10px",
                        fontSize: "12px",
                        overflow: "hidden",
                      }}
                      formatter={standardLegendFormatter}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-muted-foreground flex h-80 items-center justify-center">
                No projection data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Ticket Price Breakdown
            </CardTitle>
            <CardDescription>Average prices by cinema</CardDescription>
          </CardHeader>
          <CardContent>
            {ticketPriceStats ? (
              <div className="space-y-3">
                {ticketPriceStats.meanPricePerCinema.length > 0 ? (
                  ticketPriceStats.meanPricePerCinema
                    .slice(0, 4)
                    .map((cinema) => (
                      <div
                        key={cinema.cinema}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="truncate">{cinema.cinema}</span>
                        <span className="font-medium">
                          €{cinema.meanPrice.toFixed(2)}
                        </span>
                      </div>
                    ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No ticket price data yet
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No ticket price data yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {(safeSoundSystemStats.length > 0 ||
        safeLanguageTypeStats.length > 0 ||
        safeAspectRatioStats.length > 0) && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <h3 className="text-lg font-semibold">More Cinema Details</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Speaker className="h-5 w-5" />
                  Sound Systems
                </CardTitle>
                <CardDescription>Preferred audio experiences</CardDescription>
              </CardHeader>
              <CardContent>
                {safeSoundSystemStats.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={safeSoundSystemStats}
                          cx="50%"
                          cy="45%"
                          outerRadius={50}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="label"
                        >
                          {safeSoundSystemStats.map((entry, index: number) => (
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
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={60}
                          wrapperStyle={{
                            paddingTop: "10px",
                            fontSize: "12px",
                            overflow: "hidden",
                          }}
                          formatter={standardLegendFormatter}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-muted-foreground flex h-80 items-center justify-center">
                    No sound system data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Language Types
                </CardTitle>
                <CardDescription>Language preferences</CardDescription>
              </CardHeader>
              <CardContent>
                {safeLanguageTypeStats.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={safeLanguageTypeStats}
                          cx="50%"
                          cy="45%"
                          outerRadius={50}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="label"
                        >
                          {safeLanguageTypeStats.map((entry, index: number) => (
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
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={60}
                          wrapperStyle={{
                            paddingTop: "10px",
                            fontSize: "12px",
                            overflow: "hidden",
                          }}
                          formatter={standardLegendFormatter}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-muted-foreground flex h-80 items-center justify-center">
                    No language data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Aspect Ratios
                </CardTitle>
                <CardDescription>Screen format preferences</CardDescription>
              </CardHeader>
              <CardContent>
                {safeAspectRatioStats.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={safeAspectRatioStats}
                          cx="50%"
                          cy="45%"
                          outerRadius={50}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="label"
                        >
                          {safeAspectRatioStats.map((entry, index: number) => (
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
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={80}
                          wrapperStyle={{
                            paddingTop: "10px",
                            fontSize: "11px",
                            overflow: "hidden",
                            lineHeight: "1.2",
                          }}
                          formatter={aspectRatioLegendFormatter}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-muted-foreground flex h-64 items-center justify-center">
                    No aspect ratio data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
