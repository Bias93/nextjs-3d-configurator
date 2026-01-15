## 2024-05-22 - Dark Mode Portals
**Learning:** Components using React Portals (like Tooltips) can escape the theme context if the theme class (e.g., `dark`) is applied to a layout container instead of `<html>` or `<body>`.
**Action:** Ensure global theme classes are applied at the `<html>` or `<body>` level, or wrap the Portal's destination in the theme provider. In this case, `bg-foreground` resolved to black (light mode foreground) which luckily provided contrast against the dark background, but it's an accidental win.
