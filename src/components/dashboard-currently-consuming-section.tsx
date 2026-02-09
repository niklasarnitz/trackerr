import Link from "next/link";
import type { RouterOutputs } from "~/trpc/react";
import { BookCard } from "~/components/book-card";
import { TvShowCard } from "~/components/tv-show-card";

interface DashboardCurrentlyConsumingSectionProps {
  readingBooks: RouterOutputs["book"]["getAll"]["books"];
  watchingShows: RouterOutputs["tvShow"]["getAll"]["tvShows"];
}

export function DashboardCurrentlyConsumingSection({
  readingBooks,
  watchingShows,
}: DashboardCurrentlyConsumingSectionProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Currently Reading</h3>
          <Link
            href="/books"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            View all →
          </Link>
        </div>
        {readingBooks.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No books in progress yet.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {readingBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Currently Watching</h3>
          <Link
            href="/tv-shows"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            View all →
          </Link>
        </div>
        {watchingShows.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No TV shows watched yet.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {watchingShows.map((tvShow) => (
              <TvShowCard key={tvShow.id} tvShow={tvShow} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
