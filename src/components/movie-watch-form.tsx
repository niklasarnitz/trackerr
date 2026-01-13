"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Textarea } from "~/components/ui/textarea";
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
import { StarRating } from "~/components/star-rating";
import { CinemaMetadataForm } from "~/components/cinema-metadata-form";
import { useMovieMutations } from "~/hooks/use-movie-mutations";
import {
  movieWatchSchema,
  WATCH_LOCATIONS,
  STREAMING_SERVICES,
  type MovieWatchFormData,
} from "~/lib/form-schemas";
import { normalizeWatchDate, toCalendarDate } from "~/lib/watch-date";

interface MovieWatchFormProps {
  readonly movieId: string;
  readonly onSuccess: () => void;
}

export function MovieWatchForm({ movieId, onSuccess }: MovieWatchFormProps) {
  const { createWatch } = useMovieMutations();

  const form = useForm<MovieWatchFormData>({
    resolver: zodResolver(movieWatchSchema),
    defaultValues: {
      rating: undefined,
      review: "",
      watchedAt: toCalendarDate(new Date()),
      watchLocation: "ON_DEMAND",
    },
  });

  const handleSubmit = async (data: MovieWatchFormData) => {
    try {
      await createWatch.mutateAsync({
        movieId,
        ...data,
        review: data.review ?? undefined,
      });

      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Failed to create watch entry:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating (Optional)</FormLabel>
              <FormControl>
                <StarRating
                  rating={field.value ?? 0}
                  onRatingChange={field.onChange}
                  editable
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                      field.onChange(value ? normalizeWatchDate(value) : value)
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

        <FormField
          control={form.control}
          name="watchLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Watch Location</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(WATCH_LOCATIONS).map(([value, label]) => (
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

        {form.watch("watchLocation") === "CINEMA" && (
          <CinemaMetadataForm control={form.control} />
        )}

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

        <FormField
          control={form.control}
          name="review"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your thoughts about the movie..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={createWatch.isPending}
        >
          {createWatch.isPending ? "Logging..." : "Log Watch"}
        </Button>
      </form>
    </Form>
  );
}
