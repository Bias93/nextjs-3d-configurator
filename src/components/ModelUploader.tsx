'use client';

import { useCallback, useState, useRef } from 'react';
import { clsx } from 'clsx';

interface ModelUploaderProps {
  onModelSelect: (modelUrl: string, fileName: string) => void;
  currentModel?: string | null;
  modelName?: string | null;
}

const VALID_EXTENSIONS = ['.glb', '.gltf'];

/**
 * 3D model upload component with drag-and-drop support.
 * Accepts GLB and glTF file formats.
 */
export function ModelUploader({ 
  onModelSelect, 
  currentModel,
  modelName 
}: ModelUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!VALID_EXTENSIONS.includes(extension)) {
      alert('Please select a GLB or glTF file');
      return;
    }

    setIsLoading(true);
    const url = URL.createObjectURL(file);
    
    setTimeout(() => {
      onModelSelect(url, file.name);
      setIsLoading(false);
    }, 300);
  }, [onModelSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

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
    inputRef.current?.click();
  }, []);

  return (
    <div className="space-y-3">
      <label className="block text-[10px] font-black text-surface-500 uppercase tracking-[0.2em]">
        Model
      </label>

      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={clsx(
          'relative group/model cursor-pointer rounded-lg border-2 border-dashed transition-all duration-200',
          'flex flex-col items-center justify-center p-6 min-h-[140px]',
          isDragOver 
            ? 'border-accent-500 bg-accent-500/10' 
            : 'border-surface-700 bg-surface-900/50 hover:border-surface-500 hover:bg-surface-800/50'
        )}
        role="button"
        tabIndex={0}
        aria-label="Upload 3D model"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".glb,.gltf"
          onChange={handleFileSelect}
          className="sr-only"
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-surface-400">Loading...</span>
          </div>
        ) : currentModel ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-accent-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm text-surface-200 font-medium truncate max-w-[180px]">
                {modelName || 'Model loaded'}
              </p>
              <p className="text-xs text-surface-500 mt-1">Click to change</p>
            </div>
          </div>
        ) : (
          <>
            <div className={clsx(
              'w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-colors',
              isDragOver ? 'bg-accent-500/20' : 'bg-surface-800 group-hover/model:bg-surface-700'
            )}>
              <svg 
                className={clsx(
                  'w-6 h-6 transition-colors',
                  isDragOver ? 'text-accent-400' : 'text-surface-400 group-hover/model:text-surface-300'
                )} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-sm text-surface-300 text-center">
              {isDragOver ? 'Drop to upload' : 'Drag or click'}
            </p>
            <p className="text-xs text-surface-500 mt-1">
              GLB or glTF files
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ModelUploader;
