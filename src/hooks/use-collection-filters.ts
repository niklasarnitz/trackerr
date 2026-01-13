import { useState, useEffect } from "react";

/**
 * Hook for managing collection filter state
 * Handles search, medium filter, type filter, and ripped status filter
 */
export function useCollectionFilters(
  onSearch?: (params: {
    search: string;
    medium: string;
    type: string;
    ripped: string;
  }) => void,
  initialSearch = "",
  initialMedium = "",
  initialType = "books",
  initialRipped = "",
) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [filterMedium, setFilterMedium] = useState(initialMedium);
  const [activeTab, setActiveTab] = useState(initialType);
  const [rippedFilter, setRippedFilter] = useState(initialRipped);

  useEffect(() => {
    onSearch?.({
      search: searchQuery,
      medium: filterMedium,
      type: activeTab,
      ripped: rippedFilter,
    });
  }, [searchQuery, filterMedium, activeTab, rippedFilter, onSearch]);

  return {
    searchQuery,
    setSearchQuery,
    filterMedium,
    setFilterMedium,
    activeTab,
    setActiveTab,
    rippedFilter,
    setRippedFilter,
  };
}
