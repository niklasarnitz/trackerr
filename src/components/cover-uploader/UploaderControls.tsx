import React from "react";
import { Button } from "~/components/ui/button";

interface UploaderControlsProps {
  onFetchFromService?: () => void;
  onRemoveCover?: () => void;
  serviceLabel?: string;
  hasImage: boolean;
  hasIdentifier?: boolean;
}

export function UploaderControls({
  onFetchFromService,
  onRemoveCover,
  serviceLabel = "Service",
  hasImage,
  hasIdentifier = false,
}: Readonly<UploaderControlsProps>) {
  return (
    <div className="flex flex-wrap gap-2">
      {onFetchFromService && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onFetchFromService}
          disabled={!hasIdentifier}
          className="text-xs"
          aria-label={
            hasIdentifier
              ? `Get cover image from ${serviceLabel}`
              : `Identifier required to fetch cover from ${serviceLabel}`
          }
        >
          Get Cover from {serviceLabel}
        </Button>
      )}

      {hasImage && onRemoveCover && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRemoveCover}
          className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive text-xs"
          aria-label="Remove cover image"
        >
          Remove Cover
        </Button>
      )}
    </div>
  );
}
