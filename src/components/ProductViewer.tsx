'use client';

import { useEffect, useRef, useState, useCallback, forwardRef } from 'react';

interface ProductViewerProps {
  modelSrc: string;
  poster?: string;
  alt?: string;
  onTextureApplied?: () => void;
  onARStatusChange?: (status: 'not-presenting' | 'session-started' | 'object-placed' | 'failed') => void;
}

export const ProductViewer = forwardRef<HTMLElement, ProductViewerProps>(({
  modelSrc,
  poster,
  alt = '3D Product Model',
  onTextureApplied,
  onARStatusChange
}, ref) => {
  const localRef = useRef<ModelViewerElement | null>(null);
  const viewerRef = (ref || localRef) as React.MutableRefObject<ModelViewerElement | null>;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isModelViewerReady, setIsModelViewerReady] = useState(false);
  const [arStatus, setArStatus] = useState<string>('not-presenting');
  const [arTracking, setArTracking] = useState<string>('not-tracking');

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

  // Setup model-viewer events
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !isModelViewerReady) return;

    const handleLoad = () => setIsLoaded(true);
    const handleError = (e: Event) => console.error('Model loading error:', e);

    // AR status events
    const handleARStatus = (e: CustomEvent) => {
      const status = e.detail.status;
      setArStatus(status);
      onARStatusChange?.(status);
    };

    const handleARTracking = (e: CustomEvent) => {
      setArTracking(e.detail.status);
    };

    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('error', handleError);
    viewer.addEventListener('ar-status', handleARStatus as EventListener);
    viewer.addEventListener('ar-tracking', handleARTracking as EventListener);

    if (viewer.model) {
      setIsLoaded(true);
    }

    return () => {
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('error', handleError);
      viewer.removeEventListener('ar-status', handleARStatus as EventListener);
      viewer.removeEventListener('ar-tracking', handleARTracking as EventListener);
    };
  }, [isModelViewerReady, modelSrc, onARStatusChange]);

  useEffect(() => {
    setIsLoaded(false);
  }, [modelSrc]);

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

  // Check if AR is active and not yet tracking
  const showARPrompt = arStatus === 'session-started' && arTracking === 'not-tracking';

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

        // Camera controls
        camera-controls
        touch-action="pan-y"
        auto-rotate
        rotation-per-second="20deg"
        camera-orbit="45deg 65deg 105%"
        min-camera-orbit="auto auto 50%"
        max-camera-orbit="auto auto 200%"
        interaction-prompt="none"

        // Lighting - Optimized
        exposure="1"
        shadow-intensity="1"
        shadow-softness="0.8"
        tone-mapping="neutral"

        // AR Configuration - Optimized for realism
        ar
        ar-scale="fixed"
        ar-placement="floor"
        xr-environment
        ar-modes="webxr scene-viewer quick-look"

        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
        }}
      >
      </model-viewer>

      {/* AR Prompt Overlay - Shows during AR calibration (outside model-viewer) */}
      {showARPrompt && (
        <div className="ar-prompt">
          <div className="ar-prompt-content">
            <div className="ar-prompt-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 18.5A2.5 2.5 0 0 1 9.5 16A2.5 2.5 0 0 1 12 13.5A2.5 2.5 0 0 1 14.5 16A2.5 2.5 0 0 1 12 18.5M12 2A7 7 0 0 0 5 9C5 14.25 12 22 12 22S19 14.25 19 9A7 7 0 0 0 12 2Z" />
              </svg>
            </div>
            <p className="ar-prompt-text">Move your phone to find a surface</p>
          </div>
        </div>
      )}
    </div>
  );
});

ProductViewer.displayName = 'ProductViewer';

export default ProductViewer;
