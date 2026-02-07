import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { Film, Tv, Book } from "lucide-react";
import { api } from "~/trpc/server";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function SearchResults({ query }: { query: string }) {
  if (!query || query.trim().length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">Enter a search query to begin</p>
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
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          No results found for &quot;{query}&quot;
        </p>
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
            <h2 className="text-2xl font-bold">Movies ({results.total})</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.items.map((movie) => (
              <Link
                key={movie.id}
                href={`/movies/${movie.id}`}
                className="group hover:border-primary overflow-hidden rounded-lg border transition-colors"
              >
                <div className="bg-muted aspect-video overflow-hidden">
                  {movie.posterPath ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w300${movie.posterPath}`}
                      alt={movie.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Film className="text-muted-foreground h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 font-semibold">{movie.title}</h3>
                  {movie.genres && movie.genres.length > 0 && (
                    <p className="text-muted-foreground mt-2 text-xs">
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
            <h2 className="text-2xl font-bold">TV Shows ({tvResults.total})</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tvResults.items.map((show) => (
              <Link
                key={show.id}
                href={`/tv-shows/${show.id}`}
                className="group hover:border-primary overflow-hidden rounded-lg border transition-colors"
              >
                <div className="bg-muted aspect-video overflow-hidden">
                  {show.posterPath ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w300${show.posterPath}`}
                      alt={show.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Tv className="text-muted-foreground h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 font-semibold">{show.title}</h3>
                  {show.genres && show.genres.length > 0 && (
                    <p className="text-muted-foreground mt-2 text-xs">
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
            <h2 className="text-2xl font-bold">Books ({bookResults.total})</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {bookResults.items.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="group hover:border-primary overflow-hidden rounded-lg border transition-colors"
              >
                <div className="bg-muted aspect-[2/3] overflow-hidden">
                  {book.coverImage ? (
                    <Image
                      src={book.coverImage}
                      alt={book.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Book className="text-muted-foreground h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 font-semibold">{book.title}</h3>
                  {book.authors && book.authors.length > 0 && (
                    <p className="text-muted-foreground mt-2 text-xs">
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
          <div className="bg-muted mb-6 h-8 w-48 animate-pulse rounded" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="space-y-2">
                <div className="bg-muted aspect-video animate-pulse rounded-lg" />
                <div className="bg-muted h-4 w-32 animate-pulse rounded" />
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
          <p className="text-muted-foreground mt-2">
            Showing results for &quot;{query}&quot;
          </p>
        )}
      </div>

      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults query={query} />
      </Suspense>
    </div>
  );
}
