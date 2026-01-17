"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { MovieWatchForm } from "./movie-watch-form";

interface AddMovieWatchDialogProps {
  movieId: string;
  onSuccess: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddMovieWatchDialog({
  movieId,
  onSuccess,
  isOpen: controlledIsOpen,
  onOpenChange: onControlledOpenChange,
}: AddMovieWatchDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const onOpenChange = onControlledOpenChange || setInternalIsOpen;

  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Log Watch
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Movie Watch</DialogTitle>
        </DialogHeader>
        <MovieWatchForm movieId={movieId} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
