"use client";

import dynamic from "next/dynamic";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

const MovieSearchDialog = dynamic(
  () =>
    import("~/components/movie-search-dialog").then(
      (mod) => mod.MovieSearchDialog,
    ),
  { ssr: false },
);

interface AddMovieButtonProps {
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

export function AddMovieButton({
  variant = "default",
  size = "default",
  children,
  className,
}: AddMovieButtonProps) {
  return (
    <MovieSearchDialog>
      <Button
        variant={variant}
        size={size}
        className={className}
        aria-label="Add new movie to collection"
      >
        {children ?? (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Add Movie
          </>
        )}
      </Button>
    </MovieSearchDialog>
  );
}

interface AddMovieLinkProps {
  readonly children?: React.ReactNode;
  readonly className?: string;
}

export function AddMovieLink({ children, className }: AddMovieLinkProps) {
  return (
    <MovieSearchDialog>
      <button
        className={`text-primary cursor-pointer hover:underline ${className ?? ""}`}
      >
        {children ?? "Add your first movie →"}
      </button>
    </MovieSearchDialog>
  );
}
