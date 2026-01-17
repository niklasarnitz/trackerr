"use client";

import { useRouter } from "next/navigation";
import { Heart, Bookmark, Trash2 } from "lucide-react";
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

type Movie = RouterOutputs["movie"]["getById"];

interface MovieActionsProps {
  movie: Movie;
}

export function MovieActions({ movie }: MovieActionsProps) {
  const router = useRouter();
  const utils = api.useUtils();

  const toggleWatchlist = api.movie.toggleWatchlist.useMutation({
    onSuccess: async () => {
      toast.success(
        movie.isInWatchlist ? "Removed from watchlist" : "Added to watchlist",
      );
      await utils.movie.getById.invalidate({ id: movie.id });
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update watchlist");
    },
  });

  const toggleFavorite = api.movie.toggleFavorite.useMutation({
    onSuccess: async () => {
      toast.success(
        movie.isFavorite ? "Removed from favorites" : "Added to favorites",
      );
      await utils.movie.getById.invalidate({ id: movie.id });
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update favorites");
    },
  });

  const deleteMovie = api.movie.delete.useMutation({
    onSuccess: async () => {
      toast.success("Movie deleted successfully");
      await utils.movie.getAll.invalidate();
      router.push("/movies");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete movie");
    },
  });

  const handleDeleteMovie = async () => {
    await deleteMovie.mutateAsync({ id: movie.id });
  };

  return (
    <div className="mt-4 space-y-2">
      <Button
        className="w-full"
        variant={movie.isInWatchlist ? "default" : "outline"}
        onClick={() => toggleWatchlist.mutate({ id: movie.id })}
        disabled={toggleWatchlist.isPending}
      >
        <Bookmark
          className={`mr-2 h-4 w-4 ${movie.isInWatchlist ? "fill-current" : ""}`}
        />
        {movie.isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
      </Button>

      <Button
        className="w-full"
        variant={movie.isFavorite ? "default" : "outline"}
        onClick={() => toggleFavorite.mutate({ id: movie.id })}
        disabled={toggleFavorite.isPending}
      >
        <Heart
          className={`mr-2 h-4 w-4 ${movie.isFavorite ? "fill-current" : ""}`}
        />
        {movie.isFavorite ? "Favorite" : "Add to Favorites"}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className="w-full" variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Movie
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{movie.title}&quot; and all
              associated watch history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMovie.mutate({ id: movie.id })}
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
