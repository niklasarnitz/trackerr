"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { OptimizedCoverImage } from "~/components/optimized-cover-image";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import type { RouterOutputs } from "~/trpc/react";
import { useState } from "react";

type Book = RouterOutputs["book"]["getAll"]["books"][number];

interface BookCardProps {
  book: Book;
  onBookUpdated?: () => void;
}

const statusColors = {
  UNREAD: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
  READING: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  READ: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
};

const statusLabels = {
  UNREAD: "Unread",
  READING: "Reading",
  READ: "Read",
};

export function BookCard({ book, onBookUpdated }: BookCardProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteBook = api.book.delete.useMutation({
    onSuccess: async () => {
      toast.success("Book successfully removed from your library");
      await utils.book.getAll.invalidate();
      onBookUpdated?.();
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Unable to delete book. Please try again.");
    },
  });

  const handleDelete = () => {
    deleteBook.mutate({ id: book.id });
    setShowDeleteDialog(false);
  };

  const readingProgress = book.readingProgress?.[0];
  const progressPercentage = readingProgress?.pagesRead
    ? Math.round((readingProgress.pagesRead / (book.pages ?? 1)) * 100)
    : 0;

  return (
    <>
      <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-md">
        <div className="bg-muted relative aspect-2/3 overflow-hidden">
          <OptimizedCoverImage
            src={book.coverUrl}
            alt={book.title}
            blurDataUrl={book.blurDataUrl}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            fallbackSrc="/placeholder-book.jpg"
          />
        </div>

        <CardHeader className="pb-3">
          <div className="space-y-2">
            <Link href={`/books/${book.id}`}>
              <CardTitle className="line-clamp-2 hover:underline">
                {book.title}
              </CardTitle>
            </Link>
            {book.subtitle && (
              <CardDescription className="line-clamp-1">
                {book.subtitle}
              </CardDescription>
            )}

            {book.bookAuthors.length > 0 && (
              <p className="text-muted-foreground text-sm">
                {book.bookAuthors.map((ba) => ba.author.name).join(", ")}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col justify-between space-y-3">
          <div className="space-y-2">
            {book.category && (
              <Badge variant="outline" className="text-xs">
                {book.category.name}
              </Badge>
            )}

            <Badge className="text-xs" variant="secondary">
              {statusLabels[book.status]}
            </Badge>

            {book.pages && readingProgress && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {readingProgress.pagesRead}/{book.pages}
                  </span>
                  <span className="text-muted-foreground">
                    {progressPercentage}%
                  </span>
                </div>
                <div className="bg-muted h-1.5 w-full rounded-full">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href={`/books/${book.id}`}>View</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleteBook.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{book.title}"? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
