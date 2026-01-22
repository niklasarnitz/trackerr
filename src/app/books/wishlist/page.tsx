import { BooksGrid } from "~/components/books-grid";
import { BooksSearchFilters } from "~/components/books-search-filters";

interface BookWishlistPageProps {
  readonly searchParams: Promise<{
    search?: string;
    sort?: "title" | "created" | "updated";
    page?: string;
    status?: "UNREAD" | "READING" | "READ";
  }>;
}

export const metadata = {
  title: "Book Wishlist | Trackerr",
  description: "Your book wishlist",
};

export default async function BookWishlistPage({
  searchParams,
}: BookWishlistPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const sort = (params.sort ?? "created") as "title" | "created" | "updated";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="mb-4 text-2xl font-bold">Book Wishlist</h1>
        <BooksSearchFilters />
      </div>
      <BooksGrid
        search={params.search}
        sort={sort}
        page={page}
        status={params.status}
        isOnWishlist={true}
        baseUrl="/books/wishlist"
      />
    </div>
  );
}
