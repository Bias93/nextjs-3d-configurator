'use client';

import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { clsx } from 'clsx';

interface TextureUploaderProps {
  onTextureSelect: (textureUrl: string, file: File, slotName: string) => void;
  disabled?: boolean;
  currentTextures?: Record<string, string>;
  availableMaterials?: string[];
}

const TEXTURE_SLOTS = [
  { id: 'logo_1', label: 'Logo 1' },
  { id: 'logo_2', label: 'Logo 2' },
  { id: 'logo_3', label: 'Logo 3' },
];

/**
 * Texture upload component with drag-and-drop support.
 * Accepts JPG, PNG, and WebP image formats.
 */
export function TextureUploader({ 
  onTextureSelect, 
  disabled = false,
  currentTextures,
  availableMaterials = []
}: TextureUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>('logo_1');
  const inputRef = useRef<HTMLInputElement>(null);

  // Smart Detection Logic
  const mode = useMemo(() => {
    if (availableMaterials.length === 0) return 'standard'; // Default/Loading
    
    // Check if any standard slot names exist in the model
    // Standard names mapped from ProductViewer: logo, front, back, decals, etc.
    const standardKeywords = ['logo', 'front', 'back', 'sleeve', 'decals'];
    const hasStandardSlots = availableMaterials.some(mat => 
      standardKeywords.some(kw => mat.toLowerCase().includes(kw))
    );

    return hasStandardSlots ? 'standard' : 'custom';
  }, [availableMaterials]);

  // Reset selection when mode changes or materials load
  useEffect(() => {
    if (mode === 'custom' && availableMaterials.length > 0) {
      // Default to first material if current selection is not in list (or is a standard slot name)
      if (!availableMaterials.includes(selectedSlot)) {
        setSelectedSlot(availableMaterials[0]);
      }
    } else if (mode === 'standard') {
       if (!TEXTURE_SLOTS.some(s => s.id === selectedSlot)) {
         setSelectedSlot('logo_1');
       }
    }
  }, [mode, availableMaterials, selectedSlot]);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP)');
      return;
    }

    const url = URL.createObjectURL(file);
    onTextureSelect(url, file, selectedSlot);
  }, [onTextureSelect, selectedSlot]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [disabled, processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  }, [processFile]);

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  // Determine the texture for the currently selected slot
  const currentSlotTexture = currentTextures ? currentTextures[selectedSlot] : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-1 h-1 rounded-full bg-accent-500/50" />
        <label className="text-[10px] font-bold text-surface-400 uppercase tracking-[0.2em]">
          Texture Appearance
        </label>
      </div>

      <div className="flex p-1 bg-surface-900/50 rounded-lg mb-3">
        {mode === 'standard' ? (
          TEXTURE_SLOTS.map((slot) => (
            <button
              key={slot.id}
              onClick={() => setSelectedSlot(slot.id)}
              className={clsx(
                'flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all',
                selectedSlot === slot.id
                  ? 'bg-surface-800 text-accent-400 shadow-sm'
                  : 'text-surface-500 hover:text-surface-300'
              )}
            >
              {slot.label}
            </button>
          ))
        ) : (
          <div className="w-full px-2 py-1">
             <label className="text-[9px] text-surface-500 uppercase font-bold px-1 mb-1 block">
               Target Material
             </label>
             <select 
               value={selectedSlot}
               onChange={(e) => setSelectedSlot(e.target.value)}
               className="w-full bg-surface-800 text-surface-200 text-xs rounded-md border-none p-2 focus:ring-1 focus:ring-accent-500"
               disabled={disabled}
             >
               {availableMaterials.map(mat => (
                 <option key={mat} value={mat}>{mat}</option>
               ))}
             </select>
          </div>
        )}
      </div>

      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={clsx(
          'relative rounded-lg border-2 border-dashed transition-all duration-200',
          'flex flex-col items-center justify-center min-h-[140px]',
          disabled
            ? 'opacity-50 cursor-not-allowed border-surface-700 bg-surface-900/50'
            : 'group/texture cursor-pointer border-surface-700 bg-surface-900/50 hover:border-surface-500 hover:bg-surface-800/50',
          isDragOver && !disabled && 'border-accent-500 bg-accent-500/10'
        )}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload texture image"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          disabled={disabled}
          className="sr-only"
        />

        {currentSlotTexture ? (
          <div className="relative group w-full h-full">
            <img
              src={currentSlotTexture}
              alt="Texture preview"
              className="w-full h-full object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change Texture</span>
            </div>
          </div>
        ) : (
          <>
            <div className={clsx(
              'w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-colors',
              isDragOver ? 'bg-accent-500/20' : 'bg-surface-800 group-hover/texture:bg-surface-700'
            )}>
              <svg 
                className={clsx(
                  'w-6 h-6 transition-colors',
                  isDragOver ? 'text-accent-400' : 'text-surface-400 group-hover/texture:text-surface-300'
                )} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <p className="text-sm text-surface-300 text-center">
              {isDragOver ? 'Drop to upload' : 'Drag or click'}
            </p>
            <p className="text-xs text-surface-500 mt-1">
              JPG, PNG, WebP
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default TextureUploader;
