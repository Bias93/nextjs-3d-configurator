'use client';

import { useCallback, useState, useRef } from 'react';
import { clsx } from 'clsx';

interface ModelUploaderProps {
  onModelSelect: (modelUrl: string, fileName: string) => void;
  currentModel?: string | null;
  modelName?: string | null;
}

const VALID_EXTENSIONS = ['.glb', '.gltf'];

// Helper to patch GLTF with blob URLs for resources
const patchGltfContent = async (gltfFile: File, resources: Map<string, File>): Promise<string> => {
  const text = await gltfFile.text();
  const json = JSON.parse(text);

  // Patch buffers
  if (json.buffers) {
    json.buffers.forEach((buffer: any) => {
      if (buffer.uri && !buffer.uri.startsWith('data:')) {
        const file = resources.get(buffer.uri);
        if (file) {
          buffer.uri = URL.createObjectURL(file);
        }
      }
    });
  }

  // Patch images
  if (json.images) {
    json.images.forEach((image: any) => {
      if (image.uri && !image.uri.startsWith('data:')) {
        const file = resources.get(image.uri);
        if (file) {
          image.uri = URL.createObjectURL(file);
        }
      }
    });
  }

  const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
  return URL.createObjectURL(blob);
};

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

  const processFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    // Find main model file
    const glbFile = files.find(f => f.name.toLowerCase().endsWith('.glb'));
    const gltfFile = files.find(f => f.name.toLowerCase().endsWith('.gltf'));

    if (!glbFile && !gltfFile) {
      alert('Please upload a .glb or .gltf file (drag related .bin/textures together for gltf)');
      return;
    }

    setIsLoading(true);

    try {
      let url = '';
      let name = '';

      if (glbFile) {
        // ... simple GLB case remains same
        url = URL.createObjectURL(glbFile);
        name = glbFile.name;
      } else if (gltfFile) {
        name = gltfFile.name;
        // Create map of all uploaded files
        const resourceMap = new Map<string, File>();
        files.forEach(f => resourceMap.set(f.name, f));
        
        // Rewrite paths
        url = await patchGltfContent(gltfFile, resourceMap);
      }

      // Small delay for UI feedback
      setTimeout(() => {
        onModelSelect(url, name);
        setIsLoading(false);
      }, 300);

    } catch (error) {
      console.error('Error processing model files:', error);
      alert('Failed to process model files');
      setIsLoading(false);
    }
  }, [onModelSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, [processFiles]);

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
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
      e.target.value = ''; // Reset input to allow re-selection
    }
  }, [processFiles]);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-1 h-1 rounded-full bg-accent-500/50" />
        <label className="text-[10px] font-bold text-surface-400 uppercase tracking-[0.2em]">
          3D Model
        </label>
      </div>

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
          accept=".glb,.gltf,.bin,.png,.jpg,.jpeg"
          multiple
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
            <div className="text-center space-y-1">
              <p className="text-sm text-surface-300">
                {isDragOver ? 'Drop to upload' : 'Drop model files'}
              </p>
              <p className="text-[10px] text-surface-500">
                GLB or GLTF (include .bin/textures)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ModelUploader;
