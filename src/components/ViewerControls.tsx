'use client';

import { clsx } from 'clsx';

interface ViewerControlsProps {
  onScreenshot?: () => void;
  onReset?: () => void;
  onToggleAutoRotate?: () => void;
  onActivateAR?: () => void;
  onToggleFocus?: () => void;
  isAutoRotating?: boolean;
  isFocusMode?: boolean;
  hasModel?: boolean;
  canAR?: boolean;
}

/**
 * Floating control buttons for the 3D viewer.
 * Provides screenshot, reset view, auto-rotate toggle, focus mode and AR functionality.
 */
export function ViewerControls({
  onScreenshot,
  onReset,
  onToggleAutoRotate,
  onActivateAR,
  onToggleFocus,
  isAutoRotating = true,
  isFocusMode = false,
  hasModel = false,
  canAR = false,
}: ViewerControlsProps) {
  const buttonStyle = clsx(
    'flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300',
    'bg-surface-900/40 backdrop-blur-md border border-surface-700/50 shadow-xl',
    'hover:bg-surface-800/60 hover:border-surface-600 hover:scale-105',
    'active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed'
  );

  return (
    <div className="absolute bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 lg:left-auto lg:right-6 lg:translate-x-0 flex items-center gap-3 z-50 p-2 rounded-2xl glass border-surface-800/30 pointer-events-auto">
      <button
        onClick={onToggleAutoRotate}
        disabled={!hasModel}
        className={clsx(buttonStyle, isAutoRotating && 'text-accent-400 bg-accent-400/10 border-accent-400/30')}
        title={isAutoRotating ? 'Stop rotation' : 'Start rotation'}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      <button
        onClick={onReset}
        disabled={!hasModel}
        className={buttonStyle}
        title="Reset view"
      >
        <svg className="w-5 h-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      <button
        onClick={onScreenshot}
        disabled={!hasModel}
        className={buttonStyle}
        title="Save screenshot"
      >
        <svg className="w-5 h-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <button
        onClick={onToggleFocus}
        className={clsx(buttonStyle, isFocusMode && 'text-accent-400 bg-accent-400/10 border-accent-400/30')}
        title={isFocusMode ? 'Show UI' : 'Hide UI (Focus Mode)'}
      >
        {isFocusMode ? (
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
          </svg>
        )}
      </button>

      {canAR && (
        <button
          onClick={onActivateAR}
          disabled={!hasModel}
          className={clsx(
            buttonStyle,
            'lg:hidden',
            'bg-linear-to-br from-accent-400 to-accent-600 border-accent-400/50 hover:from-accent-300 hover:to-accent-500',
            'shadow-lg shadow-accent-500/25 text-surface-950'
          )}
          title="View in AR"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default ViewerControls;
