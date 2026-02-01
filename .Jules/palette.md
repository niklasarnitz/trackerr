## 2026-01-31 - Handling Async Actions in Shadcn Alert Dialog
**Learning:** Shadcn's `AlertDialogAction` (Radix UI) auto-closes on click, preventing loading states (spinners) from being visible during async operations.
**Action:** Use `e.preventDefault()` in the `onClick` handler of `AlertDialogAction` to keep the dialog open. Manually close it (via controlled state) only after the async operation succeeds.
