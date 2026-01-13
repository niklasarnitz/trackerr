"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useLoansForm } from "~/hooks/use-loans-form";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

export function LoansContent() {
  const utils = api.useUtils();
  const {
    isOpen,
    setIsOpen,
    mediaEntryId,
    setMediaEntryId,
    borrowerName,
    setBorrowerName,
    notes,
    setNotes,
    reset,
  } = useLoansForm();

  const { data: loans, isLoading, error } = api.loan.getAll.useQuery();
  const { data: mediaEntries } = api.mediaEntry.getAll.useQuery({
    skip: 0,
    limit: 100,
  });

  const createLoan = api.loan.create.useMutation({
    onSuccess: async () => {
      toast.success("Loan created");
      reset();
      await utils.loan.getAll.invalidate();
      await utils.loan.getActive.invalidate();
    },
    onError: (e) =>
      toast.error(e.message || "Unable to create loan. Please try again."),
  });

  const updateLoan = api.loan.update.useMutation({
    onSuccess: async () => {
      toast.success("Loan updated");
      await utils.loan.getAll.invalidate();
      await utils.loan.getActive.invalidate();
    },
    onError: (e) =>
      toast.error(e.message || "Unable to update loan. Please try again."),
  });

  const deleteLoan = api.loan.delete.useMutation({
    onSuccess: async () => {
      toast.success("Loan deleted");
      await utils.loan.getAll.invalidate();
      await utils.loan.getActive.invalidate();
    },
    onError: (e) =>
      toast.error(e.message || "Unable to delete loan. Please try again."),
  });

  const mediaEntryOptions = useMemo(() => {
    return (mediaEntries?.mediaEntries ?? [])
      .filter((m) => m.movie)
      .map((m) => ({
        id: m.id,
        label: `${m.movie?.title ?? ""} (${m.medium}${m.isVirtual ? ", virtual" : ""})`,
      }));
  }, [mediaEntries]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">Loading loans...</CardContent>
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
          {loans?.length ?? 0} loan{(loans?.length ?? 0) === 1 ? "" : "s"}
        </p>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>New Loan</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Loan</DialogTitle>
              <DialogDescription>
                Select a media item and who you loaned it to.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Media entry</label>
                <Select value={mediaEntryId} onValueChange={setMediaEntryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {mediaEntryOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Borrower name</label>
                <Input
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button
                onClick={() =>
                  createLoan.mutate({
                    mediaEntryId,
                    borrowerName: borrowerName.trim(),
                    ...(notes.trim() ? { notes: notes.trim() } : {}),
                  })
                }
                disabled={
                  !mediaEntryId || !borrowerName.trim() || createLoan.isPending
                }
              >
                {createLoan.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {(loans ?? []).map((loan) => (
          <Card key={loan.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {loan.mediaEntry.movie?.title ?? "(Missing movie)"} {" "}
                  {loan.borrowerName}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteLoan.mutate({ id: loan.id })}
                  disabled={deleteLoan.isPending}
                >
                  Delete
                </Button>
              </CardTitle>
              <CardDescription>
                {loan.mediaEntry.medium}
                {loan.returnedAt ? "  Returned" : "  Active"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {!loan.returnedAt && (
                <Button
                  size="sm"
                  onClick={() =>
                    updateLoan.mutate({ id: loan.id, returnedAt: new Date() })
                  }
                  disabled={updateLoan.isPending}
                >
                  Mark returned
                </Button>
              )}
              {loan.returnedAt && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updateLoan.mutate({ id: loan.id, returnedAt: null })
                  }
                  disabled={updateLoan.isPending}
                >
                  Mark active
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {(loans ?? []).length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No loans</CardTitle>
              <CardDescription>
                Create a loan to start tracking.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
