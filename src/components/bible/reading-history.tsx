"use client";

import { format } from "date-fns";
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Edit2,
  Loader2,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
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
import { api } from "~/trpc/react";
import { BIBLE_BOOKS, type BibleBook } from "~/lib/bible-data";
import {
  BIBLE_TRANSLATIONS,
  GERMAN_TRANSLATIONS,
  ENGLISH_TRANSLATIONS,
  ANCIENT_TRANSLATIONS,
} from "~/lib/bible-translations-data";
import { toast } from "sonner";

const formSchema = z.object({
  bookId: z.string().min(1, "Book is required"),
  chapter: z.coerce.number().min(1),
  startVerse: z.union([z.coerce.number().min(1), z.literal("")]).optional(),
  endVerse: z.union([z.coerce.number().min(1), z.literal("")]).optional(),
  translation: z.string().default("LUTHER_1984"),
  date: z.date(),
});

type FormValues = z.infer<typeof formSchema>;

function EditReadingDialog({
  reading,
  open,
  onOpenChange,
}: {
  reading: {
    id: string;
    bookId: string;
    chapter: number;
    startVerse: number | null;
    endVerse: number | null;
    translation: string;
    date: Date;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const utils = api.useUtils();
  const [translationOpen, setTranslationOpen] = useState(false);
  const updateMutation = api.bible.updateReading.useMutation({
    onSuccess: () => {
      toast.success("Reading updated");
      utils.bible.getReadings.invalidate();
      utils.bible.getProgress.invalidate();
      onOpenChange(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      bookId: reading.bookId,
      chapter: reading.chapter,
      startVerse: reading.startVerse ?? "",
      endVerse: reading.endVerse ?? "",
      translation: reading.translation ?? "LUTHER_1984",
      date: new Date(reading.date),
    },
  });

  function onSubmit(values: FormValues) {
    const book = BIBLE_BOOKS.find((b) => b.id === values.bookId);
    if (book && values.chapter > book.chapters) {
      form.setError("chapter", {
        message: `Book only has ${book.chapters} chapters`,
      });
      return;
    }

    const startVerse =
      values.startVerse === "" ? undefined : Number(values.startVerse);
    const endVerse =
      values.endVerse === "" ? undefined : Number(values.endVerse);

    updateMutation.mutate({
      id: reading.id,
      bookId: values.bookId,
      chapter: values.chapter,
      startVerse,
      endVerse,
      translation: values.translation as any,
      date: values.date,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Reading</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="bookId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Book</FormLabel>
                  <select
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  >
                    {BIBLE_BOOKS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name="chapter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chapter</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startVerse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Verse</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Start"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endVerse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Verse</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="End"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="translation"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Translation</FormLabel>
                  <Popover
                    open={translationOpen}
                    onOpenChange={setTranslationOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={translationOpen}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? BIBLE_TRANSLATIONS.find(
                                (t) => t.id === field.value,
                              )?.name
                            : "Select translation..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[250px] p-0">
                      <Command>
                        <CommandInput placeholder="Search translation..." />
                        <CommandList>
                          <CommandEmpty>No translation found.</CommandEmpty>
                          <CommandGroup heading="German">
                            {GERMAN_TRANSLATIONS.map((translation) => (
                              <CommandItem
                                value={translation.name}
                                key={translation.id}
                                onSelect={() => {
                                  form.setValue("translation", translation.id);
                                  setTranslationOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    translation.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {translation.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          <CommandGroup heading="English">
                            {ENGLISH_TRANSLATIONS.map((translation) => (
                              <CommandItem
                                value={translation.name}
                                key={translation.id}
                                onSelect={() => {
                                  form.setValue("translation", translation.id);
                                  setTranslationOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    translation.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {translation.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          <CommandGroup heading="Ancient/Original">
                            {ANCIENT_TRANSLATIONS.map((translation) => (
                              <CommandItem
                                value={translation.name}
                                key={translation.id}
                                onSelect={() => {
                                  form.setValue("translation", translation.id);
                                  setTranslationOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    translation.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {translation.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
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
                        onSelect={field.onChange}
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
            <div className="flex justify-end">
              <Button type="submit" disabled={updateMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function ReadingHistoryList() {
  const utils = api.useUtils();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    api.bible.getReadings.useInfiniteQuery(
      { limit: 5 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const deleteMutation = api.bible.removeReading.useMutation({
    onSuccess: () => {
      toast.success("Reading deleted");
      utils.bible.getReadings.invalidate();
      utils.bible.getProgress.invalidate();
    },
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  if (isLoading) return <div className="py-4">Loading history...</div>;

  const readings = data?.pages.flatMap((page) => page.items) ?? [];

  if (readings.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center text-sm">
        No readings recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {readings.map((reading) => {
          const book = BIBLE_BOOKS.find((b) => b.id === reading.bookId);
          let reference = `${book?.name} ${reading.chapter}`;
          if (reading.startVerse) {
            reference += `:${reading.startVerse}`;
            if (reading.endVerse) {
              reference += `-${reading.endVerse}`;
            }
          }

          return (
            <div
              key={reading.id}
              className="bg-card flex flex-col gap-2 rounded-lg border p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <span className="text-muted-foreground w-24 shrink-0 text-sm">
                  {format(new Date(reading.date), "MMM d, yyyy")}
                </span>
                <span className="text-sm font-medium">{reference}</span>
              </div>
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setEditingId(reading.id)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                {editingId === reading.id && (
                  <EditReadingDialog
                    reading={reading}
                    open={true}
                    onOpenChange={(open) => {
                      if (!open) setEditingId(null);
                    }}
                  />
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="text-destructive h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Reading?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove the record for {reference}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          deleteMutation.mutate({ id: reading.id })
                        }
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        })}
      </div>
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
