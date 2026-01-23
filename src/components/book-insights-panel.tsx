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
  Book,
  BookOpen,
  Library,
  TrendingUp,
  User,
  Tag,
} from "lucide-react";
import { CHART_COLORS, getChartColor } from "~/lib/chart-colors";
import { StatCard } from "~/components/stat-card";
import type { RouterOutputs } from "~/trpc/react";

interface BookInsightsPanelProps {
  stats: RouterOutputs["book"]["getStats"];
}

export function BookInsightsPanel({ stats }: BookInsightsPanelProps) {
  const {
    totalBooks,
    readBooks,
    readingBooks,
    unreadBooks,
    totalPagesRead,
    topAuthors,
    topCategories,
    statusDistribution,
  } = stats;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Book className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Book Insights</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Books"
          value={totalBooks}
          description="books in library"
          icon={<Library className="h-4 w-4" />}
        />
        <StatCard
          title="Books Read"
          value={readBooks}
          description={`${totalBooks > 0 ? Math.round((readBooks / totalBooks) * 100) : 0}% completion`}
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatCard
          title="Currently Reading"
          value={readingBooks}
          description="books in progress"
          icon={<Book className="h-4 w-4" />}
        />
        <StatCard
          title="Total Pages Read"
          value={totalPagesRead.toLocaleString()}
          description="pages across read books"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Reading Status
            </CardTitle>
            <CardDescription>Books by reading status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getChartColor(index)}
                      />
                    ))}
                  </Pie>
                  <Tooltip
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

        {/* Top Authors */}
        <Card className="md:col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Top Authors
            </CardTitle>
            <CardDescription>Most represented authors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topAuthors} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill={CHART_COLORS.info}
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Top Categories
            </CardTitle>
            <CardDescription>Most common genres</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCategories} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill={CHART_COLORS.success}
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
