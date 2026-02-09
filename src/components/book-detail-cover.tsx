import { MediaDetailHeader } from "~/components/media-detail-header";
import type { RouterOutputs } from "~/trpc/react";

interface BookDetailCoverProps {
  book: RouterOutputs["book"]["getById"];
}

export function BookDetailCover({ book }: BookDetailCoverProps) {
  return (
    <MediaDetailHeader
      type="book"
      posterPath={book.coverUrl}
      blurDataUrl={book.blurDataUrl}
      title={book.title}
      alt={book.title}
      book={book}
    />
  );
}
