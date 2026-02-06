import { StatCard } from "~/components/stat-card";
import { Trophy, Flame, Calendar, BookMarked } from "lucide-react";
import type { RouterOutputs } from "~/trpc/react";

interface ReadingStatsProps {
  progress: RouterOutputs["bible"]["getProgress"];
  streakStats: RouterOutputs["bible"]["getReadingStreakStats"];
}

export function ReadingStats({ progress, streakStats }: ReadingStatsProps) {
  const booksCompleted = progress.bookProgress.filter(
    (b) => b.percentage === 100,
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Current Streak"
        value={streakStats.currentStreak}
        description="days in a row"
        icon={<Flame className="h-4 w-4 text-orange-500" />}
      />
      <StatCard
        title="Longest Streak"
        value={streakStats.longestStreak}
        description="days"
        icon={<Trophy className="h-4 w-4 text-yellow-500" />}
      />
      <StatCard
        title="Books Completed"
        value={booksCompleted}
        description={`of ${progress.bookProgress.length}`}
        icon={<BookMarked className="h-4 w-4 text-green-500" />}
      />
      <StatCard
        title="Reading Days"
        value={streakStats.totalReadingDays}
        description="total days with readings"
        icon={<Calendar className="h-4 w-4 text-blue-500" />}
      />
    </div>
  );
}
