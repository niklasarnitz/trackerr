import Link from "next/link";
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "~/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasMore?: boolean;
  baseUrl: string;
  searchParams?: Record<string, string>;
  showInfo?: boolean;
  total?: number;
  pageSize?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  hasMore,
  baseUrl,
  searchParams = {},
  showInfo = true,
  total,
  pageSize = 20,
}: PaginationProps) {
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page > 1) {
      params.set("page", page.toString());
    } else {
      params.delete("page");
    }
    const queryString = params.toString();
    return `${baseUrl}${queryString ? `?${queryString}` : ""}`;
  };

  // Don't show pagination if there's only one page or no pages
  if (totalPages <= 1 && !hasMore) return null;

  const showPrevious = currentPage > 1;
  const showNext = hasMore ?? currentPage < totalPages;

  // Generate page numbers to show
  const generatePageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      // Calculate range around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      // Add ellipsis if there's a gap
      if (start > 2) {
        pages.push("ellipsis");
      }

      // Add pages around current page
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      // Add ellipsis if there's a gap
      if (end < totalPages - 1) {
        pages.push("ellipsis");
      }

      // Show last page if it's not already included
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      {showInfo && (
        <div className="text-muted-foreground text-sm">
          {total ? (
            <>
              Showing {Math.min((currentPage - 1) * pageSize + 1, total)} to{" "}
              {Math.min(currentPage * pageSize, total)} of {total} results
            </>
          ) : (
            <>
              Page {currentPage} {totalPages > 0 && `of ${totalPages}`}
            </>
          )}
        </div>
      )}

      <ShadcnPagination>
        <PaginationContent>
          <PaginationItem>
            {showPrevious ? (
              <Link
                href={createPageUrl(currentPage - 1)}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "default" }),
                  "gap-1 px-2.5 sm:pl-2.5",
                )}
                aria-label="Go to previous page"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:block">Previous</span>
              </Link>
            ) : (
              <span
                className={cn(
                  buttonVariants({ variant: "ghost", size: "default" }),
                  "pointer-events-none gap-1 px-2.5 opacity-50 sm:pl-2.5",
                )}
                aria-label="Go to previous page"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:block">Previous</span>
              </span>
            )}
          </PaginationItem>

          {pageNumbers.map((page, index) => (
            <PaginationItem key={index}>
              {page === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <Link
                  href={createPageUrl(page)}
                  className={cn(
                    buttonVariants({
                      variant: page === currentPage ? "outline" : "ghost",
                      size: "icon",
                    }),
                  )}
                  aria-current={page === currentPage ? "page" : undefined}
                >
                  {page}
                </Link>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            {showNext ? (
              <Link
                href={createPageUrl(currentPage + 1)}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "default" }),
                  "gap-1 px-2.5 sm:pr-2.5",
                )}
                aria-label="Go to next page"
              >
                <span className="hidden sm:block">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span
                className={cn(
                  buttonVariants({ variant: "ghost", size: "default" }),
                  "pointer-events-none gap-1 px-2.5 opacity-50 sm:pr-2.5",
                )}
                aria-label="Go to next page"
              >
                <span className="hidden sm:block">Next</span>
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </PaginationItem>
        </PaginationContent>
      </ShadcnPagination>
    </div>
  );
}
