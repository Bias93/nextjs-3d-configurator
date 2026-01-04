'use client';

import { useEffect, useRef, useState, useCallback, forwardRef } from 'react';
import type { TextureTransform } from '@/types/texture-transform';
import { DEFAULT_TEXTURE_TRANSFORM } from '@/types/texture-transform';
import { materialTargetMap } from '@/lib/material-utils';
import * as THREE from 'three';

interface ProductViewerProps {
  modelSrc: string;
  poster?: string;
  alt?: string;
  onTextureApplied?: () => void;
  onMaterialsLoaded?: (materials: string[]) => void;
  onARStatusChange?: (status: 'not-presenting' | 'session-started' | 'object-placed' | 'failed') => void;
}

/**
 * Converts degrees to radians.
 */
function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export const ProductViewer = forwardRef<HTMLElement, ProductViewerProps>(({
  modelSrc,
  poster,
  alt = '3D Product Model',
  onTextureApplied,
  onMaterialsLoaded,
  onARStatusChange
}, ref) => {
  const localRef = useRef<ModelViewerElement | null>(null);
  const viewerRef = (ref || localRef) as React.MutableRefObject<ModelViewerElement | null>;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isModelViewerReady, setIsModelViewerReady] = useState(false);
  const [arStatus, setArStatus] = useState<string>('not-presenting');
  const [arTracking, setArTracking] = useState<string>('not-tracking');

  // Store original texture URLs for re-transformation
  const originalTexturesRef = useRef<Record<string, string>>({});

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

    const handleLoad = () => {
      setIsLoaded(true);
      if (viewer.model) {
        const materialNames = Array.from(viewer.model.materials)
          .map((m: any) => m.name)
          .filter(Boolean);
        onMaterialsLoaded?.(materialNames);
      }
    };
    const handleError = (e: Event) => console.error('Model loading error:', e);


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
      const materialNames = Array.from(viewer.model.materials)
        .map((m: any) => m.name)
        .filter(Boolean);
      onMaterialsLoaded?.(materialNames);
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

  /**
   * Applies a texture to a material slot.
   */
  const applyTexture = useCallback(async (
    textureUrl: string, 
    slotName: string = 'logo_1'
  ) => {
    const viewer = viewerRef.current as ModelViewerElement | null;
    if (!viewer?.model) return;

    try {
      // Store original texture URL
      originalTexturesRef.current[slotName] = textureUrl;

      const newTexture = await viewer.createTexture(textureUrl);
      const materials = viewer.model.materials;

      const targetNames = materialTargetMap[slotName] || [slotName];

      const targetMaterial = materials.find((m: Material) => 
        targetNames.some(name => m.name.toLowerCase().includes(name.toLowerCase()))
      );

      if (!targetMaterial) {
        console.warn(`No material found for slot: ${slotName}`);
        return;
      }

      if (targetMaterial.pbrMetallicRoughness.setBaseColorTexture) {
        targetMaterial.pbrMetallicRoughness.setBaseColorTexture(newTexture);
        if (targetMaterial.pbrMetallicRoughness.setBaseColorFactor) {
          targetMaterial.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
        }
      } else if (targetMaterial.pbrMetallicRoughness.baseColorTexture) {
        (targetMaterial.pbrMetallicRoughness.baseColorTexture as any).setTexture(newTexture);
      }

      onTextureApplied?.();
    } catch (error) {
      console.error('Texture application error:', error);
    }
  }, [onTextureApplied]);

  /**
   * Applies UV transform to an already-applied texture.
   * Uses Three.js texture properties: offset, repeat, rotation.
   */
  const applyTextureTransform = useCallback((
    slotName: string,
    transform: TextureTransform
  ) => {
    const viewer = viewerRef.current as any;
    if (!viewer) {
      console.warn('[Transform] No viewer ref');
      return;
    }

    try {
      // Access internal Three.js scene
      const sceneSymbol = Object.getOwnPropertySymbols(viewer).find((s) => s.description === 'model-viewer-scene');
      const scene = sceneSymbol ? viewer[sceneSymbol] : null;

      if (!scene) {
        console.warn('[Transform] Could not access internal scene');
        return;
      }

      const targetNames = materialTargetMap[slotName] || [slotName];

      let targetMaterial: any = null;

      // Traverse the scene to find the material
      scene.traverse((child: any) => {
        if (child.isMesh && child.material) {
          const mat = child.material;
          if (targetNames.some(name => mat.name.toLowerCase().includes(name.toLowerCase()))) {
            targetMaterial = mat;
            // console.log('[Transform] Found material:', mat.name);
          }
        }
      });

      if (!targetMaterial) {
        console.warn(`[Transform] No Three.js material found for slot: ${slotName}`);
        return;
      }
      
      // Apply to both map (base color) and emissiveMap if they exist
      const texturesToUpdate = [targetMaterial.map, targetMaterial.emissiveMap].filter(Boolean);

      if (texturesToUpdate.length > 0) {
        texturesToUpdate.forEach(texture => {
            // Apply UV transforms
            texture.offset.set(transform.offsetU, transform.offsetV);
            texture.repeat.set(transform.scaleU, transform.scaleV);
            texture.rotation = degreesToRadians(transform.rotation);

            // Ensure texture rotates around center
            texture.center.set(0.5, 0.5);

            // Ensure matrix updates are enabled for UV transforms to take effect
            texture.matrixAutoUpdate = true;

            texture.needsUpdate = true;
        });

        targetMaterial.needsUpdate = true;
      } else {
        console.warn('[Transform] No texture map on material', targetMaterial.name);
      }

        // Force re-render
        if (viewer.updateFraming) {
            // This method sometimes triggers a redraw
            // viewer.updateFraming();
            // Or just rely on the reactivity
        }

    } catch (error) {
      console.error('[Transform] Error:', error);
    }
  }, []);

  useEffect(() => {
    if (viewerRef.current) {
      (viewerRef.current as any).applyCustomTexture = applyTexture;
      (viewerRef.current as any).applyTextureTransform = applyTextureTransform;
      (viewerRef.current as any).getOriginalTexture = (slotName: string) => 
        originalTexturesRef.current[slotName];
    }
  }, [applyTexture, applyTextureTransform, isLoaded]);

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


        camera-controls
        touch-action="pan-y"
        rotation-per-second="20deg"
        camera-orbit="180deg 90deg 105%"
        min-camera-orbit="auto auto 50%"
        max-camera-orbit="auto auto 200%"
        interaction-prompt="none"


        exposure="1"
        shadow-intensity="1"
        shadow-softness="0.8"
        tone-mapping="neutral"


        ar
        ar-scale="fixed"
        ar-placement="floor"
        xr-environment
        ar-modes="webxr quick-look"

        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
        }}
      >
      </model-viewer>

      {/* AR Prompt Overlay */}
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
