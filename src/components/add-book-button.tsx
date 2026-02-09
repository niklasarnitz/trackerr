"use client";

import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";

interface AddBookButtonProps {
  readonly variant?:
    | "default"
    | "outline"
    | "ghost"
    | "link"
    | "destructive"
    | "secondary";
  readonly size?: "default" | "sm" | "lg" | "icon";
  readonly children?: React.ReactNode;
  readonly className?: string;
}

const BookSearchDialog = dynamic(
  () =>
    import("~/components/book-search-dialog").then(
      (mod) => mod.BookSearchDialog,
    ),
  { ssr: false },
);

export function AddBookButton({
  variant = "default",
  size = "lg",
  children,
  className = "gap-2",
}: AddBookButtonProps) {
  return (
    <BookSearchDialog>
      <Button
        variant={variant}
        size={size}
        className={className}
        aria-label="Add new book to collection"
      >
        {children ?? (
          <>
            <Plus className="h-4 w-4" />
            Add Book
          </>
        )}
      </Button>
    </BookSearchDialog>
  );
}
