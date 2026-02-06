"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Film, Tv, Book, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

interface SearchResult {
  type: "movie" | "tvshow" | "book";
  id: string;
  title: string;
  posterPath?: string | null;
  coverImage?: string | null;
  overview?: string;
  synopsis?: string;
  genres?: string[];
  authors?: string[];
}

export function UnifiedSearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    movies: SearchResult[];
    tvShows: SearchResult[];
    books: SearchResult[];
  }>({ movies: [], tvShows: [], books: [] });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const debounceTimer = useRef<NodeJS.Timeout>();
  const { mutate: search } = api.search.searchAll.useMutation();

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "/" && !open) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const performSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults({ movies: [], tvShows: [], books: [] });
        return;
      }

      setIsLoading(true);
      search(
        { query: searchQuery, limit: 5 },
        {
          onSuccess: (data) => {
            setResults({
              movies: data.movies,
              tvShows: data.tvShows,
              books: data.books,
            });
            setIsLoading(false);
          },
          onError: () => {
            setIsLoading(false);
          },
        },
      );
    },
    [search],
  );

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => performSearch(newQuery), 300);
  };

  const handleResultClick = (type: string, id: string) => {
    setOpen(false);
    setQuery("");
    setResults({ movies: [], tvShows: [], books: [] });

    switch (type) {
      case "movie":
        router.push(`/movies/${id}`);
        break;
      case "tvshow":
        router.push(`/tv-shows/${id}`);
        break;
      case "book":
        router.push(`/books/${id}`);
        break;
    }
  };

  const handleViewAllResults = () => {
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const hasResults =
    results.movies.length > 0 ||
    results.tvShows.length > 0 ||
    results.books.length > 0;

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start text-sm text-muted-foreground md:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline-flex">Search...</span>
        <span className="inline-flex sm:hidden">Search</span>
        <kbd className="pointer-events-none ml-auto hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Search Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search Input */}
            <Input
              placeholder="Search movies, TV shows, books..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="h-10"
              autoFocus
            />

            {/* Results */}
            <div className="max-h-[400px] space-y-4 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : query.trim() === "" ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Start typing to search
                </div>
              ) : !hasResults ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No results found for "{query}"
                </div>
              ) : (
                <>
                  {/* Movies Results */}
                  {results.movies.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-xs font-semibold uppercase text-muted-foreground">
                        <Film className="h-3 w-3" />
                        <span>Movies</span>
                      </div>
                      <div className="space-y-1">
                        {results.movies.map((movie) => (
                          <button
                            key={movie.id}
                            onClick={() => handleResultClick("movie", movie.id)}
                            className="w-full rounded px-2 py-2 text-left text-sm hover:bg-accent"
                          >
                            <p className="font-medium">{movie.title}</p>
                            {movie.overview && (
                              <p className="line-clamp-1 text-xs text-muted-foreground">
                                {movie.overview}
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TV Shows Results */}
                  {results.tvShows.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-xs font-semibold uppercase text-muted-foreground">
                        <Tv className="h-3 w-3" />
                        <span>TV Shows</span>
                      </div>
                      <div className="space-y-1">
                        {results.tvShows.map((show) => (
                          <button
                            key={show.id}
                            onClick={() => handleResultClick("tvshow", show.id)}
                            className="w-full rounded px-2 py-2 text-left text-sm hover:bg-accent"
                          >
                            <p className="font-medium">{show.title}</p>
                            {show.overview && (
                              <p className="line-clamp-1 text-xs text-muted-foreground">
                                {show.overview}
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Books Results */}
                  {results.books.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-xs font-semibold uppercase text-muted-foreground">
                        <Book className="h-3 w-3" />
                        <span>Books</span>
                      </div>
                      <div className="space-y-1">
                        {results.books.map((book) => (
                          <button
                            key={book.id}
                            onClick={() => handleResultClick("book", book.id)}
                            className="w-full rounded px-2 py-2 text-left text-sm hover:bg-accent"
                          >
                            <p className="font-medium">{book.title}</p>
                            {book.authors && book.authors.length > 0 && (
                              <p className="line-clamp-1 text-xs text-muted-foreground">
                                {book.authors.join(", ")}
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View All Results */}
                  {hasResults && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={handleViewAllResults}
                    >
                      View all results
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Keyboard Hint */}
            <div className="border-t pt-4 text-xs text-muted-foreground">
              <p>
                <kbd className="rounded border bg-muted px-2 py-1">⌘K</kbd> or{" "}
                <kbd className="rounded border bg-muted px-2 py-1">/</kbd> to
                open search
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
