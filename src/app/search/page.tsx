import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Film, Tv, Book } from "lucide-react";
import { api } from "~/trpc/server";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function SearchResults({ query }: { query: string }) {
  if (!query || query.trim().length === 0) {
    return (
      <div className="space-y-8">
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Enter a search query to begin</p>
        </div>
      </div>
    );
  }

  const results = await api.search.searchMovies({
    query,
    limit: 100,
  });

  const tvResults = await api.search.searchTVShows({
    query,
    limit: 100,
  });

  const bookResults = await api.search.searchBooks({
    query,
    limit: 100,
  });

  if (!results.total && !tvResults.total && !bookResults.total) {
    return (
      <div className="space-y-8">
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            No results found for "{query}"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Movies */}
      {results.total > 0 && (
        <section>
          <div className="mb-6 flex items-center space-x-2">
            <Film className="h-5 w-5" />
            <h2 className="text-2xl font-bold">
              Movies ({results.total})
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.items.map((movie) => (
              <Link
                key={movie.id}
                href={`/movies/${movie.id}`}
                className="group overflow-hidden rounded-lg border transition-colors hover:border-primary"
              >
                <div className="aspect-video overflow-hidden bg-muted">
                  {movie.posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${movie.posterPath}`}
                      alt={movie.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Film className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold line-clamp-2">{movie.title}</h3>
                  {movie.genres && movie.genres.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {movie.genres.join(", ")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* TV Shows */}
      {tvResults.total > 0 && (
        <section>
          <div className="mb-6 flex items-center space-x-2">
            <Tv className="h-5 w-5" />
            <h2 className="text-2xl font-bold">
              TV Shows ({tvResults.total})
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tvResults.items.map((show) => (
              <Link
                key={show.id}
                href={`/tv-shows/${show.id}`}
                className="group overflow-hidden rounded-lg border transition-colors hover:border-primary"
              >
                <div className="aspect-video overflow-hidden bg-muted">
                  {show.posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${show.posterPath}`}
                      alt={show.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Tv className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold line-clamp-2">{show.title}</h3>
                  {show.genres && show.genres.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {show.genres.join(", ")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Books */}
      {bookResults.total > 0 && (
        <section>
          <div className="mb-6 flex items-center space-x-2">
            <Book className="h-5 w-5" />
            <h2 className="text-2xl font-bold">
              Books ({bookResults.total})
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {bookResults.items.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="group overflow-hidden rounded-lg border transition-colors hover:border-primary"
              >
                <div className="aspect-[2/3] overflow-hidden bg-muted">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Book className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold line-clamp-2">{book.title}</h3>
                  {book.authors && book.authors.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {book.authors.join(", ")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-12">
      {[1, 2, 3].map((i) => (
        <section key={i}>
          <div className="mb-6 h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="space-y-2">
                <div className="aspect-video animate-pulse rounded-lg bg-muted" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q ? decodeURIComponent(params.q) : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Search Results</h1>
        {query && (
          <p className="mt-2 text-muted-foreground">
            Showing results for "{query}"
          </p>
        )}
      </div>

      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults query={query} />
      </Suspense>
    </div>
  );
}
