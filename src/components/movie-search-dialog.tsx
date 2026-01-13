"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Card, CardDescription, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Search,
  Plus,
  Star,
  Calendar,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { useMovieMutations } from "~/hooks/use-movie-mutations";
import { useTmdbMovieSearch } from "~/hooks/use-tmdb-movie-search";

interface MovieSearchDialogProps {
  readonly children: React.ReactNode;
}

export function MovieSearchDialog({ children }: MovieSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { createMovie } = useMovieMutations();

  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    searchResults,
    handleSearch,
    reset,
    getPosterUrl,
    formatRating,
  } = useTmdbMovieSearch({ enabled: open, includedInCollection: true });

  const handleAddMovie = async (movie: {
    id: string;
    title: string;
    originalTitle?: string;
    releaseYear: number | null;
    posterPath: string | null;
    overview?: string;
    inCollection?: boolean;
    movieId?: string | null;
  }) => {
    await createMovie.mutateAsync({
      tmdbId: movie.id,
    });
    void searchResults.refetch();
    router.refresh();
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add Movie to Collection</DialogTitle>
          <DialogDescription>
            Search for movies and add them to your collection.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 flex-col space-y-4 overflow-hidden">
          <form onSubmit={handleSearch}>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  type="text"
                  placeholder="Search for movie..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={searchResults.isLoading}>
                Search
              </Button>
            </div>
          </form>

          <div className="flex-1 overflow-y-auto">
            {searchResults.isLoading && (
              <div className="py-8 text-center">
                <p>Searching for movies...</p>
              </div>
            )}

            {searchResults.error && (
              <div className="py-8 text-center">
                <p className="text-destructive">
                  Error searching: {searchResults.error.message}
                </p>
              </div>
            )}

            {searchResults.data && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">
                    {searchResults.data.total_results} results found
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-3 text-sm">
                      Page {currentPage} of {searchResults.data.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage >= searchResults.data.total_pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {searchResults.data.results.map((movie) => (
                    <Card key={movie.id} className="overflow-hidden">
                      <div className="flex">
                        <div className="w-24 shrink-0">
                          <Image
                            src={getPosterUrl(movie.posterPath)}
                            alt={movie.title}
                            width={96}
                            height={144}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">
                                {movie.title}
                              </CardTitle>
                              {movie.originalTitle &&
                                movie.originalTitle !== movie.title && (
                                  <CardDescription className="mt-1">
                                    Original: {movie.originalTitle}
                                  </CardDescription>
                                )}
                              <div className="text-muted-foreground mt-2 flex items-center gap-4 text-sm">
                                {movie.releaseYear && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {movie.releaseYear}
                                  </div>
                                )}
                                {movie.voteAverage && movie.voteAverage > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4" />
                                    {formatRating(movie.voteAverage)}/5
                                  </div>
                                )}
                              </div>
                              {movie.overview && (
                                <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                                  {movie.overview}
                                </p>
                              )}
                            </div>
                            <div className="ml-4 flex flex-col items-end gap-2">
                              {movie.inCollection ? (
                                <>
                                  <Badge
                                    variant="secondary"
                                    className="flex items-center gap-1"
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                    In Collection
                                  </Badge>
                                  {movie.movieId && (
                                    <Button size="sm" variant="default" asChild>
                                      <Link href={`/movies/${movie.movieId}`}>
                                        <ExternalLink className="mr-1 h-3 w-3" />
                                        Go to Movie
                                      </Link>
                                    </Button>
                                  )}
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleAddMovie(movie)}
                                  disabled={createMovie.isPending}
                                >
                                  <Plus className="mr-1 h-4 w-4" />
                                  Add Movie
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="text-xs"
                              >
                                <a
                                  href={`https://www.themoviedb.org/movie/${movie.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="mr-1 h-3 w-3" />
                                  TMDB
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {!searchQuery && (
              <div className="text-muted-foreground py-8 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>
                  Start typing to search for movies to add to your collection.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
