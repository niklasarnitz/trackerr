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
  const progressPercentage = readingProgress?.pagesRead
    ? Math.round((readingProgress.pagesRead / (book.pages ?? 1)) * 100)
    : 0;

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
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
              <div className="relative aspect-2/3 overflow-hidden rounded-lg">
                <OptimizedCoverImage
                  src={book.coverUrl}
                  alt={book.title}
                  blurDataUrl={book.blurDataUrl}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority
                  fallbackSrc="/placeholder-book.jpg"
                  book={book}
                />
              </div>
              <div className="mt-4">
                <ReadingProgress
                  bookId={book.id}
                  status={book.status}
                  totalPages={book.pages ?? null}
                  currentPage={readingProgress?.pagesRead ?? 0}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">{book.title}</h1>
                  {book.subtitle && (
                    <p className="text-muted-foreground mt-1 text-lg">
                      {book.subtitle}
                    </p>
                  )}
                </div>

                {book.bookAuthors.length > 0 && (
                  <div>
                    <h3 className="mb-1 text-sm font-semibold">Authors</h3>
                    <p className="text-muted-foreground text-sm">
                      {book.bookAuthors
                        .map((ba) =>
                          ba.role
                            ? `${ba.author.name} (${ba.role})`
                            : ba.author.name,
                        )
                        .join(", ")}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{statusLabels[book.status]}</Badge>
                  {book.category && (
                    <Badge variant="outline">{book.category.name}</Badge>
                  )}
                </div>

                {book.pages && (
                  <div className="text-sm">
                    <h3 className="mb-2 font-semibold">Pages: {book.pages}</h3>
                    {readingProgress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {readingProgress.pagesRead}/{book.pages}
                          </span>
                          <span className="text-muted-foreground">
                            {progressPercentage}%
                          </span>
                        </div>
                        <div className="bg-muted h-2 w-full rounded-full">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {book.publishedYear && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">
                      Published: {book.publishedYear}
                    </span>
                  </div>
                )}

                {book.publisher && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">
                      Publisher: {book.publisher}
                    </span>
                  </div>
                )}

                {book.isbn && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">
                      ISBN: {book.isbn}
                    </span>
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
