"use client";

import { useState } from "react";
import Link from "next/link";
import { Film, Tv, BookOpen, Heart, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import type { RouterOutputs } from "~/trpc/react";

type Movie = RouterOutputs["movie"]["getWatchlist"]["movies"][0];
type TvShow = RouterOutputs["tvShow"]["getAll"]["tvShows"][0];
type Book = RouterOutputs["book"]["getAll"]["books"][0];

export function WatchlistContent() {
  const [activeTab, setActiveTab] = useState("all");
  const utils = api.useUtils();

  // Fetch watchlists
  const moviesQuery = api.movie.getWatchlist.useQuery({
    search: "",
    sort: "title",
    skip: 0,
    limit: 100,
  });
  const tvShowsQuery = api.tvShow.getAll.useQuery({
    search: "",
    sort: "title",
    skip: 0,
    limit: 100,
    watchlist: true,
  });
  const booksQuery = api.book.getAll.useQuery({
    search: "",
    sort: "title",
    skip: 0,
    limit: 100,
    isOnWishlist: true,
  });

  // Mutations
  const removeMovieFromWatchlist = api.movie.toggleWatchlist.useMutation({
    onSuccess: async () => {
      toast.success("Removed from watchlist");
      await utils.movie.getWatchlist.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove from watchlist");
    },
  });

  const removeTvShowFromWatchlist = api.tvShow.toggleWatchlist.useMutation({
    onSuccess: async () => {
      toast.success("Removed from watchlist");
      await utils.tvShow.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove from watchlist");
    },
  });

  const removeBookFromWishlist = api.book.update.useMutation({
    onSuccess: async () => {
      toast.success("Removed from wishlist");
      await utils.book.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove from wishlist");
    },
  });

  const movies = moviesQuery.data?.movies ?? [];
  const tvShows = tvShowsQuery.data?.tvShows ?? [];
  const books = booksQuery.data?.books ?? [];

  const totalCount = movies.length + tvShows.length + books.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Watchlist</h1>
        <p className="text-muted-foreground mt-2">
          Media you want to watch or read. ({totalCount} items)
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({totalCount})</TabsTrigger>
          <TabsTrigger value="movies">
            <Film className="mr-2 h-4 w-4" />
            Movies ({movies.length})
          </TabsTrigger>
          <TabsTrigger value="tv">
            <Tv className="mr-2 h-4 w-4" />
            TV Shows ({tvShows.length})
          </TabsTrigger>
          <TabsTrigger value="books">
            <BookOpen className="mr-2 h-4 w-4" />
            Books ({books.length})
          </TabsTrigger>
        </TabsList>

        {/* All Tab */}
        <TabsContent value="all" className="space-y-6">
          {totalCount === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No items in your watchlist yet. Add movies, TV shows, or books
                  to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {movies.length > 0 && (
                <MovieSection
                  movies={movies}
                  onRemove={(id) => removeMovieFromWatchlist.mutate({ id })}
                  isLoading={removeMovieFromWatchlist.isPending}
                />
              )}
              {tvShows.length > 0 && (
                <TVShowSection
                  tvShows={tvShows}
                  onRemove={(id) => removeTvShowFromWatchlist.mutate({ id })}
                  isLoading={removeTvShowFromWatchlist.isPending}
                />
              )}
              {books.length > 0 && (
                <BookSection
                  books={books}
                  onRemove={(id) =>
                    removeBookFromWishlist.mutate({
                      id,
                      isOnWishlist: false,
                    })
                  }
                  isLoading={removeBookFromWishlist.isPending}
                />
              )}
            </>
          )}
        </TabsContent>

        {/* Movies Tab */}
        <TabsContent value="movies">
          {movies.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No movies in your watchlist. Add some movies to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            <MovieSection
              movies={movies}
              onRemove={(id) => removeMovieFromWatchlist.mutate({ id })}
              isLoading={removeMovieFromWatchlist.isPending}
            />
          )}
        </TabsContent>

        {/* TV Shows Tab */}
        <TabsContent value="tv">
          {tvShows.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No TV shows in your watchlist. Add some TV shows to get
                  started!
                </p>
              </CardContent>
            </Card>
          ) : (
            <TVShowSection
              tvShows={tvShows}
              onRemove={(id) => removeTvShowFromWatchlist.mutate({ id })}
              isLoading={removeTvShowFromWatchlist.isPending}
            />
          )}
        </TabsContent>

        {/* Books Tab */}
        <TabsContent value="books">
          {books.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No books in your wishlist. Add some books to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            <BookSection
              books={books}
              onRemove={(id) =>
                removeBookFromWishlist.mutate({ id, isOnWishlist: false })
              }
              isLoading={removeBookFromWishlist.isPending}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MovieSection({
  movies,
  onRemove,
  isLoading,
}: {
  movies: Movie[];
  onRemove: (id: string) => void;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Movies</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {movies.map((movie) => (
          <Link key={movie.id} href={`/movies/${movie.id}`}>
            <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
              <div className="bg-muted relative aspect-[2/3] overflow-hidden">
                {movie.posterPath ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${movie.posterPath}`}
                    alt={movie.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Film className="text-muted-foreground h-12 w-12" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="line-clamp-2 font-semibold">{movie.title}</h3>
                <div className="mt-3 flex items-center justify-between">
                  {movie.runtime && (
                    <Badge variant="secondary" className="text-xs">
                      {movie.runtime} min
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      onRemove(movie.id);
                    }}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function TVShowSection({
  tvShows,
  onRemove,
  isLoading,
}: {
  tvShows: TvShow[];
  onRemove: (id: string) => void;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">TV Shows</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tvShows.map((show) => (
          <Link key={show.id} href={`/tv-shows/${show.id}`}>
            <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
              <div className="bg-muted relative aspect-[2/3] overflow-hidden">
                {show.posterPath ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${show.posterPath}`}
                    alt={show.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Tv className="text-muted-foreground h-12 w-12" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="line-clamp-2 font-semibold">{show.title}</h3>
                <div className="mt-3 flex items-center justify-between">
                  {show.status && (
                    <Badge variant="secondary" className="text-xs">
                      {show.status}
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      onRemove(show.id);
                    }}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function BookSection({
  books,
  onRemove,
  isLoading,
}: {
  books: Book[];
  onRemove: (id: string) => void;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Books</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {books.map((book) => (
          <Link key={book.id} href={`/books/${book.id}`}>
            <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
              <div className="bg-muted relative aspect-[2/3] overflow-hidden">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="text-muted-foreground h-12 w-12" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="line-clamp-2 font-semibold">{book.title}</h3>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    Wishlist
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      onRemove(book.id);
                    }}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
