import Link from "next/link";
import type { RouterOutputs } from "~/trpc/react";
import { MovieCard } from "~/components/movie-card";
import { TvShowCard } from "~/components/tv-show-card";
import { BookCard } from "~/components/book-card";

interface DashboardRecentlyAddedSectionProps {
  movies: RouterOutputs["movie"]["getAll"]["movies"];
  tvShows: RouterOutputs["tvShow"]["getAll"]["tvShows"];
  books: RouterOutputs["book"]["getAll"]["books"];
}

export function DashboardRecentlyAddedSection({
  movies,
  tvShows,
  books,
}: DashboardRecentlyAddedSectionProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recently Added Movies</h3>
          <Link
            href="/movies"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            View all →
          </Link>
        </div>
        {movies.length === 0 ? (
          <p className="text-muted-foreground text-sm">No movies added yet.</p>
        ) : (
          <div className="grid gap-4">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recently Added TV Shows</h3>
          <Link
            href="/tv-shows"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            View all →
          </Link>
        </div>
        {tvShows.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No TV shows added yet.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {tvShows.map((tvShow) => (
              <TvShowCard key={tvShow.id} tvShow={tvShow} />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recently Added Books</h3>
          <Link
            href="/books"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            View all →
          </Link>
        </div>
        {books.length === 0 ? (
          <p className="text-muted-foreground text-sm">No books added yet.</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
