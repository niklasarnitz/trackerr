"use client";

import { useState } from "react";
import { BookOpen, CheckCircle, Circle, MoreHorizontal } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Progress } from "~/components/ui/progress";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface ReadingProgressProps {
  bookId: string;
  status: "UNREAD" | "READING" | "READ";
  totalPages: number | null;
  currentPage: number;
}

export function ReadingProgress({
  bookId,
  status,
  totalPages,
  currentPage,
}: ReadingProgressProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const [open, setOpen] = useState(false);
  const [pagesRead, setPagesRead] = useState(currentPage.toString());

  const progressPercentage =
    totalPages && currentPage
      ? Math.round((currentPage / totalPages) * 100)
      : 0;

  const hasProgress = currentPage > 0;
  const progressLabel = (() => {
    if (!hasProgress) return "Not started";
    if (totalPages)
      return `${progressPercentage}% · ${currentPage}/${totalPages}`;
    return `${currentPage} page${currentPage === 1 ? "" : "s"} logged`;
  })();

  const createProgress = api.readingProgress.create.useMutation({
    onSuccess: async () => {
      await utils.book.getById.invalidate({ id: bookId });
      await utils.book.getAll.invalidate();
      toast.success("Progress updated");
      setOpen(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleUpdateProgress = () => {
    const pages = parseInt(pagesRead);
    if (isNaN(pages) || pages < 0) {
      toast.error("Please enter a valid page number");
      return;
    }

    if (totalPages && pages > totalPages) {
      toast.error(`Pages read cannot exceed total pages (${totalPages})`);
      return;
    }

    createProgress.mutate({
      bookId,
      pagesRead: pages,
    });
  };

  const handleStatusChange = (newStatus: "UNREAD" | "READING" | "READ") => {
    if (newStatus === "UNREAD") {
      createProgress.mutate({ bookId, pagesRead: 0 });
    } else if (newStatus === "READ" && totalPages) {
      createProgress.mutate({ bookId, pagesRead: totalPages });
    } else {
      // For READING, seed progress with page 1 to move status off UNREAD
      const firstPage = 1;
      setPagesRead(firstPage.toString());
      createProgress.mutate({ bookId, pagesRead: firstPage });
      setOpen(true);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Reading Progress</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleStatusChange("UNREAD")}>
              Mark as Unread
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange("READING")}>
              Mark as Reading
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange("READ")}>
              Mark as Read
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-4">
        {status === "UNREAD" && (
          <div className="text-muted-foreground flex items-center gap-2">
            <Circle className="h-5 w-5" />
            <span>Not Started</span>
          </div>
        )}
        {status === "READING" && (
          <div className="flex items-center gap-2 text-blue-500">
            <BookOpen className="h-5 w-5" />
            <span>Reading</span>
          </div>
        )}
        {status === "READ" && (
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle className="h-5 w-5" />
            <span>Finished</span>
          </div>
        )}

        {hasProgress && (
          <div className="text-muted-foreground ml-auto text-sm">
            {progressLabel}
          </div>
        )}
      </div>

      {hasProgress && totalPages && (
        <Progress value={progressPercentage} className="h-2" />
      )}

      <div className="flex gap-2">
        {status === "UNREAD" && (
          <Button
            className="w-full"
            onClick={() => handleStatusChange("READING")}
          >
            Start Reading
          </Button>
        )}

        {status === "READING" && (
          <>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1" variant="outline">
                  Log Progress
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Progress</DialogTitle>
                  <DialogDescription>
                    Update the number of pages you have read.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pages" className="text-right">
                      Pages Read
                    </Label>
                    <Input
                      id="pages"
                      value={pagesRead}
                      onChange={(e) => setPagesRead(e.target.value)}
                      type="number"
                      className="col-span-3"
                    />
                  </div>
                  {totalPages && (
                    <div className="text-muted-foreground text-center text-sm">
                      Total Pages: {totalPages}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleUpdateProgress}
                    disabled={createProgress.isPending}
                  >
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              className="flex-1"
              onClick={() => handleStatusChange("READ")}
            >
              Finish Book
            </Button>
          </>
        )}

        {status === "READ" && (
          <Button
            className="w-full"
            variant="outline"
            onClick={() => handleStatusChange("READING")}
          >
            Read Again
          </Button>
        )}
      </div>
    </div>
  );
}
