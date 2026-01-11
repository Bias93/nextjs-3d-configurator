import { useEffect } from 'react';

interface ViewerShortcutsProps {
  onToggleAutoRotate: () => void;
  onReset: () => void;
  onScreenshot: () => void;
  onToggleFocus: () => void;
  isEnabled?: boolean;
}

/**
 * Hook to handle global keyboard shortcuts for the 3D viewer.
 * Shortcuts:
 * - Space: Toggle auto-rotation
 * - R: Reset view
 * - S: Take screenshot
 * - F: Toggle focus mode
 */
export function useViewerShortcuts({
  onToggleAutoRotate,
  onReset,
  onScreenshot,
  onToggleFocus,
  isEnabled = true,
}: ViewerShortcutsProps) {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or select
      const activeElement = document.activeElement;
      if (
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.tagName === 'SELECT' ||
        (activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // Ignore if modifier keys are pressed (except Shift for uppercase)
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault(); // Prevent page scrolling
          onToggleAutoRotate();
          break;
        case 'r':
          onReset();
          break;
        case 's':
          onScreenshot();
          break;
        case 'f':
          onToggleFocus();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleAutoRotate, onReset, onScreenshot, onToggleFocus, isEnabled]);
}
