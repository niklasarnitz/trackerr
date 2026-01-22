"use client";

import { useState, useEffect } from "react";
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
import { useDebounce } from "~/hooks/use-debounce";
import { useMovieSortPreference } from "~/hooks/use-movie-sort-preference";

interface MoviesSearchFiltersProps {
  readonly baseUrl?: string;
}

export function MoviesSearchFilters({
  baseUrl = "/movies",
}: MoviesSearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sortBy, setSortBy } = useMovieSortPreference();

  const initialSearch = searchParams.get("search") ?? "";

  const [searchInput, setSearchInput] = useState(initialSearch);

  const debouncedSearchQuery = useDebounce(searchInput, 500);

  // Update URL when search or sort changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchQuery) {
      params.set("search", debouncedSearchQuery);
    }
    if (sortBy !== "created") {
      params.set("sort", sortBy);
    }

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`${baseUrl}${newUrl}`, { scroll: false });
  }, [debouncedSearchQuery, sortBy, baseUrl, router]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
        <Input
          type="text"
          placeholder="Search movies..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10"
          aria-label="Search movies by title"
        />
      </div>

      <div className="flex w-full flex-wrap gap-2 sm:flex-nowrap">
        <Select
          value={sortBy}
          onValueChange={(value: "title" | "created" | "watched") =>
            setSortBy(value)
          }
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Title (A-Z)</SelectItem>
            <SelectItem value="created">Recently Added</SelectItem>
            <SelectItem value="watched">Recently Watched</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
