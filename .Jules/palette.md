## 2024-05-22 - Radix Tooltip Provider Pattern
**Learning:** The existing `Tooltip` component forces a `TooltipProvider` wrapper, preventing shared delay state for button groups.
**Action:** Use `TooltipPrimitive.Root` inside a shared `TooltipProvider` for button groups to ensure "warmup" behavior works correctly.
