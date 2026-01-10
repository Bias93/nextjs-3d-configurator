## 2024-05-22 - Improved Tooltip Accessibility
**Learning:** Native `title` attributes provide poor accessibility and inconsistent user experience across devices. Replacing them with Radix UI `Tooltip` components significantly improves polish and ensures screen readers handle the context correctly without relying on hover.
**Action:** When implementing icon-only buttons, always favor a dedicated `Tooltip` component over the native `title` attribute, while ensuring the button retains a descriptive `aria-label` for screen reader users who might not trigger the tooltip.
