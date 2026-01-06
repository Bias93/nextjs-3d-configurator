import { useEffect } from 'react';

interface UseViewerShortcutsProps {
  onToggleAutoRotate: () => void;
  onReset: () => void;
  onScreenshot: () => void;
  onToggleFocus: () => void;
  hasModel: boolean;
}

export function useViewerShortcuts({
  onToggleAutoRotate,
  onReset,
  onScreenshot,
  onToggleFocus,
  hasModel,
}: UseViewerShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;

      // Ignore if user is typing in an input, textarea, or contentEditable
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      ) {
        return;
      }

      // Ignore Space key on buttons and links to preserve accessibility
      if (
        event.key === ' ' &&
        (target.tagName === 'BUTTON' ||
         target.tagName === 'A' ||
         target.role === 'button' ||
         target.role === 'link')
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case ' ':
          if (hasModel) {
            event.preventDefault(); // Prevent scrolling
            onToggleAutoRotate();
          }
          break;
        case 'r':
          if (hasModel) {
            onReset();
          }
          break;
        case 's':
          if (hasModel) {
            event.preventDefault(); // Prevent save page
            onScreenshot();
          }
          break;
        case 'f':
          onToggleFocus();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleAutoRotate, onReset, onScreenshot, onToggleFocus, hasModel]);
}
