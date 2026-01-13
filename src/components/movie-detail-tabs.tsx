"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { MovieWatchCard } from "~/components/movie-watch-card";
import { MediaEntryCard } from "~/components/media-entry-card";
import { api, type RouterOutputs } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AddMediaEntryDialog } from "./add-media-entry-dialog";
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
import { AddMovieWatchDialog } from "./add-movie-watch-dialog";

type Movie = RouterOutputs["movie"]["getById"];

interface MovieDetailTabsProps {
  movie: Movie;
  openAddWatch?: boolean;
}

export function MovieDetailTabs({
  movie,
  openAddWatch = false,
}: MovieDetailTabsProps) {
  const [activeTab, setActiveTab] = useState("watches");
  const [showAddWatch, setShowAddWatch] = useState(openAddWatch);
  const router = useRouter();
  const utils = api.useUtils();

  const { data: watches, refetch: refetchWatches } =
    api.movieWatch.getByMovieId.useQuery({ movieId: movie.id });

  const { data: mediaEntries, refetch: refetchMedia } =
    api.mediaEntry.getByMovieId.useQuery({ movieId: movie.id });

  const deleteMovieMutation = api.movie.delete.useMutation({
    onSuccess: async () => {
      toast.success("Movie removed from collection!");

      await Promise.all([
        utils.movie.getAll.invalidate(),
        utils.movie.getById.invalidate({ id: movie.id }),
        utils.movieWatch.getAll.invalidate(),
        utils.movieWatch.getRecent.invalidate(),
        utils.movieWatch.getStats.invalidate(),
        utils.mediaEntry.getAll.invalidate(),
        utils.mediaEntry.getCollectionGroupedByMovie.invalidate(),
      ]);

      router.push("/movies");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleRefresh = () => {
    void refetchWatches();
    void refetchMedia();
    router.refresh();
  };

  const handleAddWatchSuccess = () => {
    setShowAddWatch(false);
    handleRefresh();
    // Clean up the URL
    router.push(`/movies/${movie.id}`);
  };

  const safeWatches = watches ?? [];
  const safeMediaEntries = mediaEntries ?? [];

  const averageRating =
    safeWatches.length > 0
      ? safeWatches
          .filter((w) => w.rating !== null)
          .reduce((sum, w) => sum + (w.rating ?? 0), 0) /
        safeWatches.filter((w) => w.rating !== null).length
      : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {averageRating && (
            <div className="text-muted-foreground text-sm">
              Average Rating:{" "}
              <span className="font-semibold">{averageRating.toFixed(1)}★</span>
            </div>
          )}
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteMovieMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteMovieMutation.isPending ? "Removing..." : "Remove Movie"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove movie from collection?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove "{movie.title}" from your collection.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteMovieMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90 text-white"
                onClick={() => deleteMovieMutation.mutate({ id: movie.id })}
                disabled={deleteMovieMutation.isPending}
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="watches">
            Watch History ({safeWatches.length})
          </TabsTrigger>
          <TabsTrigger value="media">
            Physical Media ({safeMediaEntries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="watches" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Watch History</h3>
            <AddMovieWatchDialog
              movieId={movie.id}
              onSuccess={handleAddWatchSuccess}
              isOpen={showAddWatch}
              onOpenChange={setShowAddWatch}
            />
          </div>

          {safeWatches.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  No watches recorded yet.
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Add your first watch above to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {safeWatches.map((watch) => (
                <MovieWatchCard
                  key={watch.id}
                  watch={watch}
                  onUpdate={handleRefresh}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Physical Media</h3>
            <AddMediaEntryDialog movieId={movie.id} onSuccess={handleRefresh} />
          </div>

          {safeMediaEntries.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  No physical media entries yet.
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Add your collection items above!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {safeMediaEntries.map((entry) => (
                <MediaEntryCard
                  key={entry.id}
                  mediaEntry={entry}
                  onUpdate={handleRefresh}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
