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
import { StatCard } from "~/components/stat-card";
import { BookMarked, BookOpen, Calendar, TrendingUp } from "lucide-react";
import { CHART_COLORS, getChartColor } from "~/lib/chart-colors";
import type { RouterOutputs } from "~/trpc/react";
import { Badge } from "~/components/ui/badge";

interface BibleInsightsPanelProps {
  progress: RouterOutputs["bible"]["getProgress"];
}

export function BibleInsightsPanel({ progress }: BibleInsightsPanelProps) {
  const {
    bookProgress,
    overallPercentage,
    totalUniqueChaptersRead,
    totalChaptersInBible,
  } = progress;

  // Group books by category
  const otBooks = bookProgress.filter((b) => b.category === "ot");
  const ntBooks = bookProgress.filter((b) => b.category === "nt");
  const apocryphaBooks = bookProgress.filter((b) => b.category === "apocrypha");

  // Calculate category percentages
  const otTotalVerses = otBooks.reduce(
    (sum, book) =>
      sum + Object.values(book.verseStats).reduce((s, v) => s + v.total, 0),
    0,
  );
  const otReadVerses = otBooks.reduce(
    (sum, book) =>
      sum + Object.values(book.verseStats).reduce((s, v) => s + v.read, 0),
    0,
  );
  const otPercentage =
    otTotalVerses > 0 ? (otReadVerses / otTotalVerses) * 100 : 0;

  const ntTotalVerses = ntBooks.reduce(
    (sum, book) =>
      sum + Object.values(book.verseStats).reduce((s, v) => s + v.total, 0),
    0,
  );
  const ntReadVerses = ntBooks.reduce(
    (sum, book) =>
      sum + Object.values(book.verseStats).reduce((s, v) => s + v.read, 0),
    0,
  );
  const ntPercentage =
    ntTotalVerses > 0 ? (ntReadVerses / ntTotalVerses) * 100 : 0;

  const categoryData = [
    {
      name: "Old Testament",
      percentage: Math.round(otPercentage * 10) / 10,
      booksRead: otBooks.filter((b) => b.percentage > 0).length,
      totalBooks: otBooks.length,
    },
    {
      name: "New Testament",
      percentage: Math.round(ntPercentage * 10) / 10,
      booksRead: ntBooks.filter((b) => b.percentage > 0).length,
      totalBooks: ntBooks.length,
    },
  ];

  if (apocryphaBooks.length > 0) {
    const apoTotalVerses = apocryphaBooks.reduce(
      (sum, book) =>
        sum + Object.values(book.verseStats).reduce((s, v) => s + v.total, 0),
      0,
    );
    const apoReadVerses = apocryphaBooks.reduce(
      (sum, book) =>
        sum + Object.values(book.verseStats).reduce((s, v) => s + v.read, 0),
      0,
    );
    const apoPercentage =
      apoTotalVerses > 0 ? (apoReadVerses / apoTotalVerses) * 100 : 0;
    categoryData.push({
      name: "Apocrypha",
      percentage: Math.round(apoPercentage * 10) / 10,
      booksRead: apocryphaBooks.filter((b) => b.percentage > 0).length,
      totalBooks: apocryphaBooks.length,
    });
  }

  // Find most and least read books
  const booksWithProgress = bookProgress.filter((b) => b.percentage > 0);
  const mostReadBooks = [...booksWithProgress]
    .sort((a, b) => b.completionCount - a.completionCount)
    .slice(0, 5);

  const leastReadBooks = [...bookProgress]
    .filter((b) => b.percentage > 0 && b.percentage < 100)
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 5);

  const completedBooks = bookProgress.filter((b) => b.percentage >= 100);

  const booksStarted = booksWithProgress.length;
  const totalBooks = bookProgress.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BookMarked className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Bible Reading</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Overall Progress"
          value={`${Math.round(overallPercentage * 10) / 10}%`}
          description="of the Bible read"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Chapters Read"
          value={totalUniqueChaptersRead}
          description={`out of ${totalChaptersInBible} chapters`}
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatCard
          title="Books Started"
          value={booksStarted}
          description={`out of ${totalBooks} books`}
          icon={<BookMarked className="h-4 w-4" />}
        />
        <StatCard
          title="Books Completed"
          value={completedBooks.length}
          description={`${Math.round((completedBooks.length / totalBooks) * 100)}% finished`}
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>

      {/* Category Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progress by Testament</CardTitle>
          <CardDescription>
            Reading progress across different sections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                label={{
                  value: "Completion %",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.[0]) {
                    const data = payload[0].payload as (typeof categoryData)[0];
                    return (
                      <div className="bg-background rounded-lg border p-2 shadow-md">
                        <p className="font-semibold">{data.name}</p>
                        <p className="text-sm">
                          Completion: {data.percentage}%
                        </p>
                        <p className="text-sm">
                          Books Started: {data.booksRead}/{data.totalBooks}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar
                dataKey="percentage"
                fill={CHART_COLORS.primary}
                name="Completion %"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Most Read Books */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Most Read Books
            </CardTitle>
            <CardDescription>Books read multiple times</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mostReadBooks.length === 0 ? (
              <p className="text-muted-foreground text-sm">No readings yet</p>
            ) : (
              mostReadBooks.map((book, index) => (
                <div
                  key={book.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground min-w-[1.5rem] text-sm font-medium">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium">{book.name}</span>
                  </div>
                  <Badge variant="secondary">
                    {book.completionCount}x
                    {book.percentage < 100 &&
                      ` (${Math.round(book.percentage)}%)`}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* In Progress Books */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <CardDescription>Books partially read</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {leastReadBooks.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No books in progress
              </p>
            ) : (
              leastReadBooks.map((book, index) => (
                <div
                  key={book.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground min-w-[1.5rem] text-sm font-medium">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium">{book.name}</span>
                  </div>
                  <Badge variant="outline">
                    {Math.round(book.percentage)}%
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Book Completion Status */}
      <Card>
        <CardHeader>
          <CardTitle>Book Completion Status</CardTitle>
          <CardDescription>Overview of all Bible books</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {["ot", "nt", "apocrypha"].map((category) => {
              const categoryBooks = bookProgress.filter(
                (b) => b.category === category,
              );
              if (categoryBooks.length === 0) return null;

              const categoryName =
                category === "ot"
                  ? "Old Testament"
                  : category === "nt"
                    ? "New Testament"
                    : "Apocrypha";

              return (
                <div key={category}>
                  <h4 className="mb-2 text-sm font-semibold">{categoryName}</h4>
                  <div className="flex flex-wrap gap-2">
                    {categoryBooks.map((book) => {
                      const completed = book.percentage >= 100;
                      const inProgress =
                        book.percentage > 0 && book.percentage < 100;
                      const notStarted = book.percentage === 0;

                      return (
                        <Badge
                          key={book.id}
                          variant={
                            completed
                              ? "default"
                              : inProgress
                                ? "secondary"
                                : "outline"
                          }
                          className="cursor-help"
                          title={`${book.name}: ${Math.round(book.percentage)}% (${book.uniqueChaptersRead}/${book.chapters} chapters)`}
                        >
                          {book.name}
                          {book.completionCount > 1 &&
                            ` (${book.completionCount}x)`}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
