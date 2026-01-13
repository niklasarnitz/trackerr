"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
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
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { useMovieMutations } from "~/hooks/use-movie-mutations";
import {
  mediaEntrySchema,
  MEDIA_TYPES,
  type MediaEntryFormData,
} from "~/lib/form-schemas";

interface MediaEntryFormProps {
  movieId: string;
  onSuccess?: () => void;
}

export function MediaEntryForm({ movieId, onSuccess }: MediaEntryFormProps) {
  const { createMediaEntry } = useMovieMutations();

  const form = useForm<MediaEntryFormData>({
    resolver: zodResolver(mediaEntrySchema),
    defaultValues: {
      medium: "BLURAY",
      version: "",
      note: "",
      isVirtual: false,
      isRipped: false,
    },
  });

  const handleSubmit = async (data: MediaEntryFormData) => {
    try {
      await createMediaEntry.mutateAsync({
        movieId,
        ...data,
        version: data.version ?? undefined,
        note: data.note ?? undefined,
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create media entry:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="medium"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Media Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select media type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(MEDIA_TYPES).map(([value, label]) => (
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
          name="isVirtual"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-y-0 space-x-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Virtual/Digital Media</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {(form.watch("medium") === "BLURAY" ||
          form.watch("medium") === "BLURAY4K" ||
          form.watch("medium") === "DVD") && (
          <FormField
            control={form.control}
            name="isRipped"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Media Ripped</FormLabel>
                  <p className="text-muted-foreground text-sm">
                    Check if you have ripped this physical media to digital
                    files
                  </p>
                </div>
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="version"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Version (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Director's Cut, Extended Edition"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes..."
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
          disabled={createMediaEntry.isPending}
        >
          {createMediaEntry.isPending ? "Adding..." : "Add Media Entry"}
        </Button>
      </form>
    </Form>
  );
}
