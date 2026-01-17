"use client";

import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";

const BookSearchDialog = dynamic(
  () =>
    import("~/components/book-search-dialog").then(
      (mod) => mod.BookSearchDialog,
    ),
  { ssr: false },
);

export function AddBookButton() {
  return (
    <BookSearchDialog>
      <Button size="lg" className="gap-2">
        <Plus className="h-4 w-4" />
        Add Book
      </Button>
    </BookSearchDialog>
  );
}
