"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
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
import { api } from "~/trpc/react";
import { BIBLE_BOOKS } from "~/lib/bible-data";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const formSchema = z
  .object({
    bookId: z.string().min(1, "Please select a book."),
    chapter: z.coerce
      .number()
      .min(1, { message: "Chapter must be at least 1." }),
    startVerse: z.union([z.coerce.number().min(1), z.literal("")]).optional(),
    endVerse: z.union([z.coerce.number().min(1), z.literal("")]).optional(),
    date: z.date({
      message: "A date of reading is required.",
    }),
  })
  .refine(
    (data) => {
      const start = data.startVerse ? Number(data.startVerse) : undefined;
      const end = data.endVerse ? Number(data.endVerse) : undefined;
      if (start && end) {
        return end >= start;
      }
      return true;
    },
    {
      message: "End verse must be greater than or equal to start verse",
      path: ["endVerse"],
    }
  );

type FormValues = z.infer<typeof formSchema>;

export function ReadingTrackerForm() {
  const router = useRouter();
  const utils = api.useUtils();
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      chapter: 1,
      startVerse: "",
      endVerse: "",
      date: new Date(),
    },
  });

  const selectedBookId = form.watch("bookId");
  const selectedBook = BIBLE_BOOKS.find((b) => b.id === selectedBookId);

  const createMutation = api.bible.logReading.useMutation({
    onSuccess: () => {
      toast.success("Reading logged!");
      // Reset form but keep book and increment chapter, clear verses
      form.reset({
        bookId: selectedBookId,
        chapter: (form.getValues("chapter") || 0) + 1,
        startVerse: "",
        endVerse: "",
        date: new Date(),
      });
      utils.bible.getProgress.invalidate();
      utils.bible.getReadings.invalidate();
      router.refresh();
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  function onSubmit(values: FormValues) {
    // Validate chapter count
    const book = BIBLE_BOOKS.find((b) => b.id === values.bookId);
    if (book && values.chapter > book.chapters) {
      form.setError("chapter", {
        type: "manual",
        message: `Book only has ${book.chapters} chapters.`,
      });
      return;
    }

    // Clean up verses
    const startVerse = values.startVerse === "" ? undefined : Number(values.startVerse);
    const endVerse = values.endVerse === "" ? undefined : Number(values.endVerse);

    createMutation.mutate({
      bookId: values.bookId,
      chapter: values.chapter,
      date: values.date,
      startVerse,
      endVerse,
    });
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 grid-cols-1">
            <FormField
              control={form.control}
              name="bookId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Book</FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? BIBLE_BOOKS.find(
                                (book) => book.id === field.value,
                              )?.name
                            : "Select book..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search book..." />
                        <CommandList>
                            <CommandEmpty>No book found.</CommandEmpty>
                            <CommandGroup>
                            {BIBLE_BOOKS.map((book) => (
                                <CommandItem
                                value={book.name}
                                key={book.id}
                                onSelect={() => {
                                    form.setValue("bookId", book.id);
                                    setOpen(false);
                                }}
                                >
                                <Check
                                    className={cn(
                                    "mr-2 h-4 w-4",
                                    book.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                />
                                {book.name}
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

            <div className="grid grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name="chapter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Chapter
                      {selectedBook && (
                        <span className="text-muted-foreground ml-1 text-[10px] font-normal">
                          (max {selectedBook.chapters})
                        </span>
                      )}
                    </FormLabel>
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
                    <FormLabel>Start</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Opt."
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
                    <FormLabel>End</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Opt."
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
          </div>
          <Button type="submit" className="w-full">Log Reading</Button>
        </form>
      </Form>
    </div>
  );
}
