## 2024-05-24 - Hook Return Memoization
**Learning:** Custom hooks (like `useDecalTransform`, `useTextureTransform`) that return object literals `{ ...state, functions }` break referential equality on every render, defeating `React.memo` on consuming components.
**Action:** Always wrap the return value of such hooks in `useMemo` when they are used by memoized components, ensuring dependencies are correctly listed.
