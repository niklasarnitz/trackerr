import Image from "next/image";
import Link from "next/link";
import { Disc, Monitor, Cloud, Archive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ErrorDisplay } from "~/components/error-display";
import { Pagination } from "~/components/pagination";
import { RippedStatusToggle } from "~/components/ripped-status-toggle";
import { getPosterUrl } from "~/lib/utils";
import { api } from "~/trpc/server";
import { AddMovieLink } from "~/components/add-movie-button";
import type { MediaType } from "@prisma/client";

export interface CollectionGridProps {
  search?: string;
  medium?: string;
  type?: "all" | "physical" | "digital";
  ripped?: "all" | "ripped" | "unripped";
  page?: number;
}

const getMediaTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    BLURAY: "Blu-ray",
    BLURAY4K: "4K UHD Blu-ray",
    DVD: "DVD",
    DIGITAL: "Digital",
    LASERDISC: "LaserDisc",
    STREAM: "Stream",
    FILE: "File",
    VHS: "VHS",
    OTHER: "Other",
  };
  return labels[type] ?? type;
};

const getMediaIcon = (type: string, isVirtual: boolean) => {
  if (isVirtual) {
    return type === "STREAM" ? (
      <Cloud className="h-4 w-4" />
    ) : (
      <Monitor className="h-4 w-4" />
    );
  }
  return <Disc className="h-4 w-4" />;
};

export async function CollectionGrid({
  search,
  medium,
  type = "all",
  ripped = "all",
  page = 1,
}: CollectionGridProps) {
  try {
    const limit = 20;
    const skip = (page - 1) * limit;

    // Determine virtual filter based on type
    let isVirtual: boolean | undefined;
    if (type === "physical") isVirtual = false;
    if (type === "digital") isVirtual = true;

    // Determine ripped filter
    let isRipped: boolean | undefined;
    if (ripped === "ripped") isRipped = true;
    if (ripped === "unripped") isRipped = false;

    const result = await api.mediaEntry.getCollectionGroupedByMovie({
      skip,
      limit,
      search,
      medium: medium && medium !== "all" ? (medium as MediaType) : undefined,
      isVirtual,
      isRipped,
    });

    // Group media entries by movie
    const filteredGroups = result.groups;

    // Filter by search if provided
    const hasActiveFilters =
      Boolean(search) ||
      (medium && medium !== "all") ||
      type !== "all" ||
      ripped !== "all";

    if (filteredGroups.length === 0) {
      return (
        <Card>
          <CardContent className="py-16 text-center">
            <Archive className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">
              No collection items found
            </h3>
            {hasActiveFilters ? (
              <p className="text-muted-foreground mb-4">
                No collection items match your search for &quot;{search}&quot;
              </p>
            ) : (
              <p className="text-muted-foreground mb-4">
                You haven&apos;t added any physical or digital media yet.
              </p>
            )}
            <AddMovieLink>Add movies to your collection →</AddMovieLink>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Showing {filteredGroups.length} of {result.total} movies with{" "}
            {filteredGroups.reduce((sum, g) => sum + g.mediaEntries.length, 0)}{" "}
            media items
            {search && ` matching "${search}"`}
          </p>
        </div>

        <div className="grid gap-6">
          {filteredGroups.map((group) => (
            <Card key={group.movie.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex gap-4">
                  <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded">
                    <Image
                      src={getPosterUrl(group.movie.posterPath)}
                      alt={group.movie.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <Link href={`/movies/${group.movie.id}`}>
                      <CardTitle className="hover:underline">
                        {group.movie.title}
                      </CardTitle>
                    </Link>
                    {group.movie.originalTitle &&
                      group.movie.originalTitle !== group.movie.title && (
                        <p className="text-muted-foreground mt-1 text-sm">
                          {group.movie.originalTitle}
                        </p>
                      )}
                    <div className="mt-2 flex items-center gap-2">
                      {group.movie.releaseYear && (
                        <Badge variant="secondary" className="text-xs">
                          {group.movie.releaseYear}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {group.mediaEntries.length} media item
                        {group.mediaEntries.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  {group.mediaEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        {getMediaIcon(entry.medium, entry.isVirtual)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {getMediaTypeLabel(entry.medium)}
                            </span>
                            {entry.isVirtual && (
                              <Badge variant="outline" className="text-xs">
                                Virtual
                              </Badge>
                            )}
                          </div>
                          {entry.version && (
                            <p className="text-muted-foreground text-sm">
                              {entry.version}
                            </p>
                          )}
                          {entry.note && (
                            <p className="text-muted-foreground text-sm italic">
                              {entry.note}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Ripped status toggle for physical disc media */}
                      <RippedStatusToggle
                        mediaEntryId={entry.id}
                        isRipped={entry.isRipped}
                        medium={entry.medium}
                        isVirtual={entry.isVirtual}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Pagination
          currentPage={page}
          totalPages={Math.ceil(result.total / limit)}
          hasMore={result.hasMore}
          baseUrl="/collection"
          pageSize={limit}
          searchParams={{
            ...(search && { search }),
            ...(medium && medium !== "all" && { medium }),
            ...(type !== "all" && { type }),
            ...(ripped !== "all" && { ripped }),
          }}
          total={result.total}
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading collection:", error);
    return (
      <ErrorDisplay
        title="Failed to load collection"
        message="There was an error loading your collection. Please try again."
      />
    );
  }
}
