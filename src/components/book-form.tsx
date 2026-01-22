"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "~/trpc/react";
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
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Combobox } from "~/components/ui/combobox";
import { CoverUploader } from "~/components/cover-uploader";
import {
  bookCreateSchema,
  type BookCreateInput,
  type BookUpdateInput,
} from "~/lib/api-schemas";
import type { RouterOutputs } from "~/trpc/react";

// Helper type for the form data - using z.input to get the actual input type
type BookFormData = z.input<typeof bookCreateSchema>;

interface BookFormProps {
  initialData?: RouterOutputs["book"]["getById"];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BookForm({ initialData, onSuccess, onCancel }: BookFormProps) {
  const router = useRouter();
  const utils = api.useUtils();

  const { data: categories } = api.bookCategory.getAll.useQuery();

  const form = useForm<BookFormData>({
    resolver: zodResolver(bookCreateSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      subtitle: initialData?.subtitle ?? "",
      authors: initialData?.bookAuthors.map((ba) => ({
        name: ba.author.name,
        role: ba.role ?? undefined,
      })) ?? [{ name: "", role: "" }],
      description: initialData?.description ?? "",
      publisher: initialData?.publisher ?? "",
      publishedYear: initialData?.publishedYear ?? undefined,
      pages: initialData?.pages ?? undefined,
      isbn: initialData?.isbn ?? "",
      coverUrl: initialData?.coverUrl ?? "",
      seriesName: initialData?.series?.name ?? "",
      seriesNumber: initialData?.seriesNumber ?? undefined,
      isEbook: initialData?.isEbook ?? false,
      categoryId: initialData?.categoryId ?? undefined,
      notes: initialData?.notes ?? "",
      abstract: initialData?.abstract ?? "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "authors",
  });

  const createBook = api.book.create.useMutation({
    onSuccess: async () => {
      await utils.book.getAll.invalidate();
      toast.success("Book created successfully");
      router.refresh();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to create book: ${error.message}`);
    },
  });

  const updateBook = api.book.update.useMutation({
    onSuccess: async () => {
      await utils.book.getAll.invalidate();
      if (initialData) {
        await utils.book.getById.invalidate({ id: initialData.id });
      }
      toast.success("Book updated successfully");
      router.refresh();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to update book: ${error.message}`);
    },
  });

  const isPending = createBook.isPending || updateBook.isPending;

  const onSubmit = (data: BookFormData) => {
    // Filter out empty authors
    const filteredAuthors = data.authors?.filter((a) => a.name.trim() !== "");
    const finalData = { ...data, authors: filteredAuthors };

    if (initialData) {
      updateBook.mutate({
        ...finalData,
        id: initialData.id,
      } as BookUpdateInput);
    } else {
      createBook.mutate(finalData);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Book title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtitle</FormLabel>
                <FormControl>
                  <Input placeholder="Subtitle (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <FormLabel>Authors</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", role: "" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Author
              </Button>
            </div>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name={`authors.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Author name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`authors.${index}.role`}
                    render={({ field }) => (
                      <FormItem className="w-1/3">
                        <FormControl>
                          <Input placeholder="Role (e.g. Editor)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1 && index === 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="seriesName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Series Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Series (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="seriesNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Series Number</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="1"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="publisher"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publisher</FormLabel>
                  <FormControl>
                    <Input placeholder="Publisher" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="publishedYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="2024"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : undefined,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="pages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pages</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="300"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : undefined,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isbn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ISBN</FormLabel>
                  <FormControl>
                    <Input placeholder="ISBN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Combobox
                      options={
                        categories?.map((c) => ({
                          value: c.id,
                          label: c.name,
                        })) ?? []
                      }
                      value={field.value}
                      onSelect={field.onChange}
                      placeholder="Select category"
                      emptyText="No category found."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isEbook"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>E-Book</FormLabel>
                    <FormDescription>
                      This book is in digital format
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="coverUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Book Cover</FormLabel>
                <FormControl>
                  <CoverUploader
                    onImageUpload={(url) => field.onChange(url)}
                    defaultImageUrl={field.value ?? undefined}
                    onRemoveCover={() => field.onChange(null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Book description"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Personal notes"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update Book" : "Create Book"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
