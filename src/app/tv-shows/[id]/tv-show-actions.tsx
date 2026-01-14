"use client";

import { useRouter } from "next/navigation";
import { Heart, Bookmark, Trash2, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import type { RouterOutputs } from "~/trpc/react";

type TvShow = RouterOutputs["tvShow"]["getById"];

interface TvShowActionsProps {
  tvShow: TvShow;
}

export function TvShowActions({ tvShow }: TvShowActionsProps) {
  const router = useRouter();
  const utils = api.useUtils();

  const toggleWatchlist = api.tvShow.toggleWatchlist.useMutation({
    onSuccess: async () => {
      toast.success(
        tvShow.isInWatchlist ? "Removed from watchlist" : "Added to watchlist",
      );
      await utils.tvShow.getById.invalidate({ id: tvShow.id });
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update watchlist");
    },
  });

  const toggleFavorite = api.tvShow.toggleFavorite.useMutation({
    onSuccess: async () => {
      toast.success(
        tvShow.isFavorite ? "Removed from favorites" : "Added to favorites",
      );
      await utils.tvShow.getById.invalidate({ id: tvShow.id });
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update favorites");
    },
  });

  const deleteTvShow = api.tvShow.delete.useMutation({
    onSuccess: async () => {
      toast.success("TV show deleted successfully");
      await utils.tvShow.getAll.invalidate();
      router.push("/tv-shows");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete TV show");
    },
  });

  const syncSeasons = api.tvShow.syncSeasonsAndEpisodes.useMutation({
    onSuccess: async () => {
      toast.success("Seasons and episodes synced successfully");
      await utils.tvShow.getById.invalidate({ id: tvShow.id });
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sync seasons");
    },
  });

  return (
    <div className="mt-4 space-y-2">
      <Button
        className="w-full"
        variant={tvShow.isInWatchlist ? "default" : "outline"}
        onClick={() => toggleWatchlist.mutate({ id: tvShow.id })}
        disabled={toggleWatchlist.isPending}
      >
        <Bookmark
          className={`mr-2 h-4 w-4 ${tvShow.isInWatchlist ? "fill-current" : ""}`}
        />
        {tvShow.isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
      </Button>

      <Button
        className="w-full"
        variant={tvShow.isFavorite ? "default" : "outline"}
        onClick={() => toggleFavorite.mutate({ id: tvShow.id })}
        disabled={toggleFavorite.isPending}
      >
        <Heart
          className={`mr-2 h-4 w-4 ${tvShow.isFavorite ? "fill-current" : ""}`}
        />
        {tvShow.isFavorite ? "Favorite" : "Add to Favorites"}
      </Button>

      <Button
        className="w-full"
        variant="outline"
        onClick={() => syncSeasons.mutate({ id: tvShow.id })}
        disabled={syncSeasons.isPending}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        {syncSeasons.isPending ? "Syncing..." : "Sync Seasons"}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className="w-full" variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete TV Show
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{tvShow.title}&quot; and all
              associated watch history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTvShow.mutate({ id: tvShow.id })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
