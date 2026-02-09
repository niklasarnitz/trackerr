import {
  Film,
  Tv,
  BookOpen,
  Library,
  Bookmark,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "~/components/stat-card";
import type { RouterOutputs } from "~/trpc/react";

interface DashboardCrossMediaStatsProps {
  movieStats: RouterOutputs["movieWatch"]["getStats"];
  tvStats: RouterOutputs["tvShowWatch"]["getStats"];
  bookStats: RouterOutputs["book"]["getStats"];
}

export function DashboardCrossMediaStats({
  movieStats,
  tvStats,
  bookStats,
}: DashboardCrossMediaStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        title="Movies Watched"
        value={movieStats.thisYear ?? 0}
        description="this year"
        icon={<Film className="h-4 w-4" />}
      />
      <StatCard
        title="TV Episodes Watched"
        value={tvStats.thisYear ?? 0}
        description="this year"
        icon={<Tv className="h-4 w-4" />}
      />
      <StatCard
        title="Books Read"
        value={bookStats.readBooks}
        description="finished books"
        icon={<BookOpen className="h-4 w-4" />}
      />
      <StatCard
        title="Movies in Library"
        value={movieStats.totalMovies}
        description="total movies"
        icon={<Library className="h-4 w-4" />}
      />
      <StatCard
        title="TV Shows in Library"
        value={tvStats.totalShows}
        description="total shows"
        icon={<Tv className="h-4 w-4" />}
      />
      <StatCard
        title="Books in Library"
        value={bookStats.totalBooks}
        description="total books"
        icon={<Library className="h-4 w-4" />}
      />
      <StatCard
        title="Currently Reading"
        value={bookStats.readingBooks}
        description="books in progress"
        icon={<TrendingUp className="h-4 w-4" />}
      />
      <StatCard
        title="Books on Wishlist"
        value={bookStats.wishlistCount}
        description="to read"
        icon={<Bookmark className="h-4 w-4" />}
      />
    </div>
  );
}
