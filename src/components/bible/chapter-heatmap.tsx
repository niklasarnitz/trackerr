import { cn } from "~/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface ChapterHeatmapProps {
  totalChapters: number;
  chapterStats: Record<number, number>;
  verseStats?: Record<number, { read: number; total: number }>;
}

const getIntensityColor = (intensity: number) => {
  if (intensity <= 0) return "bg-muted";
  if (intensity < 1) return "bg-green-100 dark:bg-green-950"; // Partial read
  if (intensity < 2) return "bg-green-300 dark:bg-green-800"; // 1x read
  if (intensity < 3) return "bg-green-500 dark:bg-green-600"; // 2x read
  return "bg-green-700 dark:bg-green-500"; // 3x+ read
};

export function ChapterHeatmap({
  totalChapters,
  chapterStats,
  verseStats,
}: ChapterHeatmapProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {Array.from({ length: totalChapters }, (_, i) => i + 1).map((chapter) => {
        const intensity = chapterStats[chapter] ?? 0;
        const vStats = verseStats?.[chapter];
        const readVerses = vStats?.read ?? 0;
        const totalVerses = vStats?.total ?? 0;
        const isComplete = totalVerses > 0 && readVerses >= totalVerses;

        return (
          <Tooltip key={chapter}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "h-3 w-3 rounded-[1px] transition-colors cursor-default",
                  getIntensityColor(intensity),
                )}
              />
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <p className="font-semibold">Chapter {chapter}</p>
                <p>Avg Reads: {intensity.toFixed(1)}x</p>
                {totalVerses > 0 && (
                   <p>
                    Unique: {readVerses}/{totalVerses}
                  </p>
                )}
                {isComplete && (
                  <p className="text-green-500 font-semibold">Complete</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
