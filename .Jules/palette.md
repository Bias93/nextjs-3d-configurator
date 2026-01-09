## 2024-03-24 - [Mobile Interactive Elements]
**Learning:** On mobile devices, interactive elements like buttons inside overlays (like a mobile drawer) need sufficient touch targets and should not rely on hover states.
**Action:** Ensure all mobile interactive elements have at least 44x44px touch targets and use visible active states instead of just hover.

## 2024-03-24 - [Keyboard Navigation in Canvas]
**Learning:** 3D canvases often trap keyboard focus.
**Action:** Ensure there's a way to escape the canvas focus (e.g., using specific key or ensuring tab index is managed) or provide clear instructions.

## 2024-03-24 - [Tooltip Consistency]
**Learning:** Using native `title` attributes for tooltips is inconsistent and inaccessible for keyboard users. Radix UI Tooltips provide a superior experience but require wrapping triggers with `asChild` to preserve semantics.
**Action:** Replace all icon-only button `title` attributes with the `Tooltip` component pattern, encapsulated in a reusable helper if necessary.
