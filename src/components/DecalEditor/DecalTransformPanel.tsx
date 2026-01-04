'use client';

import type { DecalTransform } from '@/types/decal';

interface DecalTransformPanelProps {
  /** Current transform values */
  transform: DecalTransform;
  /** Callback when transform changes */
  onChange: (transform: DecalTransform) => void;
}

/**
 * Overlay panel showing current transform values with numeric inputs.
 */
export function DecalTransformPanel({ transform, onChange }: DecalTransformPanelProps) {
  const labelClass = 'text-[10px] font-bold text-surface-400 uppercase tracking-wider';
  const inputClass = `
    w-16 px-2 py-1 text-xs font-mono text-surface-200 
    bg-surface-800 border border-surface-700 rounded
    focus:outline-none focus:border-accent-500
  `;

  return (
    <div className="absolute bottom-6 left-6 p-4 rounded-2xl glass border border-surface-700/50">
      <div className="text-[9px] font-bold text-surface-500 uppercase tracking-widest mb-3">
        Transform Values
      </div>

      <div className="space-y-3">
        {/* Position */}
        <div>
          <div className={labelClass}>Position</div>
          <div className="flex gap-2 mt-1">
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-red-400 font-bold">X</span>
              <input
                type="number"
                step="0.01"
                value={transform.position[0].toFixed(2)}
                onChange={(e) => onChange({
                  ...transform,
                  position: [parseFloat(e.target.value) || 0, transform.position[1], transform.position[2]]
                })}
                className={inputClass}
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-green-400 font-bold">Y</span>
              <input
                type="number"
                step="0.01"
                value={transform.position[1].toFixed(2)}
                onChange={(e) => onChange({
                  ...transform,
                  position: [transform.position[0], parseFloat(e.target.value) || 0, transform.position[2]]
                })}
                className={inputClass}
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-blue-400 font-bold">Z</span>
              <input
                type="number"
                step="0.01"
                value={transform.position[2].toFixed(2)}
                onChange={(e) => onChange({
                  ...transform,
                  position: [transform.position[0], transform.position[1], parseFloat(e.target.value) || 0]
                })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Rotation */}
        <div>
          <div className={labelClass}>Rotation (°)</div>
          <div className="flex gap-2 mt-1">
            <input
              type="number"
              step="5"
              value={Math.round((transform.rotation[2] * 180) / Math.PI)}
              onChange={(e) => {
                const degrees = parseFloat(e.target.value) || 0;
                const radians = (degrees * Math.PI) / 180;
                onChange({
                  ...transform,
                  rotation: [transform.rotation[0], transform.rotation[1], radians]
                });
              }}
              className={inputClass}
            />
          </div>
        </div>

        {/* Scale */}
        <div>
          <div className={labelClass}>Scale</div>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="range"
              min="0.05"
              max="2"
              step="0.05"
              value={transform.scale}
              onChange={(e) => onChange({
                ...transform,
                scale: parseFloat(e.target.value)
              })}
              className="w-20 h-1.5 rounded-full appearance-none cursor-pointer bg-surface-700
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-500"
            />
            <span className="text-xs font-mono text-surface-300 w-12">
              {transform.scale.toFixed(2)}x
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DecalTransformPanel;
