"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Calendar as CalendarIcon, Check, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
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
import { api } from "~/trpc/react";
import { toast } from "sonner";
import {
  movieWatchSchema,
  WATCH_LOCATIONS,
  type MovieWatchFormData,
} from "~/lib/form-schemas";
import { normalizeWatchDate, toCalendarDate } from "~/lib/watch-date";

interface QuickWatchDialogProps {
  readonly movieId: string;
  readonly movieTitle: string;
  readonly onSuccess?: () => void;
  readonly children?: React.ReactNode;
}

export function QuickWatchDialog({
  movieId,
  movieTitle,
  onSuccess,
  children,
}: QuickWatchDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const utils = api.useUtils();

  const form = useForm<MovieWatchFormData>({
    resolver: zodResolver(movieWatchSchema),
    defaultValues: {
      watchedAt: toCalendarDate(new Date()),
      watchLocation: "ON_DEMAND",
    },
  });

  const createWatch = api.movieWatch.create.useMutation({
    onSuccess: () => {
      toast.success("Watch added successfully!");
      setIsOpen(false);
      form.reset({
        watchedAt: toCalendarDate(new Date()),
        watchLocation: "ON_DEMAND",
      });
      onSuccess?.();
      // Invalidate queries to refresh the UI
      void utils.movie.getAll.invalidate();
      void utils.movie.getById.invalidate({ id: movieId });
      void utils.movieWatch.getByMovieId.invalidate({ movieId });
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Failed to add watch: ${error.message}`);
    },
  });

  const onSubmit = (data: MovieWatchFormData) => {
    createWatch.mutate({
      ...data,
      watchedAt: normalizeWatchDate(data.watchedAt),
      movieId,
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset({
        watchedAt: toCalendarDate(new Date()),
        watchLocation: "ON_DEMAND",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children ?? (
          <Button size="sm" className="h-8 w-8 p-0 shadow-lg">
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Add Watch</DialogTitle>
          <DialogDescription>
            Add a watch entry for &ldquo;{movieTitle}&rdquo;
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createWatch.isPending}
                className="flex-1"
              >
                {createWatch.isPending ? (
                  "Adding..."
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Add Watch
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
