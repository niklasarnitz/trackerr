"use client";

import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ExternalActionMetadataDisplay } from "~/components/external-action-metadata-display";
import { StarRatingDisplay } from "~/components/star-rating-display";
import {
  getSoundSystemLabel,
  getProjectionTypeLabel,
  getLanguageTypeLabel,
  getAspectRatioLabel,
} from "~/lib/label-utils";
import { STREAMING_SERVICES } from "~/lib/form-schemas";
import type { RouterOutputs } from "~/trpc/react";

type MovieWatch = RouterOutputs["movieWatch"]["getByMovieId"][0];

interface MovieWatchCardDisplayProps {
  readonly watch: MovieWatch;
}

export function MovieWatchCardDisplay({ watch }: MovieWatchCardDisplayProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="text-muted-foreground h-4 w-4" />
          <CardDescription>
            {format(new Date(watch.watchedAt), "PPP", { locale: enUS })}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {/* External Action Metadata Tags */}
        {watch.externalActionMetadataTags &&
          watch.externalActionMetadataTags.length > 0 && (
            <div className="mb-3">
              <ExternalActionMetadataDisplay
                tags={watch.externalActionMetadataTags}
              />
            </div>
          )}

        {/* Rating */}
        {watch.rating !== null && (
          <div className="mb-3 flex items-center gap-2">
            <StarRatingDisplay rating={watch.rating} />
            <Badge variant="secondary">{watch.rating}/5</Badge>
          </div>
        )}

        {/* Watch Location */}
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge variant="outline">
            {watch.watchLocation === "ON_DEMAND" && "On Demand / Streaming"}
            {watch.watchLocation === "CINEMA" && "Cinema"}
            {watch.watchLocation === "TV" && "TV"}
            {watch.watchLocation === "OTHER" && "Other"}
            {!watch.watchLocation && "On Demand / Streaming"}
          </Badge>
          {watch.watchLocation === "ON_DEMAND" && watch.streamingService && (
            <Badge variant="secondary">
              {STREAMING_SERVICES[watch.streamingService] ??
                watch.streamingService.replace(/_/g, " ")}
            </Badge>
          )}
        </div>

        {/* Cinema Metadata */}
        {watch.watchLocation === "CINEMA" && watch.cinemaWatchMetadata && (
          <div className="mb-3 space-y-2">
            {watch.cinemaWatchMetadata.cinemaName && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Cinema:</span>
                <span className="text-sm">
                  {watch.cinemaWatchMetadata.cinemaName}
                </span>
              </div>
            )}
            {watch.cinemaWatchMetadata.soundSystemType && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Sound:</span>
                <Badge variant="secondary" className="text-xs">
                  {getSoundSystemLabel(
                    watch.cinemaWatchMetadata.soundSystemType,
                  )}
                </Badge>
              </div>
            )}
            {watch.cinemaWatchMetadata.projectionType && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Projection:</span>
                <Badge variant="secondary" className="text-xs">
                  {getProjectionTypeLabel(
                    watch.cinemaWatchMetadata.projectionType,
                  )}
                </Badge>
              </div>
            )}
            {watch.cinemaWatchMetadata.languageType && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Language:</span>
                <Badge variant="secondary" className="text-xs">
                  {getLanguageTypeLabel(watch.cinemaWatchMetadata.languageType)}
                </Badge>
              </div>
            )}
            {watch.cinemaWatchMetadata.aspectRatio && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Aspect Ratio:</span>
                <Badge variant="secondary" className="text-xs">
                  {getAspectRatioLabel(watch.cinemaWatchMetadata.aspectRatio)}
                </Badge>
              </div>
            )}
            {watch.cinemaWatchMetadata.ticketPrice && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Ticket Price:</span>
                <span className="text-sm">
                  €{watch.cinemaWatchMetadata.ticketPrice.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Review */}
        {watch.review && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm whitespace-pre-wrap">{watch.review}</p>
          </div>
        )}

        {!watch.rating && !watch.review && (
          <p className="text-muted-foreground text-sm italic">
            No additional details
          </p>
        )}
      </CardContent>
    </Card>
  );
}
