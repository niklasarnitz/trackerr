"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Card, CardDescription, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Search,
  Plus,
  Calendar,
  BookOpen,
  ExternalLink,
  CheckCircle,
  ScanBarcode,
  PenLine,
} from "lucide-react";
import { useBookMutations } from "~/hooks/use-book-mutations";
import { useBookSearch } from "~/hooks/use-book-search";
import { OptimizedCoverImage } from "~/components/optimized-cover-image";
import Link from "next/link";
import { BarcodeScanner } from "~/components/barcode-scanner";
import { BookForm } from "~/components/book-form";

interface BookSearchDialogProps {
  readonly children: React.ReactNode;
}

export function BookSearchDialog({ children }: BookSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const router = useRouter();
  const { createBook } = useBookMutations();

  const {
    titleQuery,
    setTitleQuery,
    authorQuery,
    setAuthorQuery,
    searchResults,
    handleSearch,
    reset,
    getCoverUrl,
  } = useBookSearch({ enabled: open && !showManualForm, includedInLibrary: true });

  const handleAddBook = async (book: {
    id: string;
    title: string;
    subtitle: string | null;
    authors: Array<{ name: string; role: string | null }>;
    publisher: string | null;
    publishedYear: number | null;
    description: string | null;
    coverUrl: string | null;
    isbn: string | null;
    pages: number | null;
    inLibrary: boolean;
    bookId: string | null;
  }) => {
    await createBook.mutateAsync({
      title: book.title,
      subtitle: book.subtitle ?? undefined,
      authors:
        book.authors.length > 0
          ? book.authors.map((a) => ({
              name: a.name,
              role: a.role ?? undefined,
            }))
          : undefined,
      publisher: book.publisher ?? undefined,
      publishedYear: book.publishedYear ?? undefined,
      description: book.description ?? undefined,
      coverUrl: book.coverUrl ?? undefined,
      isbn: book.isbn ?? undefined,
      pages: book.pages ?? undefined,
    });
    void searchResults.refetch();
    router.refresh();
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset();
      setShowScanner(false);
      setShowManualForm(false);
    }
  };

  const handleScanComplete = (isbn: string) => {
    setTitleQuery(isbn);
    setShowScanner(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {showManualForm ? "Add Book Manually" : "Add Book to Library"}
            </DialogTitle>
            {!showManualForm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowManualForm(true)}
                className="gap-2"
              >
                <PenLine className="h-4 w-4" />
                Manual Entry
              </Button>
            )}
            {showManualForm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowManualForm(false)}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                Back to Search
              </Button>
            )}
          </div>
          <DialogDescription>
            {showManualForm
              ? "Enter book details manually."
              : "Search for books and add them to your library."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 flex-col overflow-hidden">
          {showManualForm ? (
            <div className="flex-1 overflow-y-auto p-1">
              <BookForm
                onSuccess={() => setOpen(false)}
                onCancel={() => setShowManualForm(false)}
              />
            </div>
          ) : (
            <div className="flex flex-1 flex-col space-y-4 overflow-hidden">
              <form onSubmit={handleSearch}>
                <div className="flex flex-col gap-2">
                  <div className="relative flex-1">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                    <Input
                      type="text"
                      placeholder="Search by title or ISBN..."
                      value={titleQuery}
                      onChange={(e) => setTitleQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Author (optional)"
                      value={authorQuery}
                      onChange={(e) => setAuthorQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowScanner(true)}
                      title="Scan Barcode"
                    >
                      <ScanBarcode className="h-4 w-4" />
                    </Button>
                    <Button type="submit" disabled={searchResults.isLoading}>
                      Search
                    </Button>
                  </div>
                </div>
              </form>

              {showScanner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                  <div className="w-full max-w-md rounded-lg bg-background p-1">
                    <BarcodeScanner
                      onScanComplete={handleScanComplete}
                      onClose={() => setShowScanner(false)}
                    />
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto">
                {searchResults.isLoading && (
                  <div className="py-8 text-center">
                    <p>Searching for books...</p>
                  </div>
                )}

                {searchResults.error && (
                  <div className="py-8 text-center">
                    <p className="text-destructive">
                      Error searching: {searchResults.error.message}
                    </p>
                  </div>
                )}

                {searchResults.data && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-sm">
                        {searchResults.data.totalItems} results found
                      </p>
                    </div>

                    <div className="grid gap-4">
                      {searchResults.data.results.map((book) => (
                        <Card key={book.id} className="overflow-hidden">
                          <div className="flex">
                            <div className="w-24 shrink-0">
                              <OptimizedCoverImage
                                src={book.coverUrl}
                                alt={book.title}
                                width={96}
                                height={144}
                                sizes="96px"
                                fallbackSrc="/placeholder-book.jpg"
                              />
                            </div>
                            <div className="flex-1 p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg">
                                    {book.title}
                                  </CardTitle>
                                  {book.subtitle && (
                                    <CardDescription className="mt-1">
                                      {book.subtitle}
                                    </CardDescription>
                                  )}
                                  <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-4 text-sm">
                                    {book.authors.length > 0 && (
                                      <div className="flex items-center gap-1">
                                        <BookOpen className="h-4 w-4" />
                                        {book.authors
                                          .map((a) => a.name)
                                          .join(", ")}
                                      </div>
                                    )}
                                    {book.publishedYear && (
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {book.publishedYear}
                                      </div>
                                    )}
                                    {book.pages && (
                                      <div className="text-xs">
                                        {book.pages} pages
                                      </div>
                                    )}
                                  </div>
                                  {book.publisher && (
                                    <p className="text-muted-foreground mt-1 text-xs">
                                      Publisher: {book.publisher}
                                    </p>
                                  )}
                                  {book.description && (
                                    <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                                      {book.description}
                                    </p>
                                  )}
                                  {book.isbn && (
                                    <p className="text-muted-foreground mt-1 text-xs">
                                      ISBN: {book.isbn}
                                    </p>
                                  )}
                                </div>
                                <div className="ml-4 flex flex-col items-end gap-2">
                                  {book.inLibrary ? (
                                    <>
                                      <Badge
                                        variant="secondary"
                                        className="flex items-center gap-1"
                                      >
                                        <CheckCircle className="h-3 w-3" />
                                        In Library
                                      </Badge>
                                      {book.bookId && (
                                        <Button
                                          size="sm"
                                          variant="default"
                                          asChild
                                        >
                                          <Link href={`/books/${book.bookId}`}>
                                            <ExternalLink className="mr-1 h-3 w-3" />
                                            Go to Book
                                          </Link>
                                        </Button>
                                      )}
                                    </>
                                  ) : (
                                    <Button
                                      size="sm"
                                      onClick={() => handleAddBook(book)}
                                      disabled={createBook.isPending}
                                    >
                                      <Plus className="mr-1 h-4 w-4" />
                                      Add Book
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="text-xs"
                                  >
                                    <a
                                      href={`https://books.google.com/books?id=${book.id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <ExternalLink className="mr-1 h-3 w-3" />
                                      Google Books
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {!titleQuery && (
                  <div className="text-muted-foreground py-8 text-center">
                    <Search className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>
                      Start typing to search for books to add to your library.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
