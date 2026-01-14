"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  MapPin,
  Edit2,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { StarRating } from "~/components/star-rating";
import { StarRatingDisplay } from "~/components/star-rating-display";
import { cn } from "~/lib/utils";
import { api, type RouterOutputs } from "~/trpc/react";
import { toast } from "sonner";
import {
  getWatchLocationLabel,
  getStreamingServiceLabel,
} from "~/lib/label-utils";
import { normalizeWatchDate, toCalendarDate } from "~/lib/watch-date";
import { tvShowWatchUpdateSchema } from "~/lib/api-schemas";
import type { z } from "zod";

type Watch = RouterOutputs["tvShow"]["getById"]["watches"][number];
type FormValues = z.infer<typeof tvShowWatchUpdateSchema>;

interface TvShowWatchCardProps {
  watch: Watch;
  onUpdate: () => void;
}

export function TvShowWatchCard({ watch, onUpdate }: TvShowWatchCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  const utils = api.useUtils();

  const form = useForm<FormValues>({
    resolver: zodResolver(tvShowWatchUpdateSchema),
    defaultValues: {
      id: watch.id,
      rating: watch.rating ?? undefined,
      review: watch.review ?? "",
      watchedAt: toCalendarDate(watch.watchedAt),
      watchLocation: watch.watchLocation as
        | "ON_DEMAND"
        | "CINEMA"
        | "TV_BROADCAST"
        | "OTHER"
        | undefined,
      streamingService: watch.streamingService ?? undefined,
    },
  });

  const updateMutation = api.tvShowWatch.update.useMutation({
    onSuccess: async () => {
      toast.success("Watch entry updated!");
      setIsEditing(false);
      await Promise.all([
        utils.tvShow.getById.invalidate({ id: watch.tvShowId }),
        utils.tvShowWatch.getByTvShowId.invalidate({
          tvShowId: watch.tvShowId,
        }),
      ]);
      onUpdate();
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update watch entry");
    },
  });

  const deleteMutation = api.tvShowWatch.delete.useMutation({
    onSuccess: async () => {
      toast.success("Watch entry deleted!");
      setShowDeleteDialog(false);
      await Promise.all([
        utils.tvShow.getById.invalidate({ id: watch.tvShowId }),
        utils.tvShowWatch.getByTvShowId.invalidate({
          tvShowId: watch.tvShowId,
        }),
      ]);
      onUpdate();
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete watch entry");
    },
  });

  const handleSave = async (data: FormValues) => {
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
    await deleteMutation.mutateAsync({ id: watch.id });
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
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="watchedAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Watch Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: enUS })
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (optional)</FormLabel>
                    <FormControl>
                      <StarRating
                        rating={field.value ?? 0}
                        onRatingChange={field.onChange}
                        editable
                        size="lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="watchLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Watch Location</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ON_DEMAND">On Demand</SelectItem>
                        <SelectItem value="CINEMA">Cinema</SelectItem>
                        <SelectItem value="TV_BROADCAST">
                          TV Broadcast
                        </SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("watchLocation") === "ON_DEMAND" && (
                <FormField
                  control={form.control}
                  name="streamingService"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Streaming Service (optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="HOME_MEDIA_LIBRARY">
                            Home Media Library
                          </SelectItem>
                          <SelectItem value="NETFLIX">Netflix</SelectItem>
                          <SelectItem value="PRIME_VIDEO">
                            Amazon Prime Video
                          </SelectItem>
                          <SelectItem value="DISNEY_PLUS">Disney+</SelectItem>
                          <SelectItem value="HBO_MAX">HBO Max</SelectItem>
                          <SelectItem value="APPLE_TV_PLUS">
                            Apple TV+
                          </SelectItem>
                          <SelectItem value="HULU">Hulu</SelectItem>
                          <SelectItem value="PARAMOUNT_PLUS">
                            Paramount+
                          </SelectItem>
                          <SelectItem value="PEACOCK">Peacock</SelectItem>
                          <SelectItem value="YOUTUBE_PREMIUM">
                            YouTube Premium
                          </SelectItem>
                          <SelectItem value="CRUNCHYROLL">
                            Crunchyroll
                          </SelectItem>
                          <SelectItem value="MAX">MAX</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="review"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Your thoughts..."
                        {...field}
                        value={field.value ?? ""}
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
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {watch.episode && (
            <p className="font-medium">
              S{watch.episode.season.seasonNumber}E{watch.episode.episodeNumber}{" "}
              - {watch.episode.name}
            </p>
          )}
          {!watch.episode && <p className="font-medium">General Watch</p>}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              <CalendarIcon className="mr-1 h-3 w-3" />
              {format(new Date(watch.watchedAt), "PP")}
            </Badge>
            <Badge variant="outline">
              <MapPin className="mr-1 h-3 w-3" />
              {getWatchLocationLabel(watch.watchLocation)}
            </Badge>
            {watch.streamingService && (
              <Badge variant="secondary">
                {getStreamingServiceLabel(watch.streamingService)}
              </Badge>
            )}
          </div>
          {watch.rating && (
            <div className="mt-2">
              <StarRatingDisplay rating={watch.rating} />
            </div>
          )}
          {watch.review && (
            <p className="text-muted-foreground mt-2 text-sm">{watch.review}</p>
          )}
        </div>
        <div className="ml-4 flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            aria-label="Edit watch entry"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                disabled={deleteMutation.isPending}
                aria-label="Delete watch entry"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete watch entry?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove this watch entry from your
                  history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteMutation.isPending}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90 text-white"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
