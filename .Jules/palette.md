## 2024-05-22 - [Tooltip Component Nesting]
**Learning:** The `Tooltip` component (`src/components/ui/tooltip.tsx`) internally wraps `TooltipPrimitive.Root` with `TooltipProvider`. This isolates each tooltip's state, preventing the sharing of `delayDuration` across a group of tooltips (e.g., in a toolbar).
**Action:** When implementing grouped tooltips (like in `ViewerControls`), be aware that the "skip delay on hover" behavior won't work between items. Future refactoring should expose a `TooltipRoot` without the provider for grouped usage.
