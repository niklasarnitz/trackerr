import { useCallback } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";

export function useBookMutations() {
  const utils = api.useUtils();

  const invalidateBookQueries = useCallback(() => {
    void utils.book.getAll.invalidate();
    void utils.book.getById.invalidate();
    void utils.readingProgress.getByBook.invalidate();
    void utils.bookCategory.getAll.invalidate();
  }, [utils]);

  const createBook = api.book.create.useMutation({
    onSuccess: (book) => {
      if (book) {
        toast.success(`"${book.title}" was added to your library!`);
      }
      invalidateBookQueries();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateBook = api.book.update.useMutation({
    onSuccess: () => {
      toast.success("Book updated!");
      invalidateBookQueries();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteBook = api.book.delete.useMutation({
    onSuccess: () => {
      toast.success("Book removed from library!");
      invalidateBookQueries();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addBookTag = api.book.addTag.useMutation({
    onSuccess: () => {
      toast.success("Tag added!");
      invalidateBookQueries();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeBookTag = api.book.removeTag.useMutation({
    onSuccess: () => {
      toast.success("Tag removed!");
      invalidateBookQueries();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createReadingProgress = api.readingProgress.create.useMutation({
    onSuccess: () => {
      toast.success("Reading progress updated!");
      invalidateBookQueries();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteReadingProgress = api.readingProgress.delete.useMutation({
    onSuccess: () => {
      toast.success("Reading progress deleted!");
      invalidateBookQueries();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createBookCategory = api.bookCategory.create.useMutation({
    onSuccess: () => {
      toast.success("Category created!");
      invalidateBookQueries();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateBookCategory = api.bookCategory.update.useMutation({
    onSuccess: () => {
      toast.success("Category updated!");
      invalidateBookQueries();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteBookCategory = api.bookCategory.delete.useMutation({
    onSuccess: () => {
      toast.success("Category deleted!");
      invalidateBookQueries();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    createBook,
    updateBook,
    deleteBook,
    addBookTag,
    removeBookTag,
    createReadingProgress,
    deleteReadingProgress,
    createBookCategory,
    updateBookCategory,
    deleteBookCategory,
    invalidateBookQueries,
  };
}
