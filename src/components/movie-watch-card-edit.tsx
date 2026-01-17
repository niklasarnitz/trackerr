"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Calendar as CalendarIcon, Star, Check, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Textarea } from "~/components/ui/textarea";
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
import { cn } from "~/lib/utils";
import { api, type RouterOutputs } from "~/trpc/react";
import { toast } from "sonner";
import {
  movieWatchUpdateSchema,
  type MovieWatchUpdateInput,
} from "~/lib/api-schemas";
import { STREAMING_SERVICES } from "~/lib/form-schemas";
import { normalizeWatchDate, toCalendarDate } from "~/lib/watch-date";
import { CinemaMetadataFields } from "./cinema-metadata-fields";

type MovieWatch = RouterOutputs["movieWatch"]["getByMovieId"][0];

interface MovieWatchCardEditProps {
  readonly watch: MovieWatch;
  readonly onSaved: () => void;
  readonly onCancelled: () => void;
}

export function MovieWatchCardEdit({
  watch,
  onSaved,
  onCancelled,
}: MovieWatchCardEditProps) {
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
      onSaved();
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
    onCancelled();
  };

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
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
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
                      <span className="text-muted-foreground text-sm">/ 5</span>
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
                        {Object.entries(STREAMING_SERVICES).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Cinema Metadata - only show when watch location is CINEMA */}
            {form.watch("watchLocation") === "CINEMA" && (
              <CinemaMetadataFields control={form.control} />
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
