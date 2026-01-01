'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface ProductViewerProps {
  modelSrc: string;
  poster?: string;
  alt?: string;
  onTextureApplied?: () => void;
}

export function ProductViewer({ 
  modelSrc, 
  poster,
  alt = 'Modello 3D prodotto',
  onTextureApplied 
}: ProductViewerProps) {
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModelViewerReady, setIsModelViewerReady] = useState(false);

  // Load model-viewer script
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

  // Listen for model load - DEVE usare addEventListener per web components
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !isModelViewerReady) return;

    const handleLoad = () => {
      console.log('✅ Modello caricato');
      setIsLoaded(true);
    };

    const handleError = (e: Event) => {
      console.error('❌ Errore caricamento modello:', e);
    };

    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('error', handleError);

    // Se il modello è già caricato (cache)
    if (viewer.model) {
      setIsLoaded(true);
    }

    return () => {
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('error', handleError);
    };
  }, [isModelViewerReady, modelSrc]);

  // Reset isLoaded quando cambia il modello
  useEffect(() => {
    setIsLoaded(false);
  }, [modelSrc]);

  // Apply custom texture
  const applyTexture = useCallback(async (textureUrl: string) => {
    const viewer = viewerRef.current as ModelViewerElement | null;
    if (!viewer?.model) return;

    try {
      // Crea una nuova texture usando l'API createTexture di model-viewer
      const newTexture = await viewer.createTexture(textureUrl);
      
      const materials = viewer.model.materials;
      
      // Cerca materiale specifico "telaio" o applica a tutti
      const targetMaterial = materials.find((m: Material) => 
        m.name.toLowerCase().includes('telaio') || 
        m.name.toLowerCase().includes('custom')
      );

      const materialsToUpdate = targetMaterial ? [targetMaterial] : materials;

      for (const material of materialsToUpdate) {
        // Imposta la nuova texture come baseColorTexture
        material.pbrMetallicRoughness.setBaseColorTexture(newTexture);
      }
      
      onTextureApplied?.();
    } catch (error) {
      console.error('Errore applicazione texture:', error);
    }
  }, [onTextureApplied]);

  // Expose applyTexture method
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
          <span className="text-sm text-surface-400 font-mono">Caricamento viewer...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-900">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-surface-400 font-mono">Caricamento modello...</span>
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
        shadow-intensity="1.2"
        shadow-softness="0.8"
        exposure="0.9"
        tone-mapping="commerce"
        camera-orbit="45deg 65deg 105%"
        min-camera-orbit="auto auto 50%"
        max-camera-orbit="auto auto 200%"
        interaction-prompt="none"
        ar
        ar-modes="webxr scene-viewer quick-look"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
        }}
      />
    </div>
  );
}

export default ProductViewer;