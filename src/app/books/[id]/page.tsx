import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { OptimizedCoverImage } from "~/components/optimized-cover-image";
import { api } from "~/trpc/server";
import { notFound } from "next/navigation";

import { BookQuotes } from "~/components/book-quotes";
import { EditBookButton } from "~/components/edit-book-button";
import { ReadingProgress } from "~/components/reading-progress";

interface BookDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BookDetailPageProps) {
  const { id } = await params;
  const book = await api.book.getById({ id });

  if (!book) {
    return { title: "Book Not Found" };
  }

  return {
    title: `${book.title} | Trackerr`,
    description: book.description || `${book.title} - Trackerr Book Tracker`,
  };
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { id } = await params;

  const book = await api.book.getById({ id });

  if (!book) {
    notFound();
  }

  const statusLabels = {
    UNREAD: "Not started",
    READING: "Currently reading",
    READ: "Finished",
  };

  const readingProgress = book.readingProgress?.[0];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Actions */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/books">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Books
          </Button>
        </Link>
        <EditBookButton book={book} />
      </div>

      {/* Book Details */}
      <Card>
        <CardHeader className="pb-6">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="mx-auto w-full max-w-[240px] md:mx-0 md:w-[200px] flex-shrink-0">
              <div className="relative aspect-2/3 overflow-hidden rounded-lg shadow-md">
                <OptimizedCoverImage
                  src={book.coverUrl}
                  alt={book.title}
                  blurDataUrl={book.blurDataUrl}
                  fill
                  sizes="(max-width: 768px) 100vw, 200px"
                  priority
                  fallbackSrc="/placeholder-book.jpg"
                  book={book}
                />
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold leading-tight">{book.title}</h1>
                {book.subtitle && (
                  <p className="text-muted-foreground text-lg">
                    {book.subtitle}
                  </p>
                )}
                {book.bookAuthors.length > 0 && (
                  <p className="text-muted-foreground text-lg">
                    by{" "}
                    <span className="font-medium text-foreground">
                      {book.bookAuthors
                        .map((ba) =>
                          ba.role
                            ? `${ba.author.name} (${ba.role})`
                            : ba.author.name,
                        )
                        .join(", ")}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className="text-sm px-3 py-1">{statusLabels[book.status]}</Badge>
                {book.category && (
                  <Badge variant="outline" className="text-sm px-3 py-1">{book.category.name}</Badge>
                )}
              </div>

              <div className="max-w-md">
                <ReadingProgress
                    bookId={book.id}
                    status={book.status}
                    totalPages={book.pages ?? null}
                    currentPage={readingProgress?.pagesRead ?? 0}
                  />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                {book.pages && (
                  <div>
                    <span className="block text-muted-foreground text-xs uppercase tracking-wider">Pages</span>
                    <span className="font-medium">{book.pages}</span>
                  </div>
                )}
                 {book.publishedYear && (
                  <div>
                    <span className="block text-muted-foreground text-xs uppercase tracking-wider">Published</span>
                    <span className="font-medium">{book.publishedYear}</span>
                  </div>
                )}
                 {book.publisher && (
                  <div>
                    <span className="block text-muted-foreground text-xs uppercase tracking-wider">Publisher</span>
                    <span className="font-medium">{book.publisher}</span>
                  </div>
                )}
                 {book.isbn && (
                  <div>
                    <span className="block text-muted-foreground text-xs uppercase tracking-wider">ISBN</span>
                    <span className="font-medium">{book.isbn}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        {book.description && (
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 text-lg font-semibold">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {book.description}
              </p>
            </div>
          </CardContent>
        )}

        {book.abstract && (
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 text-lg font-semibold">Abstract</h3>
              <p className="text-muted-foreground leading-relaxed">
                {book.abstract}
              </p>
            </div>
          </CardContent>
        )}

        {book.notes && (
          <CardContent>
            <div>
              <h3 className="mb-2 text-lg font-semibold">Notes</h3>
              <p className="text-muted-foreground leading-relaxed">
                {book.notes}
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      <BookQuotes book={book} />
    </div>
  );
}
