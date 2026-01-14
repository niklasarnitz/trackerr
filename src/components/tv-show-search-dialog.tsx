"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Tv } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { OptimizedCoverImage } from "~/components/optimized-cover-image";

interface TvShowSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TvShowSearchDialog({
  open,
  onOpenChange,
}: TvShowSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const router = useRouter();
  const utils = api.useUtils();

  // Debounce search query
  const handleQueryChange = (value: string) => {
    setQuery(value);
    const timer = setTimeout(() => {
      setDebouncedQuery(value);
    }, 500);
    return () => clearTimeout(timer);
  };

  const { data: searchResults, isLoading: isSearching } =
    api.tvdb.search.useQuery(
      { query: debouncedQuery },
      { enabled: debouncedQuery.length >= 2 },
    );

  const createTvShow = api.tvShow.create.useMutation({
    onSuccess: async (tvShow) => {
      toast.success(`${tvShow.title} added to your collection`);
      await utils.tvShow.getAll.invalidate();
      onOpenChange(false);
      setQuery("");
      setDebouncedQuery("");
      router.push(`/tv-shows/${tvShow.id}`);
      router.refresh();
    },
    onError: (error) => {
      if (error.message.includes("already exists")) {
        toast.error("This TV show is already in your collection");
      } else {
        toast.error(error.message || "Failed to add TV show");
      }
    },
  });

  const handleAddShow = (tvdbId: string) => {
    createTvShow.mutate({ tvdbId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Search TV Shows</DialogTitle>
          <DialogDescription>
            Search for TV shows on TVDB to add to your collection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
            <Input
              placeholder="Search for TV shows..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="pl-9"
            />
          </div>

          {isSearching && (
            <div className="text-muted-foreground py-8 text-center text-sm">
              Searching...
            </div>
          )}

          {!isSearching &&
            searchResults &&
            searchResults.results.length > 0 && (
              <div className="space-y-2">
                {searchResults.results.map((show) => (
                  <div
                    key={show.id}
                    className="hover:bg-muted/50 flex gap-4 rounded-lg border p-3 transition-colors"
                  >
                    <div className="bg-muted relative h-24 w-16 flex-shrink-0 overflow-hidden rounded">
                      {show.posterPath ? (
                        <OptimizedCoverImage
                          src={show.posterPath}
                          alt={show.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Tv className="text-muted-foreground h-8 w-8" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-semibold">{show.title}</h3>
                        <p className="text-muted-foreground text-sm">
                          {show.year && `${show.year}`}
                          {show.network && ` • ${show.network}`}
                          {show.status && ` • ${show.status}`}
                        </p>
                        {show.overview && (
                          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                            {show.overview}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Button
                        size="sm"
                        onClick={() => handleAddShow(show.id)}
                        disabled={createTvShow.isPending}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          {!isSearching &&
            debouncedQuery.length >= 2 &&
            searchResults?.results.length === 0 && (
              <div className="text-muted-foreground py-8 text-center text-sm">
                No TV shows found. Try a different search query.
              </div>
            )}

          {debouncedQuery.length < 2 && !isSearching && (
            <div className="text-muted-foreground py-8 text-center text-sm">
              Start typing to search for TV shows
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
