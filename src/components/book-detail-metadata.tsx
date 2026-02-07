import { MediaDetailSection } from "~/components/media-detail-section";
import type { RouterOutputs } from "~/trpc/react";

interface BookDetailMetadataProps {
  book: RouterOutputs["book"]["getById"];
}

export function BookDetailMetadata({ book }: BookDetailMetadataProps) {
  return (
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
  );
}
