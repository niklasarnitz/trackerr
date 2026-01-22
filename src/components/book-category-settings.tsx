"use client";

import { useState } from "react";
import type React from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";

export function BookCategorySettings() {
  const utils = api.useUtils();
  const { data: categories } = api.bookCategory.getAll.useQuery();

  const [newCategoryName, setNewCategoryName] = useState("");

  const createCategory = api.bookCategory.create.useMutation({
    onSuccess: async () => {
      toast.success("Category created");
      setNewCategoryName("");
      await utils.bookCategory.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteCategory = api.bookCategory.delete.useMutation({
    onSuccess: async () => {
      toast.success("Category deleted");
      await utils.bookCategory.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      newCategoryName.trim() &&
      !createCategory.isPending
    ) {
      createCategory.mutate({
        name: newCategoryName.trim(),
      });
    }
  };

  const handleCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategoryName(e.target.value);
  };

  const handleCreateCategory = () => {
    createCategory.mutate({
      name: newCategoryName.trim(),
    });
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategory.mutate({ id });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book Categories</CardTitle>
        <CardDescription>
          Create and manage categories for your books
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="new-category-name" className="sr-only">
              Category name
            </Label>
            <Input
              id="new-category-name"
              value={newCategoryName}
              onChange={handleCategoryNameChange}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Fiction, Technical, Biography"
            />
          </div>
          <Button
            onClick={handleCreateCategory}
            disabled={!newCategoryName.trim() || createCategory.isPending}
          >
            {createCategory.isPending ? (
              "Creating..."
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(categories ?? []).map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-2 rounded-md border px-3 py-1.5"
            >
              <span className="text-sm font-medium">{category.name}</span>
              <Badge variant="secondary" className="text-xs">
                {category._count.books}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={() => handleDeleteCategory(category.id)}
                disabled={deleteCategory.isPending}
                aria-label={`Delete ${category.name}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {(categories ?? []).length === 0 && (
            <p className="text-muted-foreground text-sm">No categories yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
