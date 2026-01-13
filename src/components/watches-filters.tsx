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
import { useDebounce } from "~/hooks/use-movie-filtering";

export function WatchesFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") ?? "";
  const initialRating = searchParams.get("rating") ?? "all";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [filterRating, setFilterRating] = useState(initialRating);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchQuery) params.set("search", debouncedSearchQuery);
    if (filterRating !== "all") params.set("rating", filterRating);

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/watches${newUrl}`, { scroll: false });
  }, [debouncedSearchQuery, filterRating, router]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
        <Input
          type="text"
          placeholder="Search watches..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={filterRating} onValueChange={setFilterRating}>
        <SelectTrigger className="w-full sm:w-50">
          <SelectValue placeholder="Filter by rating" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Ratings</SelectItem>
          <SelectItem value="5">5 Stars</SelectItem>
          <SelectItem value="4">4+ Stars</SelectItem>
          <SelectItem value="3">3+ Stars</SelectItem>
          <SelectItem value="2">2+ Stars</SelectItem>
          <SelectItem value="1">1+ Stars</SelectItem>
          <SelectItem value="unrated">Unrated</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
