'use client';

import { clsx } from 'clsx';

interface ViewerControlsProps {
  onScreenshot?: () => void;
  onReset?: () => void;
  onToggleAutoRotate?: () => void;
  isAutoRotating?: boolean;
  hasModel?: boolean;
}

/**
 * Floating control buttons for the 3D viewer.
 * Provides screenshot, reset view, and auto-rotate toggle functionality.
 */
export function ViewerControls({
  onScreenshot,
  onReset,
  onToggleAutoRotate,
  isAutoRotating = true,
  hasModel = false,
}: ViewerControlsProps) {
  const buttonBase = clsx(
    'flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200',
    'disabled:opacity-40 disabled:cursor-not-allowed'
  );

  const buttonStyle = clsx(
    buttonBase,
    'bg-surface-800/80 backdrop-blur-sm border border-surface-700',
    'hover:bg-surface-700 hover:border-surface-600',
    'active:scale-95'
  );

  return (
    <div className="absolute bottom-4 left-4 flex gap-2">
      <button
        onClick={onToggleAutoRotate}
        disabled={!hasModel}
        className={buttonStyle}
        title={isAutoRotating ? 'Stop rotation' : 'Start rotation'}
        aria-label={isAutoRotating ? 'Stop rotation' : 'Start rotation'}
      >
        <svg 
          className={clsx(
            'w-5 h-5 transition-colors',
            isAutoRotating ? 'text-accent-400' : 'text-surface-400'
          )} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
      </button>

      <button
        onClick={onReset}
        disabled={!hasModel}
        className={buttonStyle}
        title="Reset view"
        aria-label="Reset view"
      >
        <svg className="w-5 h-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
      </button>

      <button
        onClick={onScreenshot}
        disabled={!hasModel}
        className={buttonStyle}
        title="Save screenshot"
        aria-label="Save screenshot"
      >
        <svg className="w-5 h-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
          />
        </svg>
      </button>
    </div>
  );
}

export default ViewerControls;
