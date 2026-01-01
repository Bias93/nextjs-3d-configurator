'use client';

import { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ModelUploader } from '@/components/ModelUploader';
import { TextureUploader } from '@/components/TextureUploader';
import { ViewerControls } from '@/components/ViewerControls';
import { ColorPicker } from '@/components/ColorPicker';

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

/**
 * Main 3D product configurator page.
 * Provides UI for uploading models, applying textures, and customizing colors.
 */
export default function ConfiguratorPage() {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string | null>(null);
  const [textureUrl, setTextureUrl] = useState<string | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [textureApplied, setTextureApplied] = useState(false);
  
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleModelSelect = useCallback((url: string, fileName: string) => {
    if (modelUrl) URL.revokeObjectURL(modelUrl);
    setModelUrl(url);
    setModelName(fileName);
    setTextureUrl(null);
    setTextureApplied(false);
  }, [modelUrl]);

  const handleTextureSelect = useCallback((url: string) => {
    if (textureUrl) URL.revokeObjectURL(textureUrl);
    setTextureUrl(url);
    
    const viewer = viewerRef.current?.querySelector('model-viewer') as any;
    if (viewer?.applyCustomTexture) {
      viewer.applyCustomTexture(url);
    }
  }, [textureUrl]);

  const handleTextureApplied = useCallback(() => {
    setTextureApplied(true);
  }, []);

  const handleScreenshot = useCallback(() => {
    const viewer = viewerRef.current?.querySelector('model-viewer') as ModelViewerElement | null;
    if (!viewer) return;

    const dataUrl = viewer.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `configuration-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }, []);

  const handleReset = useCallback(() => {
    const viewer = viewerRef.current?.querySelector('model-viewer') as any;
    if (viewer) {
      viewer.cameraOrbit = '45deg 65deg 105%';
      viewer.updateFraming?.();
    }
  }, []);

  const handleToggleAutoRotate = useCallback(() => {
    setIsAutoRotating(prev => {
      const viewer = viewerRef.current?.querySelector('model-viewer') as any;
      if (viewer) {
        viewer.autoRotate = !prev;
      }
      return !prev;
    });
  }, []);

  const handleActivateAR = useCallback(() => {
    const viewer = viewerRef.current?.querySelector('model-viewer') as any;
    if (viewer?.activateAR) {
      viewer.activateAR();
    }
  }, []);

  // Check if AR is available (mobile devices with AR support)
  const canAR = typeof window !== 'undefined' && 
    ('xr' in navigator || /Android|iPhone|iPad/i.test(navigator.userAgent));

  return (
    <div className="min-h-screen flex flex-col-reverse lg:flex-row">
      {/* Mobile toggle button - fixed at bottom */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-accent-500 text-surface-950 shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        aria-label={isSidebarOpen ? 'Close controls' : 'Open controls'}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {isSidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          )}
        </svg>
      </button>

      {/* Sidebar / Controls panel */}
      <aside className={`
        w-full lg:w-80 xl:w-96 shrink-0 bg-surface-900 border-t lg:border-t-0 lg:border-r border-surface-800
        transition-all duration-300 overflow-hidden
        ${isSidebarOpen ? 'max-h-[80vh]' : 'max-h-0 lg:max-h-none'}
      `}>
        <div className="p-6 lg:p-8 h-full flex flex-col">
          <header className="mb-6 lg:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-accent-400 to-accent-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-surface-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-surface-100 tracking-tight">
                  3D Configurator
                </h1>
                <p className="text-xs text-surface-500 font-mono">
                  Customize your product
                </p>
              </div>
            </div>
          </header>

          <div className="space-y-5 flex-1 overflow-y-auto">
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

            {textureApplied && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                <svg className="w-4 h-4 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-success">Texture applied</span>
              </div>
            )}
          </div>

          {/* Controls help - hidden on mobile for space */}
          <div className="hidden lg:block mt-6 pt-6 border-t border-surface-800">
            <h3 className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-3">
              Controls
            </h3>
            <ul className="space-y-2 text-sm text-surface-400">
              <li className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 text-xs bg-surface-800 rounded font-mono">
                  Drag
                </kbd>
                <span>Rotate</span>
              </li>
              <li className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 text-xs bg-surface-800 rounded font-mono">
                  Scroll
                </kbd>
                <span>Zoom</span>
              </li>
              <li className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 text-xs bg-surface-800 rounded font-mono">
                  2 fingers
                </kbd>
                <span>Pan</span>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Main viewer - now appears first on mobile due to flex-col-reverse */}
      <main className="flex-1 relative bg-surface-950 h-[50vh] lg:h-auto lg:min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-surface-900 via-surface-950 to-surface-950" />
        
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
                onActivateAR={handleActivateAR}
                isAutoRotating={isAutoRotating}
                hasModel={true}
                canAR={canAR}
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
                No model loaded
              </h2>
              <p className="text-sm text-surface-500 max-w-xs">
                Upload a 3D model in GLB format to start customizing
              </p>
            </div>
          )}
        </div>

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
