"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
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
import { StarRating } from "~/components/star-rating";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { normalizeWatchDate, toCalendarDate } from "~/lib/watch-date";

const formSchema = z.object({
  watchedAt: z.date(),
  rating: z.number().min(0).max(5).optional(),
  review: z.string().optional(),
  watchLocation: z.enum(["ON_DEMAND", "CINEMA", "TV_BROADCAST", "OTHER"]),
  streamingService: z
    .enum([
      "HOME_MEDIA_LIBRARY",
      "NETFLIX",
      "PRIME_VIDEO",
      "DISNEY_PLUS",
      "HBO_MAX",
      "APPLE_TV_PLUS",
      "HULU",
      "PARAMOUNT_PLUS",
      "PEACOCK",
      "YOUTUBE_PREMIUM",
      "CRUNCHYROLL",
      "MAX",
      "OTHER",
    ])
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddTvShowWatchDialogProps {
  tvShowId: string;
  episodeId?: string;
  episodeName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTvShowWatchDialog({
  tvShowId,
  episodeId,
  episodeName,
  open,
  onOpenChange,
}: AddTvShowWatchDialogProps) {
  const router = useRouter();
  const utils = api.useUtils();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      watchedAt: toCalendarDate(new Date()),
      watchLocation: "ON_DEMAND",
      rating: undefined,
      review: "",
      streamingService: undefined,
    },
  });

  const createWatch = api.tvShowWatch.create.useMutation({
    onSuccess: async () => {
      toast.success("Watch entry added successfully");
      await Promise.all([
        utils.tvShow.getById.invalidate({ id: tvShowId }),
        utils.tvShowWatch.getByTvShowId.invalidate({ tvShowId }),
      ]);
      onOpenChange(false);
      form.reset();
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add watch entry");
    },
  });

  const onSubmit = (data: FormValues) => {
    createWatch.mutate({
      tvShowId,
      episodeId,
      watchedAt: normalizeWatchDate(data.watchedAt),
      rating: data.rating,
      review: data.review || undefined,
      watchLocation: data.watchLocation,
      streamingService: data.streamingService,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Watch Entry</DialogTitle>
          {episodeName && <DialogDescription>{episodeName}</DialogDescription>}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <SelectItem value="TV_BROADCAST">TV Broadcast</SelectItem>
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
                        <SelectItem value="APPLE_TV_PLUS">Apple TV+</SelectItem>
                        <SelectItem value="HULU">Hulu</SelectItem>
                        <SelectItem value="PARAMOUNT_PLUS">
                          Paramount+
                        </SelectItem>
                        <SelectItem value="PEACOCK">Peacock</SelectItem>
                        <SelectItem value="YOUTUBE_PREMIUM">
                          YouTube Premium
                        </SelectItem>
                        <SelectItem value="CRUNCHYROLL">Crunchyroll</SelectItem>
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
                      placeholder="Your thoughts on this episode..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createWatch.isPending}>
                {createWatch.isPending ? "Adding..." : "Add Watch"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
