import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/server";
import { notFound } from "next/navigation";
import { BookQuotes } from "~/components/book-quotes";
import { EditBookButton } from "~/components/edit-book-button";
import { ReadingProgress } from "~/components/reading-progress";
import { MediaDetailHeader } from "~/components/media-detail-header";
import {
  MediaTitleSection,
  createMetadataBadges,
} from "~/components/media-title-section";
import { MediaDetailSection } from "~/components/media-detail-section";

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

  const badges = createMetadataBadges({
    year: book.publishedYear,
    pages: book.pages,
  });

  // Add status badge at the beginning
  badges.unshift({
    label: statusLabels[book.status],
    variant: "secondary",
  });

  // Add category badge
  if (book.category) {
    badges.push({
      label: book.category.name,
      variant: "outline",
    });
  }

  // Authors for subtitle
  const authorsText =
    book.bookAuthors.length > 0
      ? `by ${book.bookAuthors
          .map((ba) =>
            ba.role ? `${ba.author.name} (${ba.role})` : ba.author.name,
          )
          .join(", ")}`
      : undefined;

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

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* Cover */}
        <MediaDetailHeader
          type="book"
          posterPath={book.coverUrl}
          blurDataUrl={book.blurDataUrl}
          title={book.title}
          alt={book.title}
          book={book}
        />

        {/* Details */}
        <div className="space-y-6">
          <MediaTitleSection
            title={book.title}
            subtitle={book.subtitle ?? authorsText}
            badges={badges}
          />

          {/* Reading Progress */}
          {book.pages && (
            <div className="max-w-md">
              <ReadingProgress
                bookId={book.id}
                status={book.status}
                totalPages={book.pages}
                currentPage={readingProgress?.pagesRead ?? 0}
              />
            </div>
          )}

          {/* Metadata Grid */}
          <MediaDetailSection title="Details">
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              {book.pages && (
                <div>
                  <span className="text-muted-foreground block text-xs tracking-wider uppercase">
                    Pages
                  </span>
                  <span className="font-medium">{book.pages}</span>
                </div>
              )}
              {book.publishedYear && (
                <div>
                  <span className="text-muted-foreground block text-xs tracking-wider uppercase">
                    Published
                  </span>
                  <span className="font-medium">{book.publishedYear}</span>
                </div>
              )}
              {book.publisher && (
                <div>
                  <span className="text-muted-foreground block text-xs tracking-wider uppercase">
                    Publisher
                  </span>
                  <span className="font-medium">{book.publisher}</span>
                </div>
              )}
              {book.isbn && (
                <div>
                  <span className="text-muted-foreground block text-xs tracking-wider uppercase">
                    ISBN
                  </span>
                  <span className="font-medium">{book.isbn}</span>
                </div>
              )}
            </div>
          </MediaDetailSection>

          {book.description && (
            <MediaDetailSection title="Description">
              <p className="text-muted-foreground leading-relaxed">
                {book.description}
              </p>
            </MediaDetailSection>
          )}

          {book.abstract && (
            <MediaDetailSection title="Abstract">
              <p className="text-muted-foreground leading-relaxed">
                {book.abstract}
              </p>
            </MediaDetailSection>
          )}

          {book.notes && (
            <MediaDetailSection title="Notes">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {book.notes}
              </p>
            </MediaDetailSection>
          )}
        </div>
      </div>

      <div className="mt-8">
        <BookQuotes book={book} />
      </div>
    </div>
  );
}
