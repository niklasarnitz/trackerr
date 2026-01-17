"use client";

import { useState } from "react";
import { MovieWatchCardDisplay } from "~/components/movie-watch-card-display";
import { MovieWatchCardEdit } from "~/components/movie-watch-card-edit";
import { MovieWatchCardActions } from "~/components/movie-watch-card-actions";
import { CardHeader } from "~/components/ui/card";
import type { RouterOutputs } from "~/trpc/react";

type MovieWatch = RouterOutputs["movieWatch"]["getByMovieId"][0];

interface MovieWatchCardProps {
  readonly watch: MovieWatch;
  readonly onUpdate: () => void;
}

export function MovieWatchCard({ watch, onUpdate }: MovieWatchCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <MovieWatchCardEdit
        watch={watch}
        onSaved={() => {
          setIsEditing(false);
          onUpdate();
        }}
        onCancelled={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="space-y-2">
      <CardHeader className="px-0 pb-2">
        <div className="flex items-center justify-between">
          <div />
          <MovieWatchCardActions
            watch={watch}
            onEdit={() => setIsEditing(true)}
            onDelete={onUpdate}
          />
        </div>
      </CardHeader>
      <MovieWatchCardDisplay watch={watch} />
    </div>
  );
}
