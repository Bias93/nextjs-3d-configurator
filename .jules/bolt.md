# Bolt's Journal

## 2024-05-23 - React State Debounce Anti-Pattern in Controlled Components
**Learning:** Debouncing the state update of a controlled component (like a slider) causes visual lag and responsiveness issues. Specifically, if the component depends on the state it updates, and that update is delayed, the user interface feels "sticky" or "laggy".
**Action:** When throttling expensive operations triggered by UI inputs (like 3D model updates), separate the UI state (immediate) from the effect state (debounced/throttled). Alternatively, perform the expensive operation imperatively or in a `useEffect` that depends on the immediate state, but debounce the effect itself.
