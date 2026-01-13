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
import { MediaEntryForm } from "./media-entry-form";

interface AddMediaEntryDialogProps {
  movieId: string;
  onSuccess?: () => void;
}

export function AddMediaEntryDialog({
  movieId,
  onSuccess,
}: AddMediaEntryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Media
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Physical Media</DialogTitle>
        </DialogHeader>
        <MediaEntryForm movieId={movieId} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
