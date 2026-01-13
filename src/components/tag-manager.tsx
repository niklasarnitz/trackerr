"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Tag as TagIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { Label } from "~/components/ui/label";

interface TagManagerProps {
  movieId: string;
  currentTags?: Array<{ id: string; name: string; color?: string | null }>;
  onUpdate?: () => void;
}

export function TagManager({
  movieId,
  currentTags = [],
  onUpdate,
}: TagManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const utils = api.useUtils();

  const { data: allTags } = api.tag.getAll.useQuery();
  const addTagMutation = api.tag.addToMovie.useMutation({
    onSuccess: () => {
      toast.success("Tag added");
      void utils.tag.invalidate();
      onUpdate?.();
      router.refresh();
    },
  });
  const removeTagMutation = api.tag.removeFromMovie.useMutation({
    onSuccess: () => {
      toast.success("Tag removed");
      void utils.tag.invalidate();
      onUpdate?.();
      router.refresh();
    },
  });

  const handleAddTag = (tagId: string) => {
    addTagMutation.mutate({ movieId, tagId });
  };

  const handleRemoveTag = (tagId: string) => {
    removeTagMutation.mutate({ movieId, tagId });
  };

  const currentTagIds = new Set(currentTags.map((t) => t.id));
  const availableTags =
    allTags?.filter((tag) => !currentTagIds.has(tag.id)) ?? [];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <TagIcon className="mr-2 h-4 w-4" />
          Manage Tags
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
          <DialogDescription>
            Add or remove tags for this movie
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Tags */}
          {currentTags.length > 0 && (
            <div>
              <Label>Current Tags</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {currentTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="flex items-center gap-1"
                    style={
                      tag.color
                        ? {
                            backgroundColor: tag.color,
                            color: "white",
                          }
                        : undefined
                    }
                  >
                    {tag.name}
                    <button
                      onClick={() => handleRemoveTag(tag.id)}
                      className="ml-1 hover:opacity-70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Available Tags */}
          {availableTags.length > 0 && (
            <div>
              <Label>Available Tags</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="hover:bg-secondary cursor-pointer"
                    style={
                      tag.color
                        ? {
                            borderColor: tag.color,
                            color: tag.color,
                          }
                        : undefined
                    }
                    onClick={() => handleAddTag(tag.id)}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {availableTags.length === 0 && currentTags.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No tags available. Create tags in settings.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
