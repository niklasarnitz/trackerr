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
import {
  MapPin,
  Speaker,
  Film,
  Languages,
  Monitor,
  TrendingUp,
  Ticket,
} from "lucide-react";
import { CHART_COLORS, getChartColor } from "~/lib/chart-colors";

// Legend formatter functions
const standardLegendFormatter = (value: string) => (
  <span style={{ display: "inline-block", maxWidth: "120px" }}>{value}</span>
);

const aspectRatioLegendFormatter = (value: string) => {
  // Truncate long aspect ratio labels for legend
  const truncated = value.length > 25 ? `${value.substring(0, 25)}...` : value;
  return truncated;
};

export function CinemaDashboardCharts() {
  const { data: cinemaStats } = api.movieWatch.getCinemaStats.useQuery();
  const { data: soundSystemStats } =
    api.movieWatch.getSoundSystemStats.useQuery();
  const { data: projectionTypeStats } =
    api.movieWatch.getProjectionTypeStats.useQuery();
  const { data: languageTypeStats } =
    api.movieWatch.getLanguageTypeStats.useQuery();
  const { data: aspectRatioStats } =
    api.movieWatch.getAspectRatioStats.useQuery();
  const { data: ticketPriceStats } =
    api.movieWatch.getCinemaTicketPriceStats.useQuery();
  const { data: monthlySpending } =
    api.movieWatch.getMonthlySpendingStats.useQuery();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center gap-2">
        <Film className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Cinema Statistics</h2>
      </div>

      {/* Pie Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Cinemas Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Favorite Cinemas
            </CardTitle>
            <CardDescription>Most visited cinemas</CardDescription>
          </CardHeader>
          <CardContent>
            {cinemaStats && cinemaStats.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cinemaStats}
                      cx="50%"
                      cy="45%"
                      outerRadius={50}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="label"
                    >
                      {cinemaStats.map((entry, index: number) => (
                        <Cell
                          key={`cell-${entry.label}`}
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

        {/* Sound System Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Speaker className="h-5 w-5" />
              Sound Systems
            </CardTitle>
            <CardDescription>Preferred audio experiences</CardDescription>
          </CardHeader>
          <CardContent>
            {soundSystemStats && soundSystemStats.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={soundSystemStats}
                      cx="50%"
                      cy="45%"
                      outerRadius={50}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="label"
                    >
                      {soundSystemStats.map((entry, index: number) => (
                        <Cell
                          key={`cell-${entry.label}`}
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

        {/* Projection Type Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="h-5 w-5" />
              Projection Types
            </CardTitle>
            <CardDescription>Viewing format preferences</CardDescription>
          </CardHeader>
          <CardContent>
            {projectionTypeStats && projectionTypeStats.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectionTypeStats}
                      cx="50%"
                      cy="45%"
                      outerRadius={50}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="label"
                    >
                      {projectionTypeStats.map((entry, index: number) => (
                        <Cell
                          key={`cell-${entry.label}`}
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

        {/* Language Type Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Language Types
            </CardTitle>
            <CardDescription>Language preferences</CardDescription>
          </CardHeader>
          <CardContent>
            {languageTypeStats && languageTypeStats.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={languageTypeStats}
                      cx="50%"
                      cy="45%"
                      outerRadius={50}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="label"
                    >
                      {languageTypeStats.map((entry, index: number) => (
                        <Cell
                          key={`cell-${entry.label}`}
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

        {/* Aspect Ratio Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Aspect Ratios
            </CardTitle>
            <CardDescription>Screen format preferences</CardDescription>
          </CardHeader>
          <CardContent>
            {aspectRatioStats && aspectRatioStats.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={aspectRatioStats}
                      cx="50%"
                      cy="45%"
                      outerRadius={50}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="label"
                    >
                      {aspectRatioStats.map((entry, index: number) => (
                        <Cell
                          key={`cell-${entry.label}`}
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

        {/* Ticket Price Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Ticket Prices
            </CardTitle>
            <CardDescription>Cinema spending overview</CardDescription>
          </CardHeader>
          <CardContent>
            {ticketPriceStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-primary text-2xl font-bold">
                      €{ticketPriceStats.totalSpentThisYear.toFixed(2)}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Total Spent This Year
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-foreground text-2xl font-bold">
                      €{ticketPriceStats.meanTicketPrice.toFixed(2)}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Average Ticket Price
                    </div>
                  </div>
                </div>

                {ticketPriceStats.meanPricePerCinema.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium">
                      Average Price by Cinema
                    </h4>
                    <div className="space-y-1">
                      {ticketPriceStats.meanPricePerCinema
                        .slice(0, 3)
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
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground flex h-64 items-center justify-center">
                No ticket price data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Spending Bar Chart */}
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
          {monthlySpending && monthlySpending.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlySpending}
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
          ) : (
            <div className="text-muted-foreground flex h-64 items-center justify-center">
              No monthly spending data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
