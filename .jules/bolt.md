## 2024-05-22 - [Optimizing Material Lookups in ProductViewer]
**Learning:** `ProductViewer` performs `O(N)` material searches on every frame during texture transformation (drag operations).
**Action:** Implemented `materialCacheRef` to cache material lookups by slot name and moved target maps to module-level constants to prevent garbage collection churn. This reduces complexity from `O(N * M)` (where M is target names) to `O(1)` for cached lookups, critical for high-frequency events like slider dragging.
