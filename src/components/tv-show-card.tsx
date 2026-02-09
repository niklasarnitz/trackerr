"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { toCalendarDate } from "~/lib/watch-date";
import {
  Calendar as CalendarIcon,
  Eye,
  Heart,
  Bookmark,
  Tv,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { OptimizedCoverImage } from "~/components/optimized-cover-image";
import { getPosterUrl } from "~/lib/utils";
import { StarRatingDisplay } from "~/components/star-rating-display";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import type { RouterOutputs } from "~/trpc/react";

type TvShow = RouterOutputs["tvShow"]["getAll"]["tvShows"][number];

interface TvShowCardProps {
  tvShow: TvShow;
  onTvShowUpdated?: () => void;
}

export function TvShowCard({ tvShow, onTvShowUpdated }: TvShowCardProps) {
  const router = useRouter();
  const utils = api.useUtils();

  const toggleWatchlist = api.tvShow.toggleWatchlist.useMutation({
    onMutate: () => {
      return { wasInWatchlist: tvShow.isInWatchlist };
    },
    onSuccess: async (_data, _vars, ctx) => {
      toast.success(
        ctx?.wasInWatchlist
          ? "Removed from watchlist"
          : "Added to your watchlist",
      );

      await Promise.all([
        utils.tvShow.getAll.invalidate(),
        utils.tvShow.getById.invalidate({ id: tvShow.id }),
      ]);
      onTvShowUpdated?.();
      router.refresh();
    },
    onError: (error) => {
      toast.error(
        error.message || "Unable to update watchlist. Please try again.",
      );
    },
  });

  const toggleFavorite = api.tvShow.toggleFavorite.useMutation({
    onMutate: () => {
      return { wasFavorite: tvShow.isFavorite };
    },
    onSuccess: async (_data, _vars, ctx) => {
      toast.success(
        ctx?.wasFavorite ? "Removed from favorites" : "Added to your favorites",
      );

      await Promise.all([
        utils.tvShow.getAll.invalidate(),
        utils.tvShow.getById.invalidate({ id: tvShow.id }),
      ]);
      onTvShowUpdated?.();
      router.refresh();
    },
    onError: (error) => {
      toast.error(
        error.message || "Unable to update favorites. Please try again.",
      );
    },
  });

  const getLastWatchDate = (watches: TvShow["watches"]) => {
    if (!watches || watches.length === 0) return null;
    const firstWatch = watches[0];
    return firstWatch ? toCalendarDate(firstWatch.watchedAt) : null;
  };

  const getAverageRating = (watches: TvShow["watches"]) => {
    if (!watches || watches.length === 0) return null;
    const ratingsOnly = watches
      .map((w) => w.rating)
      .filter((r): r is number => r !== null);
    if (ratingsOnly.length === 0) return null;
    return ratingsOnly.reduce((sum, r) => sum + r, 0) / ratingsOnly.length;
  };

  const posterUrl = getPosterUrl(tvShow.posterPath ?? "");
  const lastWatchDate = getLastWatchDate(tvShow.watches);
  const averageRating = getAverageRating(tvShow.watches);
  const watchCount = tvShow._count.watches;

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/tv-shows/${tvShow.id}`}>
        <div className="bg-muted relative aspect-2/3 overflow-hidden">
          {posterUrl ? (
            <OptimizedCoverImage
              src={posterUrl}
              alt={tvShow.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              blurDataUrl={tvShow.blurDataUrl ?? undefined}
            />
          ) : (
            <div className="bg-muted flex h-full items-center justify-center">
              <Tv className="text-muted-foreground h-16 w-16" />
            </div>
          )}

          {/* Quick action buttons overlay */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              size="icon"
              variant={tvShow.isInWatchlist ? "default" : "secondary"}
              onClick={(e) => {
                e.preventDefault();
                toggleWatchlist.mutate({ id: tvShow.id });
              }}
              disabled={toggleWatchlist.isPending}
              className="h-8 w-8"
            >
              <Bookmark
                className={`h-4 w-4 ${tvShow.isInWatchlist ? "fill-current" : ""}`}
              />
            </Button>
            <Button
              size="icon"
              variant={tvShow.isFavorite ? "default" : "secondary"}
              onClick={(e) => {
                e.preventDefault();
                toggleFavorite.mutate({ id: tvShow.id });
              }}
              disabled={toggleFavorite.isPending}
              className="h-8 w-8"
            >
              <Heart
                className={`h-4 w-4 ${tvShow.isFavorite ? "fill-current" : ""}`}
              />
            </Button>
          </div>
        </div>
      </Link>

      <CardHeader className="p-4">
        <Link href={`/tv-shows/${tvShow.id}`}>
          <CardTitle className="line-clamp-2 text-base hover:underline">
            {tvShow.title}
          </CardTitle>
        </Link>
        {tvShow.firstAirDate && (
          <CardDescription className="text-sm">
            {format(new Date(tvShow.firstAirDate), "yyyy")}
            {tvShow.status && ` • ${tvShow.status}`}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap gap-2">
          {watchCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              <Eye className="mr-1 h-3 w-3" />
              {watchCount}
            </Badge>
          )}
          {lastWatchDate && (
            <Badge variant="outline" className="text-xs">
              <CalendarIcon className="mr-1 h-3 w-3" />
              {format(lastWatchDate, "PP", { locale: enUS })}
            </Badge>
          )}
        </div>
        {averageRating && (
          <div className="mt-2">
            <StarRatingDisplay rating={averageRating} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
