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

export function BooksAdvancedFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: categories } = api.bookCategory.getAll.useQuery();
  const { data: tags } = api.tag.getAll.useQuery();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [status, setStatus] = useState<string>(
    searchParams.get("status") ?? "all",
  );
  const [sort, setSort] = useState<string>(searchParams.get("sort") ?? "title");
  const [categoryId, setCategoryId] = useState<string>(
    searchParams.get("categoryId") ?? "all",
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    (searchParams.get("tags") ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  );

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (status && status !== "all") params.set("status", status);
    if (sort && sort !== "title") params.set("sort", sort);
    if (categoryId && categoryId !== "all") params.set("categoryId", categoryId);
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));

    router.replace(`/books?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, status, sort, categoryId, selectedTags, router]);

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setSort("title");
    setCategoryId("all");
    setSelectedTags([]);
  };

  const hasActiveFilters =
    status !== "all" || categoryId !== "all" || selectedTags.length > 0;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
        <Input
          type="text"
          placeholder="Search books by title, author, or ISBN"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          aria-label="Search books"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="UNREAD">Unread</SelectItem>
            <SelectItem value="READING">Reading</SelectItem>
            <SelectItem value="READ">Read</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Title (A-Z)</SelectItem>
            <SelectItem value="created">Recently Added</SelectItem>
            <SelectItem value="updated">Recently Updated</SelectItem>
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
                <Label>Filters</Label>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="mr-1 h-3 w-3" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Categories */}
              {categories && categories.length > 0 && (
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
