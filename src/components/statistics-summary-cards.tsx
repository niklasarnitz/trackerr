import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Clock, Calendar, Star, Database, Trophy, Film } from "lucide-react";
import type { RouterOutputs } from "~/trpc/react";

interface StatisticsSummaryCardsProps {
  allTimeStats: RouterOutputs["movieWatch"]["getStats"];
  currentYearStats: RouterOutputs["movieWatch"]["getStats"];
}

export function StatisticsSummaryCards({
  allTimeStats,
  currentYearStats,
}: StatisticsSummaryCardsProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">All Time Watches</CardTitle>
          <Clock className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{allTimeStats.totalWatches}</div>
          <p className="text-muted-foreground text-xs">movies watched total</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{currentYear} Watches</CardTitle>
          <Calendar className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentYearStats.totalWatches}</div>
          <p className="text-muted-foreground text-xs">movies watched this year</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Movies</CardTitle>
          <Database className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{allTimeStats.totalMovies}</div>
          <p className="text-muted-foreground text-xs">in database</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Physical Collection</CardTitle>
          <Film className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{allTimeStats.physicalMovies}</div>
          <p className="text-muted-foreground text-xs">physical copies</p>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Rating (All Time)</CardTitle>
          <Star className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
             {allTimeStats.averageRating
              ? `${allTimeStats.averageRating.toFixed(1)}★`
              : "—"}
          </div>
          <p className="text-muted-foreground text-xs">lifetime average</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Rating ({currentYear})</CardTitle>
          <Star className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {currentYearStats.averageRating
              ? `${currentYearStats.averageRating.toFixed(1)}★`
              : "—"}
          </div>
          <p className="text-muted-foreground text-xs">this year's average</p>
        </CardContent>
      </Card>

    </div>
  );
}
