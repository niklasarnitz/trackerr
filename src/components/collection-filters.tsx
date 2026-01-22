"use client";

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
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useDebounce } from "~/hooks/use-debounce";
import { useCollectionFilters } from "~/hooks/use-collection-filters";
import { useEffect } from "react";

export function CollectionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") ?? "";
  const initialMedium = searchParams.get("medium") ?? "all";
  const initialType = searchParams.get("type") ?? "all";
  const initialRipped = searchParams.get("ripped") ?? "all";

  const {
    searchQuery,
    setSearchQuery,
    filterMedium,
    setFilterMedium,
    activeTab,
    setActiveTab,
    rippedFilter,
    setRippedFilter,
  } = useCollectionFilters(
    undefined,
    initialSearch,
    initialMedium,
    initialType,
    initialRipped,
  );

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchQuery) params.set("search", debouncedSearchQuery);
    if (filterMedium !== "all") params.set("medium", filterMedium);
    if (activeTab !== "all") params.set("type", activeTab);
    if (rippedFilter !== "all") params.set("ripped", rippedFilter);

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/collection${newUrl}`, { scroll: false });
  }, [debouncedSearchQuery, filterMedium, activeTab, rippedFilter, router]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            type="text"
            placeholder="Search collection..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterMedium} onValueChange={setFilterMedium}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by medium" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Media Types</SelectItem>
            <SelectItem value="BLURAY">Blu-ray</SelectItem>
            <SelectItem value="BLURAY4K">4K UHD Blu-ray</SelectItem>
            <SelectItem value="DVD">DVD</SelectItem>
            <SelectItem value="DIGITAL">Digital</SelectItem>
            <SelectItem value="LASERDISC">LaserDisc</SelectItem>
            <SelectItem value="STREAM">Stream</SelectItem>
            <SelectItem value="FILE">File</SelectItem>
            <SelectItem value="VHS">VHS</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={rippedFilter} onValueChange={setRippedFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by rip status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="ripped">✓ Ripped to Digital</SelectItem>
            <SelectItem value="unripped">📀 Not Yet Ripped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="physical">Physical Media</TabsTrigger>
          <TabsTrigger value="digital">Digital/Virtual</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
