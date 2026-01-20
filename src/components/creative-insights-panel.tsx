import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Clock, User, Users } from "lucide-react";
import type { RouterOutputs } from "~/trpc/react";

interface CreativeInsightsPanelProps {
  stats: RouterOutputs["movieWatch"]["getCreativeStats"];
}

export function CreativeInsightsPanel({ stats }: CreativeInsightsPanelProps) {
  const formatRuntime = (minutes: number) => {
    const days = Math.floor(minutes / (24 * 60));
    const hours = Math.floor((minutes % (24 * 60)) / 60);
    const mins = minutes % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);
    
    return parts.length > 0 ? parts.join(" ") : "0m";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Total Runtime */}
      <Card className="col-span-full md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Watch Time</CardTitle>
          <Clock className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-1">
            {formatRuntime(stats.totalRuntimeMinutes)}
          </div>
          <p className="text-muted-foreground text-xs">
            spent watching movies
          </p>
          <div className="text-muted-foreground mt-4 text-xs">
            Average per movie:{" "}
            {stats.watchCount > 0
              ? Math.round(stats.totalRuntimeMinutes / stats.watchCount)
              : 0}{" "}
            min
          </div>
        </CardContent>
      </Card>

      {/* Top Directors */}
      <Card className="col-span-full md:col-span-1 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Directors</CardTitle>
          <User className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topDirectors.length === 0 ? (
              <p className="text-muted-foreground text-sm">No data available</p>
            ) : (
              stats.topDirectors.slice(0, 5).map((director, index) => (
                <div key={director.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground min-w-[1.5rem] text-sm font-medium">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium truncate max-w-[120px]" title={director.name}>
                      {director.name}
                    </span>
                  </div>
                  <div className="text-sm font-bold">{director.count}</div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Actors */}
      <Card className="col-span-full md:col-span-1 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Actors</CardTitle>
          <Users className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topActors.length === 0 ? (
              <p className="text-muted-foreground text-sm">No data available</p>
            ) : (
              stats.topActors.slice(0, 5).map((actor, index) => (
                <div key={actor.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground min-w-[1.5rem] text-sm font-medium">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium truncate max-w-[120px]" title={actor.name}>
                      {actor.name}
                    </span>
                  </div>
                  <div className="text-sm font-bold">{actor.count}</div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
