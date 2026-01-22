"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";
import { useDebounce } from "~/hooks/use-debounce";

export function AdvancedFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: tags } = api.tag.getAll.useQuery();
  const { data: genres } = api.tmdb.getGenres.useQuery();
  const { data: preferences } = api.userPreferences.getPreferences.useQuery();
  const updatePreferences = api.userPreferences.updatePreferences.useMutation();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    (searchParams.get("genres") ?? "")
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean),
  );
  const [releaseYearMin, setReleaseYearMin] = useState<string>(
    searchParams.get("releaseYearMin") ?? "",
  );
  const [releaseYearMax, setReleaseYearMax] = useState<string>(
    searchParams.get("releaseYearMax") ?? "",
  );
  const [ratingMin, setRatingMin] = useState<string>(
    searchParams.get("ratingMin") ?? "",
  );
  const [ratingMax, setRatingMax] = useState<string>(
    searchParams.get("ratingMax") ?? "",
  );
  const [runtimeMin, setRuntimeMin] = useState<string>(
    searchParams.get("runtimeMin") ?? "",
  );
  const [runtimeMax, setRuntimeMax] = useState<string>(
    searchParams.get("runtimeMax") ?? "",
  );
  const [isInWatchlist, setIsInWatchlist] = useState<string>(
    searchParams.get("isInWatchlist") ?? "all",
  );
  const [isFavorite, setIsFavorite] = useState<string>(
    searchParams.get("isFavorite") ?? "all",
  );
  const [sort, setSort] = useState<string>(
    searchParams.get("sort") ?? preferences?.movieSort ?? "created",
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    (searchParams.get("tags") ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  );

  const debouncedSearch = useDebounce(search, 500);

  const handleSortChange = (
    newSort:
      | "title"
      | "releaseYear"
      | "runtime"
      | "rating"
      | "created"
      | "watched",
  ) => {
    setSort(newSort);
    updatePreferences.mutate({ movieSort: newSort });
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedGenres.length > 0)
      params.set("genres", selectedGenres.join(","));
    if (releaseYearMin) params.set("releaseYearMin", releaseYearMin);
    if (releaseYearMax) params.set("releaseYearMax", releaseYearMax);
    if (ratingMin) params.set("ratingMin", ratingMin);
    if (ratingMax) params.set("ratingMax", ratingMax);
    if (runtimeMin) params.set("runtimeMin", runtimeMin);
    if (runtimeMax) params.set("runtimeMax", runtimeMax);
    if (isInWatchlist !== "all") params.set("isInWatchlist", isInWatchlist);
    if (isFavorite !== "all") params.set("isFavorite", isFavorite);
    if (sort && sort !== "created") params.set("sort", sort);
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));

    router.replace(`/movies?${params.toString()}`, { scroll: false });
  }, [
    debouncedSearch,
    selectedGenres,
    releaseYearMin,
    releaseYearMax,
    ratingMin,
    ratingMax,
    runtimeMin,
    runtimeMax,
    isInWatchlist,
    isFavorite,
    sort,
    selectedTags,
    router,
  ]);

  const clearFilters = () => {
    setSearch("");
    setSelectedGenres([]);
    setReleaseYearMin("");
    setReleaseYearMax("");
    setRatingMin("");
    setRatingMax("");
    setRuntimeMin("");
    setRuntimeMax("");
    setIsInWatchlist("all");
    setIsFavorite("all");
    setSelectedTags([]);
  };

  const hasActiveFilters =
    selectedGenres.length > 0 ||
    releaseYearMin ||
    releaseYearMax ||
    ratingMin ||
    ratingMax ||
    runtimeMin ||
    runtimeMax ||
    isInWatchlist !== "all" ||
    isFavorite !== "all" ||
    selectedTags.length > 0;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
        <Input
          type="text"
          placeholder="Search movies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          aria-label="Search movies by title"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={isInWatchlist} onValueChange={setIsInWatchlist}>
          <SelectTrigger className="w-35">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Movies</SelectItem>
            <SelectItem value="true">In Watchlist</SelectItem>
            <SelectItem value="false">Not in Watchlist</SelectItem>
          </SelectContent>
        </Select>

        <Select value={isFavorite} onValueChange={setIsFavorite}>
          <SelectTrigger className="w-35">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Movies</SelectItem>
            <SelectItem value="true">Favorites</SelectItem>
            <SelectItem value="false">Not Favorites</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">Recently Added</SelectItem>
            <SelectItem value="title">Title (A-Z)</SelectItem>
            <SelectItem value="watched">Recently Watched</SelectItem>
            <SelectItem value="releaseYear">Release Year</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="runtime">Runtime</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  Active
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Advanced Filters</Label>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="mr-1 h-3 w-3" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Genres */}
              {genres && genres.length > 0 && (
                <div>
                  <Label>Genres</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <Badge
                        key={genre.id}
                        variant={
                          selectedGenres.includes(genre.name)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedGenres((prev) =>
                            prev.includes(genre.name)
                              ? prev.filter((g) => g !== genre.name)
                              : [...prev, genre.name],
                          );
                        }}
                      >
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Release Year Range */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Release Year Min</Label>
                  <Input
                    type="number"
                    placeholder="1900"
                    value={releaseYearMin}
                    onChange={(e) => setReleaseYearMin(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Release Year Max</Label>
                  <Input
                    type="number"
                    placeholder="2024"
                    value={releaseYearMax}
                    onChange={(e) => setReleaseYearMax(e.target.value)}
                  />
                </div>
              </div>

              {/* Rating Range */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Rating Min</Label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.5"
                    placeholder="0"
                    value={ratingMin}
                    onChange={(e) => setRatingMin(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Rating Max</Label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.5"
                    placeholder="5"
                    value={ratingMax}
                    onChange={(e) => setRatingMax(e.target.value)}
                  />
                </div>
              </div>

              {/* Runtime Range */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Runtime Min (min)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={runtimeMin}
                    onChange={(e) => setRuntimeMin(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Runtime Max (min)</Label>
                  <Input
                    type="number"
                    placeholder="300"
                    value={runtimeMax}
                    onChange={(e) => setRuntimeMax(e.target.value)}
                  />
                </div>
              </div>

              {/* Tags */}
              {tags && tags.length > 0 && (
                <div>
                  <Label>Tags</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={
                          selectedTags.includes(tag.id) ? "default" : "outline"
                        }
                        className="cursor-pointer"
                        style={
                          tag.color && selectedTags.includes(tag.id)
                            ? {
                                backgroundColor: tag.color,
                                color: "white",
                              }
                            : tag.color
                              ? {
                                  borderColor: tag.color,
                                  color: tag.color,
                                }
                              : undefined
                        }
                        onClick={() => {
                          setSelectedTags((prev) =>
                            prev.includes(tag.id)
                              ? prev.filter((t) => t !== tag.id)
                              : [...prev, tag.id],
                          );
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
