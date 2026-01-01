'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { clsx } from 'clsx';
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
  const [canAR, setCanAR] = useState(false);

  // Check AR availability after hydration
  useEffect(() => {
    const checkAR = () => {
      const isARCapable = 'xr' in navigator || 
        /Android|iPhone|iPad/i.test(navigator.userAgent);
      setCanAR(isARCapable);
    };
    checkAR();
  }, []);

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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-surface-950 overflow-hidden">
      {/* Mobile Toggle Button - Floating and refined */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={clsx(
          "lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-95",
          isSidebarOpen 
            ? "bg-surface-800 text-surface-400 rotate-90" 
            : "bg-accent-500 text-surface-950 ring-4 ring-accent-500/20"
        )}
        aria-label={isSidebarOpen ? 'Close controls' : 'Open controls'}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          {isSidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          )}
        </svg>
      </button>

      {/* Main viewer - Full screen background on mobile */}
      <main className="flex-1 relative bg-surface-950 h-[65vh] lg:h-auto lg:min-h-screen order-1 lg:order-2">
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

        <div ref={viewerRef} className="absolute inset-0 z-10">
          {modelUrl ? (
            <>
              <ProductViewer 
                modelSrc={modelUrl as string}
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
          <div className="absolute top-6 right-6 z-20">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-800/80 backdrop-blur-md border border-surface-700 shadow-xl">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-surface-200 font-semibold uppercase tracking-wider">AR Ready</span>
            </div>
          </div>
        )}
      </main>

      {/* Sidebar Controls - Modern Sidebar (Desktop) / Bottom Sheet (Mobile) */}
      <aside className={clsx(
        "z-40 transition-all duration-500 order-2 lg:order-1",
        "w-full lg:w-80 xl:w-96 shrink-0 bg-surface-900 border-surface-800 lg:border-r",
        "fixed bottom-0 lg:relative lg:translate-y-0",
        isSidebarOpen 
          ? "translate-y-0" 
          : "translate-y-[calc(100%-80px)] lg:translate-y-0"
      )}>
        {/* Mobile Handle */}
        <div 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden w-full h-20 flex flex-col items-center justify-center cursor-pointer"
        >
          <div className="w-12 h-1 bg-surface-700 rounded-full mb-2" />
          <span className="text-[10px] font-bold text-surface-500 uppercase tracking-[0.2em]">
            {isSidebarOpen ? 'Swipe down to minimize' : 'Tap to customize'}
          </span>
        </div>

        <div className="p-6 lg:p-8 h-[70vh] lg:h-full flex flex-col">
          <header className="hidden lg:block mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/20">
                <svg className="w-6 h-6 text-surface-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-surface-500 tracking-tight leading-none mb-1">
                  CONFIGURATOR
                </h1>
                <p className="text-[10px] text-accent-500 font-black uppercase tracking-widest">
                  Professional Suite
                </p>
              </div>
            </div>
          </header>

          <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <ModelUploader 
              onModelSelect={handleModelSelect}
              currentModel={modelUrl}
              modelName={modelName}
            />

            <div className="h-px bg-linear-to-r from-transparent via-surface-700 to-transparent" />

            <TextureUploader 
              onTextureSelect={handleTextureSelect}
              disabled={!modelUrl}
              currentTexture={textureUrl}
            />

            <div className="h-px bg-linear-to-r from-transparent via-surface-700 to-transparent" />

            <ColorPicker 
              viewerRef={viewerRef}
              disabled={!modelUrl}
            />

            {textureApplied && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-success/5 border border-success/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-success">Custom texture applied successfully</span>
              </div>
            )}
          </div>

          {/* Controls help - Always hidden on mobile for cleaner look */}
          <div className="hidden lg:block mt-8 pt-8 border-t border-surface-800">
            <h3 className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] mb-4">
              Interaction Guide
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-950/50 border border-surface-800">
                <div className="text-xl">🖱️</div>
                <span className="text-[9px] font-bold text-surface-400 uppercase">Rotate</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-950/50 border border-surface-800">
                <div className="text-xl">🔘</div>
                <span className="text-[9px] font-bold text-surface-400 uppercase">Zoom</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-950/50 border border-surface-800">
                <div className="text-xl">🖐️</div>
                <span className="text-[9px] font-bold text-surface-400 uppercase">Pan</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
