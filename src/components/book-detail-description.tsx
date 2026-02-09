import {
  MediaTitleSection,
  type MetadataBadge,
} from "~/components/media-title-section";
import { ReadingProgress } from "~/components/reading-progress";
import { MediaDetailSection } from "~/components/media-detail-section";
import { BookDetailMetadata } from "~/components/book-detail-metadata";
import type { RouterOutputs } from "~/trpc/react";

interface BookDetailDescriptionProps {
  book: RouterOutputs["book"]["getById"];
  badges: MetadataBadge[];
  authorsText?: string;
  readingProgress?: RouterOutputs["book"]["getById"]["readingProgress"][0];
}

export function BookDetailDescription({
  book,
  badges,
  authorsText,
  readingProgress,
}: BookDetailDescriptionProps) {
  return (
    <div className="space-y-6">
      <MediaTitleSection
        title={book.title}
        subtitle={book.subtitle ?? authorsText}
        badges={badges}
      />

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

      <BookDetailMetadata book={book} />

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
  );
}
