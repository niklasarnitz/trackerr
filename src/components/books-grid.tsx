import { ErrorDisplay } from "~/components/error-display";
import { Pagination } from "~/components/pagination";
import { api } from "~/trpc/server";
import { BookOpen } from "lucide-react";
import { AddBookButton } from "./add-book-button";
import { BookCard } from "./book-card";

type BookSort = "title" | "created" | "updated";

interface BooksGridProps {
  readonly search?: string;
  readonly sort?: BookSort;
  readonly page?: number;
  readonly status?: "UNREAD" | "READING" | "READ";
  readonly categoryId?: string;
  readonly tagIds?: string[];
  readonly baseUrl?: string;
}

export async function BooksGrid({
  search,
  sort = "created",
  page = 1,
  status,
  categoryId,
  tagIds = [],
  baseUrl = "/books",
}: BooksGridProps) {
  try {
    const limit = 20;
    const skip = (page - 1) * limit;

    const result = await api.book.getAll({
      search,
      sort: sort as "title" | "created" | "updated",
      skip,
      limit,
      status,
      categoryId,
      tagIds: tagIds.length > 0 ? tagIds : undefined,
    });

    const hasMore = result.hasMore;
    const totalPages = Math.ceil(result.total / limit);
    const currentPage = page;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Books</h1>
          </div>
          <AddBookButton />
        </div>

        {result.books.length === 0 ? (
          <ErrorDisplay
            title="No books found"
            message="Start building your book library by adding your first book."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {result.books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl={baseUrl}
            />
          </>
        )}
      </div>
    );
  } catch (error) {
    return (
      <ErrorDisplay
        title="Error loading books"
        message="Failed to load your books. Please try again later."
      />
    );
  }
}
