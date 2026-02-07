import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/server";
import { notFound } from "next/navigation";
import { BookQuotes } from "~/components/book-quotes";
import { EditBookButton } from "~/components/edit-book-button";
import {
  MediaTitleSection,
  createMetadataBadges,
} from "~/components/media-title-section";
import { BookDetailHeader } from "~/components/book-detail-header";
import { BookDetailCover } from "~/components/book-detail-cover";
import { BookDetailDescription } from "~/components/book-detail-description";

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
      <BookDetailHeader book={book} />
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <BookDetailCover book={book} />
        <BookDetailDescription
          book={book}
          badges={badges}
          authorsText={authorsText}
          readingProgress={readingProgress}
        />
      </div>
      <div className="mt-8">
        <BookQuotes book={book} />
      </div>
    </div>
  );
}
