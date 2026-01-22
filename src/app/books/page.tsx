import Link from "next/link";
import { BooksGrid } from "~/components/books-grid";
import { BooksSearchFilters } from "~/components/books-search-filters";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { api } from "~/trpc/server";

interface BooksPageProps {
  readonly searchParams: Promise<{
    search?: string;
    sort?: "title" | "created" | "updated";
    page?: string;
    status?: "UNREAD" | "READING" | "READ";
  }>;
}

export const metadata = {
  title: "Books | Trackerr",
  description: "Manage your book collection",
};

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const sort = (params.sort ?? "created") as "title" | "created" | "updated";

  const currentlyReading = await api.book.getAll({
    status: "READING",
    sort: "updated",
    skip: 0,
    limit: 8,
  });

  const getLatestPages = (
    readingProgress: { pagesRead: number }[] | undefined,
  ) => {
    if (!readingProgress || readingProgress.length === 0) return 0;
    return readingProgress.reduce(
      (max, entry) => (entry.pagesRead > max ? entry.pagesRead : max),
      0,
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {currentlyReading.books.length > 0 && (
        <div className="mb-10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Currently Reading</h2>
            <p className="text-muted-foreground text-sm">
              {currentlyReading.total} in progress
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {currentlyReading.books.map((book) => {
              const latestPages = getLatestPages(book.readingProgress);
              const hasTotal = typeof book.pages === "number" && book.pages > 0;
              const progressPct = hasTotal
                ? Math.min(
                    100,
                    Math.round((latestPages / (book?.pages ?? 0)) * 100),
                  )
                : 0;

              const authors =
                book.bookAuthors?.map((ba) => ba.author.name).join(", ") ?? "";

              return (
                <div
                  key={book.id}
                  className="space-y-3 rounded-lg border p-4 shadow-sm"
                >
                  <div className="space-y-1">
                    <h3 className="line-clamp-2 font-semibold">{book.title}</h3>
                    {book.subtitle && (
                      <p className="text-muted-foreground line-clamp-1 text-sm">
                        {book.subtitle}
                      </p>
                    )}
                    {authors && (
                      <p className="text-muted-foreground line-clamp-1 text-xs">
                        {authors}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Progress value={hasTotal ? progressPct : 0} />
                    <p className="text-muted-foreground text-xs">
                      {hasTotal
                        ? `${latestPages}/${book.pages} pages (${progressPct}%)`
                        : `${latestPages} pages logged`}
                    </p>
                  </div>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Link href={`/books/${book.id}`}>Open</Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-6">
        <BooksSearchFilters />
      </div>
      <BooksGrid
        search={params.search}
        sort={sort}
        page={page}
        status={params.status}
      />
    </div>
  );
}
