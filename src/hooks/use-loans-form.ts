import { useState } from "react";

/**
 * Hook for managing loan form state
 * Handles dialog open/close and form field state
 */
export function useLoansForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [mediaEntryId, setMediaEntryId] = useState<string>("");
  const [borrowerName, setBorrowerName] = useState("");
  const [notes, setNotes] = useState("");

  const reset = () => {
    setMediaEntryId("");
    setBorrowerName("");
    setNotes("");
    setIsOpen(false);
  };

  return {
    isOpen,
    setIsOpen,
    mediaEntryId,
    setMediaEntryId,
    borrowerName,
    setBorrowerName,
    notes,
    setNotes,
    reset,
  };
}
