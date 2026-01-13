"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Badge } from "~/components/ui/badge";
import { Cloud } from "lucide-react";
import type { ExternalActionMetadataTag } from "@prisma/client";

interface ExternalActionMetadataDisplayProps {
  tags: ExternalActionMetadataTag[];
}

const metadataTagDescriptions: Record<
  string,
  Record<string, { label: string; description: string; icon: React.ReactNode }>
> = {
  WEBHOOK: {
    JELLYFIN: {
      label: "Jellyfin Auto-Track",
      description: "Movie was automatically tracked via Jellyfin webhook",
      icon: <Cloud className="h-3 w-3" />,
    },
  },
};

export function ExternalActionMetadataDisplay({
  tags,
}: ExternalActionMetadataDisplayProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => {
          const viaKey = tag.via as keyof typeof metadataTagDescriptions;
          const fromKey = tag.from;
          const metadata = metadataTagDescriptions[viaKey]?.[fromKey];

          if (!metadata) {
            return null;
          }

          return (
            <Tooltip key={tag.id}>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="cursor-help text-xs">
                  {metadata.icon}
                  <span className="ml-1">{metadata.label}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{metadata.description}</p>
                <p className="text-muted-foreground text-xs">
                  Added: {new Date(tag.createdAt).toLocaleDateString()}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
