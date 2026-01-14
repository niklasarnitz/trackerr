"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { TvShowSearchDialog } from "~/components/tv-show-search-dialog";

export function AddTvShowButton() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsSearchOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add TV Show
      </Button>
      <TvShowSearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
