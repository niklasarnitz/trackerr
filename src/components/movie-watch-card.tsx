"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Star,
  Edit2,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { cn, getPosterUrl } from "~/lib/utils";
import { api, type RouterOutputs } from "~/trpc/react";
import { toast } from "sonner";
import { CinemaSearch } from "~/components/cinema-search";
import { ExternalActionMetadataDisplay } from "~/components/external-action-metadata-display";
import { StarRatingDisplay } from "~/components/star-rating-display";
import {
  movieWatchUpdateSchema,
  type MovieWatchUpdateInput,
} from "~/lib/api-schemas";
import {
  STREAMING_SERVICES,
  SOUND_SYSTEM_TYPES,
  PROJECTION_TYPES,
  LANGUAGE_TYPES,
  ASPECT_RATIOS,
} from "~/lib/form-schemas";
import {
  getSoundSystemLabel,
  getProjectionTypeLabel,
  getLanguageTypeLabel,
  getAspectRatioLabel,
} from "~/lib/label-utils";
import { normalizeWatchDate, toCalendarDate } from "~/lib/watch-date";

type MovieWatch = RouterOutputs["movieWatch"]["getByMovieId"][0];

interface MovieWatchCardProps {
  readonly watch: MovieWatch;
  readonly onUpdate: () => void;
}

export function MovieWatchCard({ watch, onUpdate }: MovieWatchCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<MovieWatchUpdateInput>({
    resolver: zodResolver(movieWatchUpdateSchema),
    defaultValues: {
      id: watch.id,
      rating: watch.rating ?? undefined,
      review: watch.review ?? "",
      watchedAt: toCalendarDate(watch.watchedAt),
      watchLocation:
        (watch.watchLocation as "ON_DEMAND" | "CINEMA" | "TV" | "OTHER") ??
        "ON_DEMAND",
      streamingService: watch.streamingService ?? undefined,
      cinemaMetadata: watch.cinemaWatchMetadata
        ? {
            cinemaName: watch.cinemaWatchMetadata.cinemaName ?? undefined,
            soundSystemType:
              watch.cinemaWatchMetadata.soundSystemType ?? undefined,
            projectionType:
              watch.cinemaWatchMetadata.projectionType ?? undefined,
            languageType: watch.cinemaWatchMetadata.languageType ?? undefined,
            aspectRatio: watch.cinemaWatchMetadata.aspectRatio ?? undefined,
            ticketPrice: watch.cinemaWatchMetadata.ticketPrice ?? undefined,
          }
        : undefined,
    },
  });

  const updateMutation = api.movieWatch.update.useMutation({
    onSuccess: () => {
      toast.success("Watch entry has been updated!");
      setIsEditing(false);
      onUpdate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = api.movieWatch.delete.useMutation({
    onSuccess: () => {
      toast.success("Watch entry has been deleted!");
      onUpdate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSave = async (data: MovieWatchUpdateInput) => {
    await updateMutation.mutateAsync({
      ...data,
      ...(data.watchedAt
        ? { watchedAt: normalizeWatchDate(data.watchedAt) }
        : {}),
    });
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this watch entry?")) {
      await deleteMutation.mutateAsync({ id: watch.id });
    }
  };

  if (isEditing) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Edit Watch</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={form.handleSubmit(handleSave)}
                disabled={updateMutation.isPending}
              >
                <Check className="mr-1 h-4 w-4" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={updateMutation.isPending}
              >
                <X className="mr-1 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSave)}
              className="space-y-4"
            >
              {/* Date Picker */}
              <FormField
                control={form.control}
                name="watchedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP", { locale: enUS })
                            ) : (
                              <span>Select date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(value) =>
                            field.onChange(
                              value ? normalizeWatchDate(value) : value,
                            )
                          }
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rating */}
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => {
                            const rating = field.value ?? 0;
                            const filled = rating >= i;
                            const halfFilled = rating >= i - 0.5 && rating < i;

                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  if (rating === i) {
                                    field.onChange(i - 0.5);
                                  } else if (rating === i - 0.5) {
                                    field.onChange(i);
                                  } else {
                                    field.onChange(i);
                                  }
                                }}
                                className={cn(
                                  "h-auto cursor-pointer border-none bg-transparent p-0 hover:scale-110",
                                )}
                              >
                                <Star
                                  className={cn(
                                    "h-4 w-4",
                                    (() => {
                                      if (filled)
                                        return "fill-yellow-400 text-yellow-400";
                                      if (halfFilled)
                                        return "fill-yellow-400/50 text-yellow-400";
                                      return "text-gray-300";
                                    })(),
                                  )}
                                />
                              </button>
                            );
                          })}
                        </div>
                        <Input
                          type="number"
                          min="0"
                          max="5"
                          step="0.5"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              parseFloat(e.target.value) || undefined,
                            )
                          }
                          className="w-20"
                        />
                        <span className="text-muted-foreground text-sm">
                          / 5
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Watch Location */}
              <FormField
                control={form.control}
                name="watchLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Where did you watch it?</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ON_DEMAND">
                          On Demand / Streaming
                        </SelectItem>
                        <SelectItem value="CINEMA">Cinema</SelectItem>
                        <SelectItem value="TV">TV</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Streaming Service - only show when watch location is ON_DEMAND */}
              {form.watch("watchLocation") === "ON_DEMAND" && (
                <FormField
                  control={form.control}
                  name="streamingService"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Streaming Service (Optional)</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "NONE" ? undefined : value)
                        }
                        value={field.value ?? "NONE"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select streaming service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NONE">None</SelectItem>
                          {Object.entries(STREAMING_SERVICES).map(([value, label]) => (
                            <SelectItem
                              key={value}
                              value={value}
                            >
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Cinema Metadata - only show when watch location is CINEMA */}
              {form.watch("watchLocation") === "CINEMA" && (
                <div className="space-y-4">
                  <div className="text-sm font-medium">Cinema Details</div>

                  <FormField
                    control={form.control}
                    name="cinemaMetadata.cinemaName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cinema Name</FormLabel>
                        <FormControl>
                          <CinemaSearch
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Enter or search cinema name..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cinemaMetadata.soundSystemType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sound System (Optional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sound system" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(SOUND_SYSTEM_TYPES).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cinemaMetadata.projectionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Projection Type (Optional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select projection type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(PROJECTION_TYPES).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cinemaMetadata.languageType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language (Optional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(LANGUAGE_TYPES).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cinemaMetadata.aspectRatio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aspect Ratio (Optional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select aspect ratio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(ASPECT_RATIOS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cinemaMetadata.ticketPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ticket Price (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? undefined : parseFloat(value),
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Review */}
              <FormField
                control={form.control}
                name="review"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Your thoughts about the movie..."
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-muted-foreground h-4 w-4" />
            <CardDescription>
              {format(new Date(watch.watchedAt), "PPP", { locale: enUS })}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
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
