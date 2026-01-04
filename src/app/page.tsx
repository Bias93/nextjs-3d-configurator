'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { clsx } from 'clsx';
import dynamic from 'next/dynamic';
import { ModelUploader } from '@/components/ModelUploader';
import { TextureUploader } from '@/components/TextureUploader';
import { ViewerControls } from '@/components/ViewerControls';
import { ColorPicker } from '@/components/ColorPicker';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';

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

const MobileDrawer = dynamic(
  () => import('@/components/MobileDrawer').then(mod => ({ default: mod.MobileDrawer })),
  { ssr: false }
);

/**
 * Main 3D product configurator page.
 */
export default function ConfiguratorPage() {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string | null>(null);
  const [textures, setTextures] = useState<Record<string, string>>({});
  const [availableMaterials, setAvailableMaterials] = useState<string[]>([]);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [textureApplied, setTextureApplied] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  const viewerRef = useRef<HTMLDivElement>(null);
  const [canAR, setCanAR] = useState(false);
  const [arStatus, setArStatus] = useState<string>('not-presenting');


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
    setTextures({});
    setTextureApplied(false);
    setAvailableMaterials([]);
  }, [modelUrl]);

  const handleMaterialsLoaded = useCallback((materials: string[]) => {
    setAvailableMaterials(materials);
    console.log('Materials loaded:', materials);
  }, []);

  const handleTextureSelect = useCallback((url: string, file: File, slotName: string) => {
    setTextures(prev => ({
      ...prev,
      [slotName]: url
    }));
    
    const viewer = viewerRef.current?.querySelector('model-viewer') as any;
    if (viewer?.applyCustomTexture) {
      viewer.applyCustomTexture(url, slotName);
    }
  }, []);

  const handleTextureApplied = useCallback(() => {
    setTextureApplied(true);
  }, []);

  const handleScreenshot = useCallback(() => {
    const viewer = viewerRef.current?.querySelector('model-viewer') as any;
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

  const handleARStatusChange = useCallback((status: string) => {
    setArStatus(status);
  }, []);

  const handleToggleFocus = useCallback(() => {
    setIsFocusMode(prev => !prev);
  }, []);

  return (
    <SidebarProvider defaultOpen={true} className="dark">
      <ConfiguratorContent 
        modelUrl={modelUrl}
        modelName={modelName}
        textures={textures}
        availableMaterials={availableMaterials}
        textureApplied={textureApplied}
        handleModelSelect={handleModelSelect}
        handleMaterialsLoaded={handleMaterialsLoaded}
        handleTextureSelect={handleTextureSelect}
        handleTextureApplied={handleTextureApplied}
        handleARStatusChange={handleARStatusChange}
        arStatus={arStatus}
        isFocusMode={isFocusMode}
        handleToggleFocus={handleToggleFocus}
        isAutoRotating={isAutoRotating}
        handleScreenshot={handleScreenshot}
        handleReset={handleReset}
        handleToggleAutoRotate={handleToggleAutoRotate}
        handleActivateAR={handleActivateAR}
        canAR={canAR}
        viewerRef={viewerRef}
      />
    </SidebarProvider>
  );
}

function ConfiguratorContent({ 
  modelUrl, modelName, textures, availableMaterials, textureApplied, 
  handleModelSelect, handleMaterialsLoaded, handleTextureSelect, handleTextureApplied,
  handleARStatusChange, arStatus, isFocusMode, handleToggleFocus,
  isAutoRotating, handleScreenshot, handleReset,
  handleToggleAutoRotate, handleActivateAR, canAR, viewerRef
}: any) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className="flex min-h-svh w-full bg-surface-950 overflow-hidden">
        
        {/* Animated Sidebar - Desktop only */}
        <Sidebar 
          variant="floating" 
          collapsible="offcanvas"
          className={clsx(
            "bg-surface-950/80 backdrop-blur-3xl transition-all duration-300 p-4 pr-0",
            isFocusMode && "opacity-0 pointer-events-none -translate-x-full"
          )}
        >
          <SidebarHeader className="p-6 border-b border-surface-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/20 shrink-0">
                <svg className="w-5 h-5 text-surface-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="group-data-[collapsible=icon]:hidden overflow-hidden">
                <h1 className="text-xl font-bold text-surface-500 tracking-tight leading-none mb-1 uppercase">
                  3D Configurator
                </h1>
                <p className="text-[10px] text-accent-500 font-black uppercase tracking-[0.2em]">
                  Custom Texture Tool
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-8 custom-scrollbar overflow-y-auto overflow-x-hidden space-y-8">
            <SidebarGroup className="p-0">
              <SidebarGroupContent className="px-2">
                <ModelUploader 
                  onModelSelect={handleModelSelect}
                  currentModel={modelUrl}
                  modelName={modelName}
                />
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="h-px w-full shrink-0 bg-linear-to-r from-transparent via-surface-700 to-transparent" />

            <SidebarGroup className="p-0">
              <SidebarGroupContent className="px-2">
                <TextureUploader 
                  onTextureSelect={handleTextureSelect}
                  disabled={!modelUrl}
                  currentTextures={textures}
                  availableMaterials={availableMaterials}
                />
                {textureApplied && (
                  <div className="flex items-center gap-2 mt-3 p-2.5 rounded-lg bg-success/10 border border-success/20 animate-in fade-in slide-in-from-top-1">
                    <div className="w-4 h-4 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[9px] font-black text-success uppercase tracking-widest">Texture Applied</span>
                  </div>
                )}
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="h-px w-full shrink-0 bg-linear-to-r from-transparent via-surface-700 to-transparent" />
            <SidebarGroup className="p-0">
              <SidebarGroupContent className="px-2">
                <ColorPicker 
                  viewerRef={viewerRef}
                  disabled={!modelUrl}
                />
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-8 border-t border-surface-800 shrink-0">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 px-2">
                <div className="w-1 h-1 rounded-full bg-accent-500/50" />
                <h3 className="text-[10px] font-bold text-surface-400 uppercase tracking-[0.2em]">
                  Control Guide
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-950/50 border border-surface-800 group-data-[collapsible=icon]:hidden">
                  <div className="text-xl">🖱️</div>
                  <span className="text-[9px] font-bold text-surface-400 uppercase">Rotate</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-950/50 border border-surface-800 group-data-[collapsible=icon]:hidden">
                  <div className="text-xl">🔘</div>
                  <span className="text-[9px] font-bold text-surface-400 uppercase">Zoom</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-950/50 border border-surface-800 group-data-[collapsible=icon]:hidden">
                  <div className="text-xl">🖐️</div>
                  <span className="text-[9px] font-bold text-surface-400 uppercase">Pan</span>
                </div>
              </div>
            </div>
            <div className="text-[9px] text-surface-600 text-center uppercase tracking-widest font-bold group-data-[collapsible=icon]:hidden opacity-70">
              Press Ctrl+B to toggle sidebar
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Layout Area */}
        <SidebarInset className="relative flex-1 overflow-hidden bg-surface-950">
          
          {/* Controls Overlay */}
          {!isFocusMode && (
            <div className="absolute top-6 left-6 z-50 hidden lg:block">
              <SidebarTrigger className="w-11 h-11 rounded-xl glass hover:glass-accent text-surface-300 hover:text-white transition-all duration-300 shadow-2xl flex items-center justify-center border-surface-700/50" />
            </div>
          )}

          {/* Fixed & Centered Canvas Container */}
          <div className={clsx(
            "fixed inset-0 flex items-center justify-center z-0 transition-[padding] duration-500 pointer-events-none",
            !isFocusMode && !isCollapsed ? "lg:pl-(--sidebar-width)" : "lg:pl-0"
          )}>
            
            {/* Background Grid & Gradient */}
            <div className="absolute inset-0 z-[-1] pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-surface-900 via-surface-950 to-surface-950" />
              <div 
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, var(--color-surface-400) 1px, transparent 1px),
                    linear-gradient(to bottom, var(--color-surface-400) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px',
                }}
              />
            </div>

            {/* Centered Viewer Area */}
            <div 
              ref={viewerRef} 
              className="relative size-full flex items-center justify-center pointer-events-auto transition-all duration-500 ease-in-out"
            >
              {modelUrl ? (
                <>
                  <ProductViewer
                    modelSrc={modelUrl as string}
                    onTextureApplied={handleTextureApplied}
                    onMaterialsLoaded={handleMaterialsLoaded}
                    onARStatusChange={handleARStatusChange}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-12 max-w-md mx-auto animate-in fade-in zoom-in-95 duration-700">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-surface-900/50 backdrop-blur-3xl border border-surface-700/80 flex items-center justify-center mb-10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] lg:group-hover:scale-105 transition-transform">
                    <svg className="w-16 h-16 text-surface-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-black text-surface-100 mb-4 tracking-tight uppercase px-4">
                    No model loaded
                  </h2>
                  <p className="text-surface-500 text-sm leading-loose px-8">
                    Upload a 3D model in GLB format to start customizing
                  </p>
                </div>
              )}
            </div>

            {/* Floating AR Status Info */}
            {modelUrl && !isFocusMode && (
              <div className="absolute top-6 right-6 z-40 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-surface-900/80 backdrop-blur-xl border border-surface-700/50 shadow-2xl">
                  <div className={clsx(
                    'w-2.5 h-2.5 rounded-full ring-4 ring-offset-0 transition-all duration-500',
                    arStatus === 'not-presenting' && 'bg-success ring-success/20 shadow-[0_0_15px_rgba(var(--color-success),0.5)]',
                    arStatus === 'session-started' && 'bg-warning ring-warning/20 animate-pulse',
                    arStatus === 'object-placed' && 'bg-accent-500 ring-accent-500/20',
                    arStatus === 'failed' && 'bg-error ring-error/20'
                  )} />
                  <span className="text-[10px] text-surface-100 font-bold uppercase tracking-[0.2em] whitespace-nowrap">
                    {arStatus === 'not-presenting' && 'Use Mobile for AR'}
                    {arStatus === 'session-started' && 'Initializing AR...'}
                    {arStatus === 'object-placed' && 'Surface Tracked'}
                    {arStatus === 'failed' && 'AR System Offline'}
                  </span>
                </div>
              </div>
            )}
            
              <ViewerControls
                onScreenshot={handleScreenshot}
                onReset={handleReset}
                onToggleAutoRotate={handleToggleAutoRotate}
                onActivateAR={handleActivateAR}
                onToggleFocus={handleToggleFocus}
                isAutoRotating={isAutoRotating}
                isFocusMode={isFocusMode}
                hasModel={!!modelUrl}
                canAR={canAR}
              />
          </div>
        </SidebarInset>

        {/* Mobile Customization Drawer */}
        {!isFocusMode && (
          <MobileDrawer
            modelUrl={modelUrl}
            modelName={modelName}
            textures={textures}
            textureApplied={textureApplied}
            onModelSelect={handleModelSelect}
            onTextureSelect={handleTextureSelect}
            viewerRef={viewerRef}
          />
        )}
      </div>
  );
}
