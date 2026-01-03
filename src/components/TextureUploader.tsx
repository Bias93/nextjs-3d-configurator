'use client';

import { useCallback, useState, useRef } from 'react';
import { clsx } from 'clsx';

interface TextureUploaderProps {
  onTextureSelect: (textureUrl: string, file: File) => void;
  disabled?: boolean;
  currentTexture?: string | null;
}

/**
 * Texture upload component with drag-and-drop support.
 * Accepts JPG, PNG, and WebP image formats.
 */
export function TextureUploader({ 
  onTextureSelect, 
  disabled = false,
  currentTexture 
}: TextureUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP)');
      return;
    }

    const url = URL.createObjectURL(file);
    onTextureSelect(url, file);
  }, [onTextureSelect]);

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
    if (file) processFile(file);
  }, [processFile]);

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-surface-400 uppercase tracking-wider">
        Custom Texture
      </label>

      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={clsx(
          'relative rounded-lg border-2 border-dashed transition-all duration-200',
          'flex flex-col items-center justify-center p-6 min-h-[140px]',
          disabled
            ? 'opacity-50 cursor-not-allowed border-surface-700 bg-surface-900/50'
            : 'group cursor-pointer border-surface-700 bg-surface-900/50 hover:border-surface-500 hover:bg-surface-800/50',
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

        {currentTexture ? (
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img 
                src={currentTexture} 
                alt="Selected texture"
                className="w-20 h-20 object-cover rounded-md ring-2 ring-accent-500/50"
              />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-surface-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <span className="text-xs text-surface-400">Click to change</span>
          </div>
        ) : (
          <>
            <div className={clsx(
              'w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-colors',
              isDragOver ? 'bg-accent-500/20' : 'bg-surface-800 group-hover:bg-surface-700'
            )}>
              <svg 
                className={clsx(
                  'w-6 h-6 transition-colors',
                  isDragOver ? 'text-accent-400' : 'text-surface-400 group-hover:text-surface-300'
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
