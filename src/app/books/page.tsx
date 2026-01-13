import { BooksGrid } from "~/components/books-grid";

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

  return (
    <div className="container mx-auto px-4 py-8">
      <BooksGrid
        search={params.search}
        sort={sort}
        page={page}
        status={params.status}
      />
    </div>
  );
}
