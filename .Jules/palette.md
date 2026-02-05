## 2026-01-31 - Handling Async Actions in Shadcn Alert Dialog
**Learning:** Shadcn's `AlertDialogAction` (Radix UI) auto-closes on click, preventing loading states (spinners) from being visible during async operations.
**Action:** Use `e.preventDefault()` in the `onClick` handler of `AlertDialogAction` to keep the dialog open. Manually close it (via controlled state) only after the async operation succeeds.

## 2025-02-18 - Making Star Ratings Speak
**Learning:** Icon-only buttons are a black hole for screen readers. A rating component without labels is just a sequence of "Button" announcements, making it impossible to rate content.
**Action:** Always add descriptive aria-labels to interactive icons, especially when they represent specific values like ratings.

## 2025-05-21 - Announcing Invisible Changes
**Learning:** For components that auto-update based on hardware input (like barcode scanners), visual updates aren't enough. Screen reader users need to know when a scan succeeds.
**Action:** Use `aria-live="polite"` on result containers to automatically announce detected values without moving focus.
