"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MediaType } from "@prisma/client";
import { Edit2, Trash2, Save, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
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
import { api, type RouterOutputs } from "~/trpc/react";
import { toast } from "sonner";
import { mediaTypeLabels } from "../helpers/mediaTypeLabels";

type MediaEntry = RouterOutputs["mediaEntry"]["getByMovieId"][0];

interface MediaEntryCardProps {
  mediaEntry: MediaEntry;
  onUpdate?: () => void;
}

const editMediaEntrySchema = z.object({
  medium: z.enum(MediaType),
  version: z.string().optional(),
  note: z.string().optional(),
  isVirtual: z.boolean(),
  isRipped: z.boolean(),
});

type EditMediaEntryFormData = z.infer<typeof editMediaEntrySchema>;

export function MediaEntryCard({ mediaEntry, onUpdate }: MediaEntryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const form = useForm<EditMediaEntryFormData>({
    resolver: zodResolver(editMediaEntrySchema),
    defaultValues: {
      medium: mediaEntry.medium,
      version: mediaEntry.version ?? "",
      note: mediaEntry.note ?? "",
      isVirtual: mediaEntry.isVirtual,
      isRipped:
        "isRipped" in mediaEntry
          ? (mediaEntry as MediaEntry & { isRipped: boolean }).isRipped
          : false,
    },
  });

  const utils = api.useUtils();

  const updateMediaEntry = api.mediaEntry.update.useMutation({
    onSuccess: async () => {
      toast.success("Media entry updated successfully!");
      setIsEditing(false);

      // Invalidate queries to refresh the data
      await utils.mediaEntry.getByMovieId.invalidate({
        movieId: mediaEntry.movieId,
      });
      await utils.movie.getById.invalidate({ id: mediaEntry.movieId });

      onUpdate?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMediaEntry = api.mediaEntry.delete.useMutation({
    onSuccess: async () => {
      toast.success("Media entry deleted successfully!");

      // Invalidate queries to refresh the data
      await utils.mediaEntry.getByMovieId.invalidate({
        movieId: mediaEntry.movieId,
      });
      await utils.movie.getById.invalidate({ id: mediaEntry.movieId });

      onUpdate?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: EditMediaEntryFormData) => {
    updateMediaEntry.mutate({
      id: mediaEntry.id,
      ...data,
      // Convert empty strings to undefined
      version: data.version?.trim() !== "" ? data.version?.trim() : undefined,
      note: data.note?.trim() !== "" ? data.note?.trim() : undefined,
    });
  };

  const handleCancel = () => {
    form.reset({
      medium: mediaEntry.medium,
      version: mediaEntry.version ?? "",
      note: mediaEntry.note ?? "",
      isVirtual: mediaEntry.isVirtual,
      isRipped: mediaEntry.isRipped,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteMediaEntry.mutate({ id: mediaEntry.id });
    setShowDeleteDialog(false);
  };

  if (isEditing) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Edit Media Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="medium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Media Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(mediaTypeLabels).map(
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

              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Extended Edition, Director's Cut"
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
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes about this media..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`isVirtual-${mediaEntry.id}`}
                  {...form.register("isVirtual")}
                  className="rounded border-gray-300"
                />
                <label
                  htmlFor={`isVirtual-${mediaEntry.id}`}
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Virtual media
                </label>
              </div>

              {(form.watch("medium") === "BLURAY" ||
                form.watch("medium") === "BLURAY4K" ||
                form.watch("medium") === "DVD") && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`isRipped-${mediaEntry.id}`}
                    {...form.register("isRipped")}
                    className="rounded border-gray-300"
                  />
                  <label
                    htmlFor={`isRipped-${mediaEntry.id}`}
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Media has been ripped to digital files
                  </label>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateMediaEntry.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateMediaEntry.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
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
          <CardTitle className="text-lg">
            {mediaTypeLabels[mediaEntry.medium]}
          </CardTitle>
          <div className="flex gap-1">
            {mediaEntry.isVirtual && <Badge variant="outline">Virtual</Badge>}
            {!mediaEntry.isVirtual &&
              (mediaEntry.medium === "BLURAY" ||
                mediaEntry.medium === "BLURAY4K" ||
                mediaEntry.medium === "DVD") &&
              "isRipped" in mediaEntry &&
              (mediaEntry as MediaEntry & { isRipped: boolean }).isRipped && (
                <Badge variant="secondary">Ripped</Badge>
              )}
            {!mediaEntry.isVirtual &&
              (mediaEntry.medium === "BLURAY" ||
                mediaEntry.medium === "BLURAY4K" ||
                mediaEntry.medium === "DVD") &&
              (!("isRipped" in mediaEntry) ||
                !(mediaEntry as MediaEntry & { isRipped: boolean })
                  .isRipped) && <Badge variant="destructive">Not Ripped</Badge>}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              aria-label="Edit media entry"
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
                  disabled={deleteMediaEntry.isPending}
                  aria-label="Delete media entry"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete media entry?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove this media entry from your
                    collection. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleteMediaEntry.isPending}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90 text-white"
                    onClick={handleDelete}
                    disabled={deleteMediaEntry.isPending}
                  >
                    {deleteMediaEntry.isPending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        {mediaEntry.version && (
          <CardDescription>{mediaEntry.version}</CardDescription>
        )}
      </CardHeader>
      {mediaEntry.note && (
        <CardContent>
          <p className="text-muted-foreground text-sm">{mediaEntry.note}</p>
        </CardContent>
      )}
    </Card>
  );
}
