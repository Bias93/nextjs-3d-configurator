'use client';

import { useCallback, useState, useRef } from 'react';
import { clsx } from 'clsx';
import JSZip from 'jszip';

interface ModelUploaderProps {
  onModelSelect: (modelUrl: string, fileName: string) => void;
  currentModel?: string | null;
  modelName?: string | null;
}

const VALID_EXTENSIONS = ['.glb', '.gltf'];

interface PatchResult {
  url: string;
  missingResources: string[];
}

// Helper to patch GLTF with blob URLs for resources
const patchGltfContent = async (gltfFile: File, resources: Map<string, File>): Promise<PatchResult> => {
  const text = await gltfFile.text();
  const json = JSON.parse(text);
  const missing: string[] = [];

  const getResource = (uri: string): File | undefined => {
    // 1. Try exact matching
    if (resources.has(uri)) return resources.get(uri);
    
    // 2. Try matching by filename (handling flattened structure)
    // Handle both forward slash and backslash
    const cleanUri = decodeURIComponent(uri);
    const filename = cleanUri.split(/[/\\]/).pop();
    
    if (!filename) return undefined;

    // 3. Try case-insensitive matching for filename
    const lowerFilename = filename.toLowerCase();
    for (const [key, value] of resources.entries()) {
      if (key.toLowerCase() === lowerFilename) return value;
      // Also check if the uploaded file ends with this filename
      if (key.endsWith(filename)) return value;
    }

    return undefined;
  };

  // Patch buffers
  if (json.buffers) {
    json.buffers.forEach((buffer: any) => {
      if (buffer.uri && !buffer.uri.startsWith('data:')) {
        const file = getResource(buffer.uri);
        if (file) {
          console.log(`[GLTF Patcher] Patched buffer: ${buffer.uri} -> ${file.name}`);
          buffer.uri = URL.createObjectURL(file);
        } else {
          console.warn(`[GLTF Patcher] Missing buffer: ${buffer.uri}`);
          missing.push(buffer.uri);
        }
      }
    });
  }

  // Patch images
  if (json.images) {
    json.images.forEach((image: any) => {
      if (image.uri && !image.uri.startsWith('data:')) {
        const file = getResource(image.uri);
        if (file) {
          console.log(`[GLTF Patcher] Patched image: ${image.uri} -> ${file.name}`);
          image.uri = URL.createObjectURL(file);
        } else {
          console.warn(`[GLTF Patcher] Missing image: ${image.uri}`);
          missing.push(image.uri);
        }
      }
    });
  }

  // Workaround for KHR_materials_pbrSpecularGlossiness
  if (json.materials) {
    json.materials.forEach((material: any) => {
      if (material.extensions && material.extensions.KHR_materials_pbrSpecularGlossiness) {
        console.log(`[GLTF Patcher] Converting SpecularGlossiness material: ${material.name}`);
        const specGloss = material.extensions.KHR_materials_pbrSpecularGlossiness;
        
        // Ensure standard PBR container exists
        if (!material.pbrMetallicRoughness) {
          material.pbrMetallicRoughness = {};
        }

        // Map diffuseTexture to baseColorTexture
        if (specGloss.diffuseTexture) {
          material.pbrMetallicRoughness.baseColorTexture = specGloss.diffuseTexture;
          console.log(`  - Mapped diffuseTexture to baseColorTexture`);
        }

        // Map diffuseFactor to baseColorFactor if present
        if (specGloss.diffuseFactor) {
          material.pbrMetallicRoughness.baseColorFactor = specGloss.diffuseFactor;
        }

        // Set rough/metal values to resemble non-metal (common in spec/gloss usage)
        if (material.pbrMetallicRoughness.roughnessFactor === undefined) {
          material.pbrMetallicRoughness.roughnessFactor = 0.5;
        }
        if (material.pbrMetallicRoughness.metallicFactor === undefined) {
          material.pbrMetallicRoughness.metallicFactor = 0.0;
        }

        // Remove the extension to prevent loader errors
        delete material.extensions.KHR_materials_pbrSpecularGlossiness;
      }
    });

    // Clean up top-level extensions list
    if (json.extensionsRequired) {
      json.extensionsRequired = json.extensionsRequired.filter((ext: string) => ext !== 'KHR_materials_pbrSpecularGlossiness');
    }
    if (json.extensionsUsed) {
      json.extensionsUsed = json.extensionsUsed.filter((ext: string) => ext !== 'KHR_materials_pbrSpecularGlossiness');
    }
  }

  const blob = new Blob([JSON.stringify(json)], { type: 'model/gltf+json' });
  return {
    url: URL.createObjectURL(blob),
    missingResources: missing
  };
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

    // Check for ZIP file
    const zipFile = files.find(f => f.name.toLowerCase().endsWith('.zip'));
    if (zipFile) {
      setIsLoading(true);
      try {
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(zipFile);
        const extractedFiles: File[] = [];

        console.log('📦 Extracting ZIP:', zipFile.name);

        const extractionPromises: Promise<void>[] = [];

        zipContent.forEach((relativePath, zipEntry) => {
          if (!zipEntry.dir) {
            const promise = zipEntry.async('blob').then(blob => {
              // Create a file with the full relative path as name (to preserve some structure info if needed)
              // But for our flattened logic, the basename usually suffices.
              // We keep the basename for simple matching, or maybe the full path?
              // The patcher uses `split('/').pop()`, so full path in name is fine.
              const filename = relativePath.split('/').pop() || relativePath;
              const file = new File([blob], filename, { type: blob.type });
              extractedFiles.push(file);
              console.log(`  - Extracted: ${filename}`);
            });
            extractionPromises.push(promise);
          }
        });

        await Promise.all(extractionPromises);
        
        console.log(`✅ Extracted ${extractedFiles.length} files. Processing...`);
        // Recursive call with extracted files
        await processFiles(extractedFiles);
        return; // Important: stop this execution path

      } catch (error) {
        console.error('Error extracting ZIP:', error);
        alert('Failed to extract ZIP file');
        setIsLoading(false);
        return;
      }
    }

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
        const result = await patchGltfContent(gltfFile, resourceMap);
        url = result.url;

        if (result.missingResources.length > 0) {
          const missingFiles = result.missingResources.map(uri => uri.split('/').pop()).join(', ');
          alert(`Warning: The following files were referenced but not found:\n${missingFiles}\n\nPlease ensure you dragged all texture/bin files together with the .gltf file.`);
        }
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
          accept=".glb,.gltf,.bin,.png,.jpg,.jpeg,.zip"
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
                GLB, GLTF or ZIP archive
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ModelUploader;
