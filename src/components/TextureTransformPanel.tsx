'use client';

import { useCallback, memo } from 'react';
import { clsx } from 'clsx';
import type { TextureTransform } from '@/types/texture-transform';
import { DEFAULT_TEXTURE_TRANSFORM, TRANSFORM_LIMITS } from '@/types/texture-transform';

interface TextureTransformPanelProps {
  /** Material name being edited */
  materialName: string;
  /** Current transform values */
  transform: TextureTransform;
  /** Callback when a property changes */
  onTransformChange: (property: keyof TextureTransform, value: number) => void;
  /** Callback to reset transform */
  onReset: () => void;
  /** Whether the panel is disabled */
  disabled?: boolean;
}

/**
 * Panel with sliders for adjusting texture UV offset, scale, and rotation.
 */
export const TextureTransformPanel = memo(function TextureTransformPanel({
  materialName,
  transform,
  onTransformChange,
  onReset,
  disabled = false,
}: TextureTransformPanelProps) {
  const isDefault = 
    transform.offsetU === DEFAULT_TEXTURE_TRANSFORM.offsetU &&
    transform.offsetV === DEFAULT_TEXTURE_TRANSFORM.offsetV &&
    transform.scaleU === DEFAULT_TEXTURE_TRANSFORM.scaleU &&
    transform.scaleV === DEFAULT_TEXTURE_TRANSFORM.scaleV &&
    transform.rotation === DEFAULT_TEXTURE_TRANSFORM.rotation;

  const sliderClass = clsx(
    'w-full h-1.5 rounded-full appearance-none cursor-pointer',
    'bg-surface-700',
    '[&::-webkit-slider-thumb]:appearance-none',
    '[&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3',
    '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-500',
    '[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer',
    '[&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150',
    '[&::-webkit-slider-thumb]:hover:bg-accent-400 [&::-webkit-slider-thumb]:hover:scale-110',
    disabled && 'opacity-50 cursor-not-allowed'
  );

  const labelClass = 'text-[10px] font-bold text-surface-400 uppercase tracking-wider';
  const valueClass = 'text-xs font-mono text-surface-300 tabular-nums w-14 text-right';
  const sectionClass = 'space-y-3';
  const rowClass = 'flex items-center gap-3';

  return (
    <div className={clsx(
      'p-4 rounded-xl bg-surface-900/50 border border-surface-700/50',
      disabled && 'opacity-50 pointer-events-none'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <span className="text-xs font-bold text-surface-200 uppercase tracking-wider">
            Texture Transform
          </span>
        </div>
        {!isDefault && (
          <button
            onClick={onReset}
            disabled={disabled}
            className="text-[10px] font-bold text-surface-500 hover:text-accent-400 transition-colors uppercase"
          >
            Reset
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* Offset Section */}
        <div className={sectionClass}>
          <div className="text-[9px] font-bold text-surface-500 uppercase tracking-widest mb-2">
            Position (Offset)
          </div>
          
          {/* Offset U */}
          <div className={rowClass}>
            <label className={labelClass} style={{ width: '24px' }}>U</label>
            <input
              type="range"
              min={TRANSFORM_LIMITS.offset.min}
              max={TRANSFORM_LIMITS.offset.max}
              step={TRANSFORM_LIMITS.offset.step}
              value={transform.offsetU}
              onChange={(e) => onTransformChange('offsetU', parseFloat(e.target.value))}
              disabled={disabled}
              className={sliderClass}
            />
            <span className={valueClass}>{transform.offsetU.toFixed(2)}</span>
          </div>

          {/* Offset V */}
          <div className={rowClass}>
            <label className={labelClass} style={{ width: '24px' }}>V</label>
            <input
              type="range"
              min={TRANSFORM_LIMITS.offset.min}
              max={TRANSFORM_LIMITS.offset.max}
              step={TRANSFORM_LIMITS.offset.step}
              value={transform.offsetV}
              onChange={(e) => onTransformChange('offsetV', parseFloat(e.target.value))}
              disabled={disabled}
              className={sliderClass}
            />
            <span className={valueClass}>{transform.offsetV.toFixed(2)}</span>
          </div>
        </div>

        {/* Scale Section */}
        <div className={sectionClass}>
          <div className="text-[9px] font-bold text-surface-500 uppercase tracking-widest mb-2">
            Scale (Tiling)
          </div>
          
          {/* Scale U */}
          <div className={rowClass}>
            <label className={labelClass} style={{ width: '24px' }}>U</label>
            <input
              type="range"
              min={TRANSFORM_LIMITS.scale.min}
              max={TRANSFORM_LIMITS.scale.max}
              step={TRANSFORM_LIMITS.scale.step}
              value={transform.scaleU}
              onChange={(e) => onTransformChange('scaleU', parseFloat(e.target.value))}
              disabled={disabled}
              className={sliderClass}
            />
            <span className={valueClass}>{transform.scaleU.toFixed(1)}x</span>
          </div>

          {/* Scale V */}
          <div className={rowClass}>
            <label className={labelClass} style={{ width: '24px' }}>V</label>
            <input
              type="range"
              min={TRANSFORM_LIMITS.scale.min}
              max={TRANSFORM_LIMITS.scale.max}
              step={TRANSFORM_LIMITS.scale.step}
              value={transform.scaleV}
              onChange={(e) => onTransformChange('scaleV', parseFloat(e.target.value))}
              disabled={disabled}
              className={sliderClass}
            />
            <span className={valueClass}>{transform.scaleV.toFixed(1)}x</span>
          </div>
        </div>

        {/* Rotation Section */}
        <div className={sectionClass}>
          <div className="text-[9px] font-bold text-surface-500 uppercase tracking-widest mb-2">
            Rotation
          </div>
          
          <div className={rowClass}>
            <label className={labelClass} style={{ width: '24px' }}>°</label>
            <input
              type="range"
              min={TRANSFORM_LIMITS.rotation.min}
              max={TRANSFORM_LIMITS.rotation.max}
              step={TRANSFORM_LIMITS.rotation.step}
              value={transform.rotation}
              onChange={(e) => onTransformChange('rotation', parseFloat(e.target.value))}
              disabled={disabled}
              className={sliderClass}
            />
            <span className={valueClass}>{Math.round(transform.rotation)}°</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TextureTransformPanel;
