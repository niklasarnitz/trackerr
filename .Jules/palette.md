## 2026-01-31 - Handling Async Actions in Shadcn Alert Dialog
**Learning:** Shadcn's `AlertDialogAction` (Radix UI) auto-closes on click, preventing loading states (spinners) from being visible during async operations.
**Action:** Use `e.preventDefault()` in the `onClick` handler of `AlertDialogAction` to keep the dialog open. Manually close it (via controlled state) only after the async operation succeeds.

## 2025-02-18 - Making Star Ratings Speak
**Learning:** Icon-only buttons are a black hole for screen readers. A rating component without labels is just a sequence of "Button" announcements, making it impossible to rate content.
**Action:** Always add descriptive aria-labels to interactive icons, especially when they represent specific values like ratings.

## 2026-02-06 - Composing Tooltips with Radix Triggers
**Learning:** When adding tooltips to buttons that are already triggers for other Radix primitives (DropdownMenu, AlertDialog), wrap the existing Trigger in the TooltipTrigger using `asChild`. The order should be Tooltip > TooltipTrigger > [Other]Trigger > Button. This ensures both hover (tooltip) and click ([Other]) events work correctly.
**Action:** Apply this nesting pattern whenever enhancing existing interactive elements with tooltips.

## 2026-03-01 - Keyboard Visibility for Overlay Actions
**Learning:** Using `opacity-0 group-hover:opacity-100` for overlay actions makes them invisible to keyboard users when they tab into the container. They can focus the buttons but can't see them.
**Action:** Always add `group-focus-within:opacity-100` alongside `group-hover:opacity-100` for overlay containers to ensure actions become visible when focused via keyboard.
