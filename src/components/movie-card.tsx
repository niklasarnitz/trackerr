"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { toCalendarDate } from "~/lib/watch-date";
import {
  Calendar as CalendarIcon,
  Play,
  Disc,
  Eye,
  Heart,
  Bookmark,
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

type Movie =
  | RouterOutputs["movie"]["getAll"]["movies"][number]
  | RouterOutputs["movie"]["getFiltered"]["movies"][number];

interface MovieCardProps {
  movie: Movie;
  onMovieUpdated?: () => void;
}

export function MovieCard({ movie, onMovieUpdated }: MovieCardProps) {
  const router = useRouter();
  const utils = api.useUtils();

  const toggleWatchlist = api.movie.toggleWatchlist.useMutation({
    onMutate: () => {
      return { wasInWatchlist: movie.isInWatchlist };
    },
    onSuccess: async (_data, _vars, ctx) => {
      toast.success(
        ctx?.wasInWatchlist ? "Removed from watchlist" : "Added to watchlist",
      );

      await Promise.all([
        utils.movie.getAll.invalidate(),
        utils.movie.getById.invalidate({ id: movie.id }),
      ]);
      onMovieUpdated?.();
      router.refresh();
    },
  });

  const toggleFavorite = api.movie.toggleFavorite.useMutation({
    onMutate: () => {
      return { wasFavorite: movie.isFavorite };
    },
    onSuccess: async (_data, _vars, ctx) => {
      toast.success(
        ctx?.wasFavorite ? "Removed from favorites" : "Added to favorites",
      );

      await Promise.all([
        utils.movie.getAll.invalidate(),
        utils.movie.getById.invalidate({ id: movie.id }),
      ]);
      onMovieUpdated?.();
      router.refresh();
    },
  });

  const getLastWatchDate = (watches: Movie["watches"]) => {
    if (!watches || watches.length === 0) return null;
    const firstWatch = watches[0];
    return firstWatch ? toCalendarDate(firstWatch.watchedAt) : null;
  };

  const getAverageRating = (watches: Movie["watches"]) => {
    if (!watches || watches.length === 0) return null;
    const ratingsWithValues = watches.filter((w) => w.rating !== null);
    if (ratingsWithValues.length === 0) return null;
    return (
      ratingsWithValues.reduce((sum, w) => sum + (w.rating ?? 0), 0) /
      ratingsWithValues.length
    );
  };

  const lastWatchDate = getLastWatchDate(movie.watches);
  const averageRating = getAverageRating(movie.watches);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex gap-4">
          <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded">
            <OptimizedCoverImage
              src={movie.posterPath}
              alt={movie.title}
              blurDataUrl={movie.blurDataUrl}
              fill
              sizes="64px"
            />
          </div>

          <div className="flex-1 space-y-2">
            <div>
              <Link href={`/movies/${movie.id}`}>
                <CardTitle className="line-clamp-1 hover:underline">
                  {movie.title}
                </CardTitle>
              </Link>
              {movie.originalTitle && movie.originalTitle !== movie.title && (
                <CardDescription className="line-clamp-1">
                  {movie.originalTitle}
                </CardDescription>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {movie.releaseYear && (
                <Badge variant="secondary" className="text-xs">
                  {movie.releaseYear}
                </Badge>
              )}
              {averageRating && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <StarRatingDisplay rating={averageRating} />
                  {averageRating.toFixed(1)}
                </Badge>
              )}
              {movie.isFavorite && (
                <Badge variant="default" className="text-xs">
                  <Heart className="mr-1 h-3 w-3 fill-red-500 text-red-500" />
                  Favorite
                </Badge>
              )}
              {movie.isInWatchlist && (
                <Badge variant="default" className="text-xs">
                  <Bookmark className="mr-1 h-3 w-3" />
                  Watchlist
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="flex flex-col items-center gap-1">
            <Eye className="text-muted-foreground h-4 w-4" />
            <span className="text-xs font-medium">{movie._count.watches}</span>
            <span className="text-muted-foreground text-xs">Watches</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Disc className="text-muted-foreground h-4 w-4" />
            <span className="text-xs font-medium">
              {movie._count.mediaEntries}
            </span>
            <span className="text-muted-foreground text-xs">Media</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <CalendarIcon className="text-muted-foreground h-4 w-4" />
            <span className="text-xs font-medium">
              {lastWatchDate
                ? format(lastWatchDate, "MMM d", { locale: enUS })
                : "—"}
            </span>
            <span className="text-muted-foreground text-xs">Last</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/movies/${movie.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </Link>
          <Link href={`/movies/${movie.id}?addWatch=true`} className="flex-1">
            <Button variant="default" size="sm" className="w-full">
              <Play className="mr-1 h-3 w-3" />
              Watch
            </Button>
          </Link>
        </div>

        <div className="flex gap-2">
          <Button
            variant={movie.isInWatchlist ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => toggleWatchlist.mutate({ id: movie.id })}
            disabled={toggleWatchlist.isPending}
          >
            <Bookmark
              className={`mr-1 h-3 w-3 ${movie.isInWatchlist ? "fill-current" : ""}`}
            />
            {movie.isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
          </Button>
          <Button
            variant={movie.isFavorite ? "secondary" : "outline"}
            size="sm"
            className="w-8 px-0"
            onClick={() => toggleFavorite.mutate({ id: movie.id })}
            disabled={toggleFavorite.isPending}
            aria-label={
              movie.isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            title={
              movie.isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Heart
              className={`h-4 w-4 ${movie.isFavorite ? "fill-red-500 text-red-500" : ""}`}
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
