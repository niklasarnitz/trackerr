"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { toast } from "sonner";

interface RippedStatusToggleProps {
  mediaEntryId: string;
  isRipped: boolean;
  medium: string;
  isVirtual: boolean;
}

export function RippedStatusToggle({
  mediaEntryId,
  isRipped,
  medium,
  isVirtual,
}: RippedStatusToggleProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const utils = api.useUtils();

  const updateMediaEntry = api.mediaEntry.update.useMutation({
    onSuccess: async () => {
      toast.success(`Marked as ${!isRipped ? "ripped" : "not ripped"}`);
      setIsUpdating(false);

      // Invalidate queries to refresh the data
      await utils.mediaEntry.getAll.invalidate();
      await utils.mediaEntry.getCollectionGroupedByMovie.invalidate();

      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
      setIsUpdating(false);
    },
  });

  // Only show for physical disc media
  if (isVirtual || !["BLURAY", "BLURAY4K", "DVD"].includes(medium)) {
    return null;
  }

  const handleToggle = () => {
    setIsUpdating(true);
    updateMediaEntry.mutate({
      id: mediaEntryId,
      isRipped: !isRipped,
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Status badge */}
      {isRipped ? (
        <Badge variant="secondary" className="text-xs">
          ✓ Ripped
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="border-orange-300 text-xs text-orange-600"
        >
          Not Ripped
        </Badge>
      )}

      {/* Toggle button */}
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0"
        onClick={handleToggle}
        disabled={isUpdating}
        title={isRipped ? "Mark as not ripped" : "Mark as ripped"}
      >
        {isRipped ? (
          <X className="h-4 w-4 text-orange-600" />
        ) : (
          <Check className="h-4 w-4 text-green-600" />
        )}
      </Button>
    </div>
  );
}
