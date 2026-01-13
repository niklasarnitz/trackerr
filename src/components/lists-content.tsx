"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

export function ListsContent() {
  const utils = api.useUtils();
  const { data, isLoading, error } = api.movieList.getAll.useQuery();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const createList = api.movieList.create.useMutation({
    onSuccess: async () => {
      toast.success("List created");
      setName("");
      setDescription("");
      setIsPublic(false);
      setOpen(false);
      await utils.movieList.getAll.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteList = api.movieList.delete.useMutation({
    onSuccess: async () => {
      toast.success("List deleted");
      await utils.movieList.getAll.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">Loading lists...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-8">{error.message}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {data?.length ?? 0} list{(data?.length ?? 0) === 1 ? "" : "s"}
        </p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New List
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create List</DialogTitle>
              <DialogDescription>
                Create a custom list and add movies to it.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isPublic}
                  onCheckedChange={(v) => setIsPublic(Boolean(v))}
                  id="list-is-public"
                />
                <label htmlFor="list-is-public" className="text-sm">
                  Public list
                </label>
              </div>

              <Button
                onClick={() =>
                  createList.mutate({
                    name: name.trim(),
                    description: description.trim()
                      ? description.trim()
                      : undefined,
                    isPublic,
                  })
                }
                disabled={!name.trim() || createList.isPending}
              >
                {createList.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(data ?? []).map((list) => (
          <Card key={list.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <Link href={`/lists/${list.id}`} className="hover:underline">
                  {list.name}
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteList.mutate({ id: list.id })}
                  disabled={deleteList.isPending}
                >
                  Delete
                </Button>
              </CardTitle>
              {list.description && (
                <CardDescription>{list.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {list._count.listEntries} movie
                {list._count.listEntries === 1 ? "" : "s"}
              </p>
            </CardContent>
          </Card>
        ))}

        {(data ?? []).length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No lists yet</CardTitle>
              <CardDescription>
                Create your first list to organize movies.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
