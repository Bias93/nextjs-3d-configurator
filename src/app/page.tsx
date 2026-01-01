'use client';

import { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ModelUploader } from '@/components/ModelUploader';
import { TextureUploader } from '@/components/TextureUploader';
import { ViewerControls } from '@/components/ViewerControls';
import { ColorPicker } from '@/components/ColorPicker';

// Dynamic import per evitare SSR issues con model-viewer
const ProductViewer = dynamic(
  () => import('@/components/ProductViewer'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-surface-900">
        <div className="w-10 h-10 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
);

export default function ConfiguratorPage() {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string | null>(null);
  const [textureUrl, setTextureUrl] = useState<string | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [textureApplied, setTextureApplied] = useState(false);
  
  const viewerRef = useRef<HTMLDivElement>(null);

  // Handle model upload
  const handleModelSelect = useCallback((url: string, fileName: string) => {
    // Cleanup old URL
    if (modelUrl) URL.revokeObjectURL(modelUrl);
    setModelUrl(url);
    setModelName(fileName);
    setTextureUrl(null);
    setTextureApplied(false);
  }, [modelUrl]);

  // Handle texture upload
  const handleTextureSelect = useCallback((url: string) => {
    // Cleanup old URL
    if (textureUrl) URL.revokeObjectURL(textureUrl);
    setTextureUrl(url);
    
    // Apply texture to model
    const viewer = viewerRef.current?.querySelector('model-viewer') as any;
    if (viewer?.applyCustomTexture) {
      viewer.applyCustomTexture(url);
    }
  }, [textureUrl]);

  // Handle texture applied callback
  const handleTextureApplied = useCallback(() => {
    setTextureApplied(true);
  }, []);

  // Screenshot
  const handleScreenshot = useCallback(() => {
    const viewer = viewerRef.current?.querySelector('model-viewer') as ModelViewerElement | null;
    if (!viewer) return;

    const dataUrl = viewer.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `configurazione-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }, []);

  // Reset view
  const handleReset = useCallback(() => {
    const viewer = viewerRef.current?.querySelector('model-viewer') as any;
    if (viewer) {
      viewer.cameraOrbit = '45deg 65deg 105%';
      viewer.updateFraming?.();
    }
  }, []);

  // Toggle auto-rotate
  const handleToggleAutoRotate = useCallback(() => {
    setIsAutoRotating(prev => {
      const viewer = viewerRef.current?.querySelector('model-viewer') as any;
      if (viewer) {
        viewer.autoRotate = !prev;
      }
      return !prev;
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-80 xl:w-96 shrink-0 bg-surface-900 border-b lg:border-b-0 lg:border-r border-surface-800">
        <div className="p-6 lg:p-8 h-full flex flex-col">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-accent-400 to-accent-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-surface-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-surface-100 tracking-tight">
                  Configuratore 3D
                </h1>
                <p className="text-xs text-surface-500 font-mono">
                  Personalizza il tuo prodotto
                </p>
              </div>
            </div>
          </header>

          {/* Upload sections */}
          <div className="space-y-6 flex-1">
            <ModelUploader 
              onModelSelect={handleModelSelect}
              currentModel={modelUrl}
              modelName={modelName}
            />

            <div className="h-px bg-surface-800" />

            <TextureUploader 
              onTextureSelect={handleTextureSelect}
              disabled={!modelUrl}
              currentTexture={textureUrl}
            />

            <div className="h-px bg-surface-800" />

            <ColorPicker 
              viewerRef={viewerRef}
              disabled={!modelUrl}
            />

            {/* Status indicator */}
            {textureApplied && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                <svg className="w-4 h-4 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-success">Grafica applicata</span>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 pt-6 border-t border-surface-800">
            <h3 className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-3">
              Controlli
            </h3>
            <ul className="space-y-2 text-sm text-surface-400">
              <li className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 text-xs bg-surface-800 rounded font-mono">
                  Trascina
                </kbd>
                <span>Ruota</span>
              </li>
              <li className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 text-xs bg-surface-800 rounded font-mono">
                  Scroll
                </kbd>
                <span>Zoom</span>
              </li>
              <li className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 text-xs bg-surface-800 rounded font-mono">
                  2 dita
                </kbd>
                <span>Sposta</span>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Main viewer area */}
      <main className="flex-1 relative bg-surface-950 min-h-[60vh] lg:min-h-screen">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-surface-900 via-surface-950 to-surface-950" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--color-surface-400) 1px, transparent 1px),
              linear-gradient(to bottom, var(--color-surface-400) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Viewer container */}
        <div ref={viewerRef} className="relative z-10 w-full h-full">
          {modelUrl ? (
            <>
              <ProductViewer 
                modelSrc={modelUrl}
                onTextureApplied={handleTextureApplied}
              />
              <ViewerControls
                onScreenshot={handleScreenshot}
                onReset={handleReset}
                onToggleAutoRotate={handleToggleAutoRotate}
                isAutoRotating={isAutoRotating}
                hasModel={true}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-2xl bg-surface-800/50 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h2 className="text-xl font-medium text-surface-300 mb-2">
                Nessun modello caricato
              </h2>
              <p className="text-sm text-surface-500 max-w-xs">
                Carica un modello 3D in formato GLB per iniziare la personalizzazione
              </p>
            </div>
          )}
        </div>

        {/* AR badge */}
        {modelUrl && (
          <div className="absolute top-4 right-4 z-20">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-800/80 backdrop-blur-sm border border-surface-700">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-surface-300 font-medium">AR Ready</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
