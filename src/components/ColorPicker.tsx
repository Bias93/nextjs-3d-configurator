'use client';

import { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';

interface MaterialColor {
  name: string;
  displayName: string;
  color: string;
}

interface ColorPickerProps {
  viewerRef: React.RefObject<HTMLDivElement | null>;
  disabled?: boolean;
}

const COLOR_PRESETS = [
  { name: 'Black', value: '#1a1a1a' },
  { name: 'White', value: '#f5f5f5' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#0d9488' },
];

/**
 * Converts HEX color to normalized RGB array (0-1 range) for glTF materials.
 */
function hexToRgbNormalized(hex: string): [number, number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1, 1];
  
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
    1,
  ];
}

/**
 * Formats material name from snake_case or camelCase to Title Case.
 */
function formatMaterialName(name: string): string {
  return name
    .replace(/[-_]/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Material color picker component for 3D models.
 * Allows users to select and apply colors to individual materials.
 */
export function ColorPicker({ viewerRef, disabled = false }: ColorPickerProps) {
  const [materials, setMaterials] = useState<MaterialColor[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadMaterials = useCallback(() => {
    const viewer = viewerRef.current?.querySelector('model-viewer') as ModelViewerElement | null;
    if (!viewer?.model) return;

    setIsLoading(true);
    
    const materialList: MaterialColor[] = viewer.model.materials.map((mat) => ({
      name: mat.name,
      displayName: formatMaterialName(mat.name),
      color: '#888888',
    }));

    setMaterials(materialList);
    if (materialList.length > 0 && !selectedMaterial) {
      setSelectedMaterial(materialList[0].name);
    }
    setIsLoading(false);
  }, [viewerRef, selectedMaterial]);

  useEffect(() => {
    const container = viewerRef.current;
    if (!container) return;

    let viewer = container.querySelector('model-viewer');
    let observer: MutationObserver | null = null;

    const handleLoad = () => {
      setTimeout(loadMaterials, 100);
    };

    const attachListeners = (el: Element) => {
      el.addEventListener('load', handleLoad);
      if ((el as ModelViewerElement).model) {
        handleLoad();
      }
    };

    if (viewer) {
      attachListeners(viewer);
    } else {
      // If viewer not found, watch for it
      observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            const newViewer = container.querySelector('model-viewer');
            if (newViewer) {
              viewer = newViewer;
              attachListeners(newViewer);
              observer?.disconnect();
              break;
            }
          }
        }
      });
      observer.observe(container, { childList: true, subtree: true });
    }

    return () => {
      if (viewer) {
        viewer.removeEventListener('load', handleLoad);
      }
      observer?.disconnect();
    };
  }, [viewerRef, loadMaterials]);

  const applyColor = useCallback((materialName: string, hexColor: string) => {
    const viewer = viewerRef.current?.querySelector('model-viewer') as ModelViewerElement | null;
    if (!viewer?.model) return;

    const material = viewer.model.materials.find(m => m.name === materialName);
    if (!material) return;

    const rgbColor = hexToRgbNormalized(hexColor);
    material.pbrMetallicRoughness.setBaseColorFactor(rgbColor);

    setMaterials(prev => prev.map(m => 
      m.name === materialName ? { ...m, color: hexColor } : m
    ));
  }, [viewerRef]);

  const handleColorSelect = useCallback((hexColor: string) => {
    if (!selectedMaterial) return;
    applyColor(selectedMaterial, hexColor);
  }, [selectedMaterial, applyColor]);

  const handleCustomColor = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedMaterial) return;
    applyColor(selectedMaterial, e.target.value);
  }, [selectedMaterial, applyColor]);

  if (disabled) {
    return null;
  }

  if (materials.length === 0) {
    return (
      <div className="space-y-3">
        <label className="block text-xs font-medium text-surface-400 uppercase tracking-wider">
          Colors
        </label>
        <p className="text-xs text-surface-500">Load a model to see available colors</p>
      </div>
    );
  }

  const currentMaterial = materials.find(m => m.name === selectedMaterial);

  return (
    <div className="space-y-4">
      <label className="block text-xs font-medium text-surface-400 uppercase tracking-wider">
        Colors
      </label>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-surface-500">
          <div className="w-4 h-4 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          Loading materials...
        </div>
      ) : (
        <>
          {materials.length > 1 && (
            <div className="space-y-2">
              <span className="text-xs text-surface-500">Select part</span>
              <div className="flex flex-wrap gap-2">
                {materials.map((mat) => (
                  <button
                    key={mat.name}
                    onClick={() => setSelectedMaterial(mat.name)}
                    className={clsx(
                      'px-3 py-1.5 text-xs rounded-md transition-all',
                      'border',
                      selectedMaterial === mat.name
                        ? 'bg-accent-500/20 border-accent-500 text-accent-400'
                        : 'bg-surface-800 border-surface-700 text-surface-300 hover:border-surface-600'
                    )}
                  >
                    {mat.displayName}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-surface-500">
                {materials.length === 1 ? materials[0].displayName : 'Choose color'}
              </span>
              {currentMaterial && (
                <div 
                  className="w-5 h-5 rounded border border-surface-600"
                  style={{ backgroundColor: currentMaterial.color }}
                />
              )}
            </div>
            
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorSelect(color.value)}
                  className={clsx(
                    'w-full aspect-square rounded-lg transition-all',
                    'border-2 hover:scale-110',
                    currentMaterial?.color === color.value
                      ? 'border-accent-400 ring-2 ring-accent-400/30'
                      : 'border-transparent hover:border-surface-500'
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  aria-label={`Select ${color.name}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="color"
                  value={currentMaterial?.color || '#888888'}
                  onChange={handleCustomColor}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                  aria-label="Custom color picker"
                />
                <span className="text-xs text-surface-500">Custom color</span>
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ColorPicker;