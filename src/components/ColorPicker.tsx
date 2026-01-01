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

// Palette colori predefinita
const COLOR_PRESETS = [
  { name: 'Nero', value: '#1a1a1a' },
  { name: 'Bianco', value: '#f5f5f5' },
  { name: 'Rosso', value: '#dc2626' },
  { name: 'Blu', value: '#2563eb' },
  { name: 'Verde', value: '#16a34a' },
  { name: 'Arancio', value: '#ea580c' },
  { name: 'Giallo', value: '#eab308' },
  { name: 'Viola', value: '#9333ea' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Teal', value: '#0d9488' },
];

// Converte HEX in RGB normalizzato (0-1)
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

export function ColorPicker({ viewerRef, disabled = false }: ColorPickerProps) {
  const [materials, setMaterials] = useState<MaterialColor[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Carica lista materiali dal modello
  const loadMaterials = useCallback(() => {
    const viewer = viewerRef.current?.querySelector('model-viewer') as ModelViewerElement | null;
    if (!viewer?.model) return;

    setIsLoading(true);
    
    const materialList: MaterialColor[] = viewer.model.materials.map((mat) => ({
      name: mat.name,
      displayName: formatMaterialName(mat.name),
      color: '#888888', // Default
    }));

    setMaterials(materialList);
    if (materialList.length > 0 && !selectedMaterial) {
      setSelectedMaterial(materialList[0].name);
    }
    setIsLoading(false);
  }, [viewerRef, selectedMaterial]);

  // Formatta nome materiale per display
  function formatMaterialName(name: string): string {
    return name
      .replace(/[-_]/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Ascolta evento load del model-viewer
  useEffect(() => {
    const viewer = viewerRef.current?.querySelector('model-viewer');
    if (!viewer) return;

    const handleLoad = () => {
      // Piccolo delay per assicurarsi che il modello sia pronto
      setTimeout(loadMaterials, 100);
    };

    viewer.addEventListener('load', handleLoad);
    
    // Se già caricato
    if ((viewer as ModelViewerElement).model) {
      handleLoad();
    }

    return () => {
      viewer.removeEventListener('load', handleLoad);
    };
  }, [viewerRef, loadMaterials]);

  // Applica colore al materiale
  const applyColor = useCallback((materialName: string, hexColor: string) => {
    const viewer = viewerRef.current?.querySelector('model-viewer') as ModelViewerElement | null;
    if (!viewer?.model) return;

    const material = viewer.model.materials.find(m => m.name === materialName);
    if (!material) return;

    const rgbColor = hexToRgbNormalized(hexColor);
    material.pbrMetallicRoughness.setBaseColorFactor(rgbColor);

    // Aggiorna stato locale
    setMaterials(prev => prev.map(m => 
      m.name === materialName ? { ...m, color: hexColor } : m
    ));
  }, [viewerRef]);

  // Gestisci selezione colore
  const handleColorSelect = useCallback((hexColor: string) => {
    if (!selectedMaterial) return;
    applyColor(selectedMaterial, hexColor);
  }, [selectedMaterial, applyColor]);

  // Gestisci input colore custom
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
          Colori
        </label>
        <p className="text-xs text-surface-500">Carica un modello per vedere i colori disponibili</p>
      </div>
    );
  }

  const currentMaterial = materials.find(m => m.name === selectedMaterial);

  return (
    <div className="space-y-4">
      <label className="block text-xs font-medium text-surface-400 uppercase tracking-wider">
        Colori
      </label>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-surface-500">
          <div className="w-4 h-4 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          Caricamento materiali...
        </div>
      ) : (
        <>
          {/* Selettore materiale */}
          {materials.length > 1 && (
            <div className="space-y-2">
              <span className="text-xs text-surface-500">Parte da colorare</span>
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

          {/* Palette colori */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-surface-500">
                {materials.length === 1 ? materials[0].displayName : 'Scegli colore'}
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
                />
              ))}
            </div>

            {/* Color picker custom */}
            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="color"
                  value={currentMaterial?.color || '#888888'}
                  onChange={handleCustomColor}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs text-surface-500">Colore personalizzato</span>
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ColorPicker;