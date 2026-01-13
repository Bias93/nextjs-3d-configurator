## 2026-01-13 - Material Caching in Model Viewer
**Learning:** Traversing `viewer.model.materials` and performing string matching (`includes`) on every frame/update is expensive, especially during slider interactions (60fps). `model-viewer`'s materials list is stable for a loaded model.
**Action:** Cache material lookups in a `Map` (keyed by slot name) within a Ref. Clear the cache only when the model source changes. This reduces material lookup from O(N*M) to O(1) for subsequent updates.
