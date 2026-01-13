"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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

export default function MovieSearchPage() {
  const { createMovie } = useMovieMutations();
  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    searchResults,
    handleSearch,
    getPosterUrl,
    formatRating,
  } = useTmdbMovieSearch({ enabled: true, includedInCollection: true });

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
    await searchResults.refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Search Movies</h1>
        <p className="text-muted-foreground">
          Search for movies and add them to your collection.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-8">
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {searchResults.data.total_results} results found
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-3">
                Page {currentPage} of {searchResults.data.total_pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage >= searchResults.data.total_pages}
              >
                Next
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {searchResults.data.results.map((movie) => {
              const MovieCardContent = (
                <Card
                  key={movie.id}
                  className={`overflow-hidden ${movie.inCollection ? "cursor-pointer transition-shadow hover:shadow-lg" : ""}`}
                >
                  <div className="relative aspect-2/3">
                    <Image
                      src={getPosterUrl(movie.posterPath)}
                      alt={movie.title}
                      fill
                      className="object-cover"
                    />
                    {movie.inCollection && (
                      <div className="absolute top-2 right-2">
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          In Collection
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg leading-tight">
                      {movie.title}
                    </CardTitle>
                    {movie.originalTitle &&
                      movie.originalTitle !== movie.title && (
                        <CardDescription className="text-sm">
                          {movie.originalTitle}
                        </CardDescription>
                      )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-muted-foreground mb-3 flex items-center gap-4 text-sm">
                      {movie.releaseYear && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {movie.releaseYear}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {movie.voteAverage
                          ? formatRating(movie.voteAverage)
                          : "N/A"}
                      </div>
                    </div>
                    {movie.overview && (
                      <p className="text-muted-foreground mb-3 line-clamp-3 text-sm">
                        {movie.overview}
                      </p>
                    )}
                    <Button
                      onClick={() => handleAddMovie(movie)}
                      disabled={movie.inCollection || createMovie.isPending}
                      className="w-full"
                      variant={movie.inCollection ? "secondary" : "default"}
                    >
                      {movie.inCollection ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          In Collection
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add to Collection
                        </>
                      )}
                    </Button>
                    {movie.inCollection && movie.movieId && (
                      <Button variant="default" className="w-full" asChild>
                        <Link href={`/movies/${movie.movieId}`}>
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Go to Movie
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
              if (movie.inCollection && movie.movieId) {
                return (
                  <Link key={movie.id} href={`/movies/${movie.movieId}`}>
                    {MovieCardContent}
                  </Link>
                );
              }

              return MovieCardContent;
            })}
          </div>

          {searchResults.data.results.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                No movies found. Try a different search term.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
