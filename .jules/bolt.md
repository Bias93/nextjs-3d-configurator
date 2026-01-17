## 2024-05-23 - Material Lookup Caching
**Learning:** `ProductViewer` performs material lookups by name on every frame during texture transformation (drag events), which is O(N).
**Action:** Use `materialCacheRef` (Map) to cache these lookups, keyed by slot name, and clear the cache when `modelSrc` changes.
