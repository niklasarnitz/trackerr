"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Loader2, Trash2, Heart, Bookmark } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { OptimizedCoverImage } from "~/components/optimized-cover-image";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import type { RouterOutputs } from "~/trpc/react";
import { useState } from "react";

type Book = RouterOutputs["book"]["getAll"]["books"][number];

interface BookCardProps {
  book: Book;
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

export function BookCard({ book }: BookCardProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteBook = api.book.delete.useMutation({
    onSuccess: async () => {
      toast.success("Book successfully removed from your library");
      await utils.book.getAll.invalidate();
      router.refresh();
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || "Unable to delete book. Please try again.");
    },
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    deleteBook.mutate({ id: book.id });
  };

  const updateBook = api.book.update.useMutation({
    onSuccess: async () => {
      toast.success("Book updated successfully");
      await utils.book.getAll.invalidate();
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Unable to update book.");
    },
  });

  const toggleWishlist = () => {
    updateBook.mutate({
      id: book.id,
      isOnWishlist: !book.isOnWishlist,
    });
  };

  const toggleFavorite = api.book.toggleFavorite.useMutation({
    onSuccess: async () => {
      await utils.book.getAll.invalidate();
      router.refresh();
    },
  });

  const readingProgress = book.readingProgress?.[0];
  const progressPercentage = readingProgress?.pagesRead
    ? Math.round((readingProgress.pagesRead / (book.pages ?? 1)) * 100)
    : 0;

  return (
    <>
      <Card className="group relative overflow-hidden transition-shadow hover:shadow-lg">
        <Link href={`/books/${book.id}`}>
          <div className="relative aspect-2/3 overflow-hidden">
            <OptimizedCoverImage
              src={book.coverUrl}
              alt={book.title}
              blurDataUrl={book.blurDataUrl}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              fallbackSrc="/placeholder-book.jpg"
              book={book}
            />

            {/* Quick action buttons overlay */}
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant={book.isOnWishlist ? "default" : "secondary"}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleWishlist();
                    }}
                    disabled={updateBook.isPending}
                    className="h-8 w-8"
                    aria-label={
                      book.isOnWishlist
                        ? "Remove from library"
                        : "Add to library"
                    }
                  >
                    <Bookmark
                      className={`h-4 w-4 ${book.isOnWishlist ? "fill-current" : ""}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {book.isOnWishlist
                      ? "Remove from library"
                      : "Add to library"}
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant={book.isFavorite ? "default" : "secondary"}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite.mutate({ id: book.id });
                    }}
                    disabled={toggleFavorite.isPending}
                    className="h-8 w-8"
                    aria-label={
                      book.isFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    <Heart
                      className={`h-4 w-4 ${book.isFavorite ? "fill-current" : ""}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {book.isFavorite
                      ? "Remove from favorites"
                      : "Add to favorites"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </Link>

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
                <div
                  className="bg-muted h-1.5 w-full rounded-full"
                  role="progressbar"
                  aria-valuenow={progressPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Reading progress: ${progressPercentage}%`}
                >
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
            {book.isOnWishlist ? (
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={toggleWishlist}
                disabled={updateBook.isPending}
              >
                {updateBook.isPending && (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                )}
                Add to Library
              </Button>
            ) : null}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deleteBook.isPending}
                  aria-label="Delete book"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Book</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{book.title}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel disabled={deleteBook.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteBook.isPending}
            >
              {deleteBook.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
