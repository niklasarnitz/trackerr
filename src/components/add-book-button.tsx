"use client";

import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { BookSearchDialog } from "~/components/book-search-dialog";

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
