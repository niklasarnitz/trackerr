"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";

const TvShowSearchDialog = dynamic(
  () =>
    import("~/components/tv-show-search-dialog").then(
      (mod) => mod.TvShowSearchDialog,
    ),
  { ssr: false },
);

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
