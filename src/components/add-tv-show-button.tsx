"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";

interface AddTvShowButtonProps {
  readonly variant?:
    | "default"
    | "outline"
    | "ghost"
    | "link"
    | "destructive"
    | "secondary";
  readonly size?: "default" | "sm" | "lg" | "icon";
  readonly children?: React.ReactNode;
  readonly className?: string;
}

const TvShowSearchDialog = dynamic(
  () =>
    import("~/components/tv-show-search-dialog").then(
      (mod) => mod.TvShowSearchDialog,
    ),
  { ssr: false },
);

export function AddTvShowButton({
  variant = "default",
  size = "default",
  children,
  className,
}: AddTvShowButtonProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsSearchOpen(true)}
        aria-label="Add new TV show to collection"
      >
        {children ?? (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Add TV Show
          </>
        )}
      </Button>
      <TvShowSearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
