'use client';

import { useEffect, useRef, useState, useCallback, forwardRef } from 'react';

interface ProductViewerProps {
  /** URL of the 3D model (GLB/glTF format) */
  modelSrc: string;
  /** Poster image shown during loading */
  poster?: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Callback fired when a texture is successfully applied */
  onTextureApplied?: () => void;
}

/**
 * Interactive 3D product viewer component using Google's model-viewer.
 * Supports texture customization, camera controls, and AR capabilities.
 */
export const ProductViewer = forwardRef<HTMLElement, ProductViewerProps>(({ 
  modelSrc, 
  poster,
  alt = '3D Product Model',
  onTextureApplied 
}, ref) => {
  // Use a local ref if none is provided, but we mostly rely on the forwarded ref
  const localRef = useRef<ModelViewerElement | null>(null);
  const viewerRef = (ref || localRef) as React.MutableRefObject<ModelViewerElement | null>;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isModelViewerReady, setIsModelViewerReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (customElements.get('model-viewer')) {
      setIsModelViewerReady(true);
      return;
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@4.1.0/dist/model-viewer.min.js';
    script.onload = () => setIsModelViewerReady(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !isModelViewerReady) return;

    const handleLoad = () => setIsLoaded(true);
    const handleError = (e: Event) => console.error('Model loading error:', e);

    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('error', handleError);

    if (viewer.model) {
      setIsLoaded(true);
    }

    return () => {
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('error', handleError);
    };
  }, [isModelViewerReady, modelSrc]);

  useEffect(() => {
    setIsLoaded(false);
  }, [modelSrc]);

  /**
   * Applies a custom texture to the model's materials.
   * Targets materials with 'frame' or 'custom' in their name, or applies to all if none found.
   */
  const applyTexture = useCallback(async (textureUrl: string) => {
    const viewer = viewerRef.current as ModelViewerElement | null;
    if (!viewer?.model) return;

    try {
      const newTexture = await viewer.createTexture(textureUrl);
      const materials = viewer.model.materials;
      
      const targetMaterial = materials.find((m: Material) => 
        m.name.toLowerCase().includes('telaio') || 
        m.name.toLowerCase().includes('custom') ||
        m.name.toLowerCase().includes('frame')
      );

      const materialsToUpdate = targetMaterial ? [targetMaterial] : materials;

      for (const material of materialsToUpdate) {
        if (material.pbrMetallicRoughness.setBaseColorTexture) {
          material.pbrMetallicRoughness.setBaseColorTexture(newTexture);
          if (material.pbrMetallicRoughness.setBaseColorFactor) {
            material.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
          }
        } else if (material.pbrMetallicRoughness.baseColorTexture) {
          (material.pbrMetallicRoughness.baseColorTexture as any).setTexture(newTexture);
        }
      }
      
      onTextureApplied?.();
    } catch (error) {
      console.error('Texture application error:', error);
    }
  }, [onTextureApplied]);

  useEffect(() => {
    if (viewerRef.current) {
      (viewerRef.current as any).applyCustomTexture = applyTexture;
    }
  }, [applyTexture, isLoaded]);

  if (!isModelViewerReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-surface-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-surface-400 font-mono">Loading viewer...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-900">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-surface-400 font-mono">Loading model...</span>
          </div>
        </div>
      )}

      <model-viewer
        ref={viewerRef as any}
        src={modelSrc}
        poster={poster}
        alt={alt}
        camera-controls
        touch-action="pan-y"
        auto-rotate
        rotation-per-second="20deg"
        shadow-intensity="1"
        shadow-softness="0.5"
        exposure="1"
        environment-image="neutral"
        tone-mapping="neutral"
        camera-orbit="45deg 65deg 105%"
        min-camera-orbit="auto auto 50%"
        max-camera-orbit="auto auto 200%"
        interaction-prompt="none"
        ar
        ar-scale="fixed"
        xr-environment
        ar-modes="webxr scene-viewer quick-look"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
        }}
      />
    </div>
  );
});

ProductViewer.displayName = 'ProductViewer';

export default ProductViewer;