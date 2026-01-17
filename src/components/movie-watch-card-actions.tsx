"use client";

import { Edit2, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { api, type RouterOutputs } from "~/trpc/react";
import { toast } from "sonner";
import { useState } from "react";

type MovieWatch = RouterOutputs["movieWatch"]["getByMovieId"][0];

interface MovieWatchCardActionsProps {
  readonly watch: MovieWatch;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
}

export function MovieWatchCardActions({
  watch,
  onEdit,
  onDelete,
}: MovieWatchCardActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteMutation = api.movieWatch.delete.useMutation({
    onSuccess: () => {
      toast.success("Watch entry has been deleted!");
      onDelete();
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = async () => {
    await deleteMutation.mutateAsync({ id: watch.id });
  };

  return (
    <div className="flex gap-1">
      <Button
        size="sm"
        variant="ghost"
        onClick={onEdit}
        aria-label="Edit watch entry"
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            disabled={deleteMutation.isPending}
            aria-label="Delete watch entry"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete watch entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this watch entry from your history.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
