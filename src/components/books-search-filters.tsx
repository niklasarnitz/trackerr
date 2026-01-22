"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useDebounce } from "~/hooks/use-movie-filtering";

const sortOptions = ["title", "created", "updated"] as const;
type BookSort = (typeof sortOptions)[number];
type BookStatus = "UNREAD" | "READING" | "READ";
type BookStatusFilter = BookStatus | "all";

interface BooksSearchFiltersProps {
  readonly baseUrl?: string;
}

export function BooksSearchFilters({
  baseUrl = "/books",
}: BooksSearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") ?? "";
  const initialSortCandidate =
    (searchParams.get("sort") as BookSort | null) ?? "created";
  const initialSort = sortOptions.includes(initialSortCandidate)
    ? initialSortCandidate
    : "created";
  const initialStatus = searchParams.get("status") as BookStatus | null;

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<BookSort>(initialSort);
  const [status, setStatus] = useState<BookStatusFilter>(
    initialStatus === "UNREAD" ||
      initialStatus === "READING" ||
      initialStatus === "READ"
      ? initialStatus
      : "all",
  );

  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
    }

    if (sortBy !== "created") {
      params.set("sort", sortBy);
    }

    if (status !== "all") {
      params.set("status", status);
    }

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`${baseUrl}${newUrl}`, { scroll: false });
  }, [debouncedSearch, sortBy, status, router, baseUrl]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
        <Input
          type="text"
          placeholder="Search books by title, author, or ISBN"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10"
          aria-label="Search books"
        />
      </div>

      <div className="flex w-full flex-wrap gap-2 sm:flex-nowrap">
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as BookStatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="UNREAD">Unread</SelectItem>
            <SelectItem value="READING">Reading</SelectItem>
            <SelectItem value="READ">Read</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as BookSort)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Title (A-Z)</SelectItem>
            <SelectItem value="created">Recently Added</SelectItem>
            <SelectItem value="updated">Recently Updated</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
