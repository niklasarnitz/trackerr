"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { CheckCircle2, Circle, Play } from "lucide-react";
import type { RouterOutputs } from "~/trpc/react";
import { useState } from "react";
import { AddTvShowWatchDialog } from "~/components/add-tv-show-watch-dialog";

type Season = RouterOutputs["tvShow"]["getById"]["seasons"][number];

interface TvShowSeasonsProps {
  tvShowId: string;
  seasons: Season[];
}

export function TvShowSeasons({ tvShowId, seasons }: TvShowSeasonsProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<{
    episodeId: string;
    episodeName: string;
  } | null>(null);

  if (seasons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seasons</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No seasons available. Click &quot;Sync Seasons&quot; to fetch season
            and episode data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Seasons</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {seasons.map((season) => {
              const watchedEpisodes = season.episodes.filter(
                (ep) => ep.watches.length > 0,
              ).length;
              const totalEpisodes = season.episodes.length;

              return (
                <AccordionItem key={season.id} value={season.id}>
                  <AccordionTrigger>
                    <div className="flex w-full items-center justify-between pr-4">
                      <span>
                        Season {season.seasonNumber}
                        {season.name && ` - ${season.name}`}
                      </span>
                      <Badge variant="secondary">
                        {watchedEpisodes}/{totalEpisodes} watched
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      {season.episodes.map((episode) => {
                        const isWatched = episode.watches.length > 0;
                        return (
                          <div
                            key={episode.id}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex items-center gap-3">
                              {isWatched ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <Circle className="text-muted-foreground h-5 w-5" />
                              )}
                              <div>
                                <p className="font-medium">
                                  {episode.episodeNumber}. {episode.name}
                                </p>
                                {episode.overview && (
                                  <p className="text-muted-foreground line-clamp-2 text-sm">
                                    {episode.overview}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setSelectedEpisode({
                                  episodeId: episode.id,
                                  episodeName: `S${season.seasonNumber}E${episode.episodeNumber} - ${episode.name}`,
                                })
                              }
                            >
                              <Play className="mr-1 h-4 w-4" />
                              Mark Watched
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {selectedEpisode && (
        <AddTvShowWatchDialog
          tvShowId={tvShowId}
          episodeId={selectedEpisode.episodeId}
          episodeName={selectedEpisode.episodeName}
          open={!!selectedEpisode}
          onOpenChange={(open) => !open && setSelectedEpisode(null)}
        />
      )}
    </>
  );
}
