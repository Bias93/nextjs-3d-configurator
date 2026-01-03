'use client';

import { useState, RefObject } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ModelUploader } from '@/components/ModelUploader';
import { TextureUploader } from '@/components/TextureUploader';
import { ColorPicker } from '@/components/ColorPicker';

interface MobileDrawerProps {
  modelUrl: string | null;
  modelName: string | null;
  textureUrl: string | null;
  textureApplied: boolean;
  onModelSelect: (url: string, fileName: string) => void;
  onTextureSelect: (url: string) => void;
  viewerRef: RefObject<HTMLDivElement | null>;
}

export function MobileDrawer({
  modelUrl,
  modelName,
  textureUrl,
  textureApplied,
  onModelSelect,
  onTextureSelect,
  viewerRef,
}: MobileDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      {/* FAB Trigger Button - Enhanced with glassmorphism */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full glass-accent shadow-2xl flex items-center justify-center active:scale-90 transition-all duration-300"
        aria-label="Open customization panel"
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </button>

      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="bg-surface-950/95 backdrop-blur-xl border-surface-800 max-h-[85vh]">
          
          <DrawerHeader className="pb-4">
            <DrawerTitle className="text-surface-100 text-lg font-bold tracking-tight text-center">
              Customize Model
            </DrawerTitle>
          </DrawerHeader>

          <div className="overflow-y-auto px-6 pb-12 custom-scrollbar">
            <div className="space-y-8">
              <section>
                <h3 className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] mb-4">Model & Base</h3>
                <ModelUploader
                  onModelSelect={onModelSelect}
                  currentModel={modelUrl}
                  modelName={modelName}
                />
              </section>

              <div className="h-px bg-linear-to-r from-transparent via-surface-800 to-transparent" />

              <section>
                <h3 className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] mb-4">Appearance</h3>
                <div className="space-y-6">
                  <TextureUploader
                    onTextureSelect={onTextureSelect}
                    disabled={!modelUrl}
                    currentTexture={textureUrl}
                  />

                  {textureApplied && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-success/5 border border-success/20 animate-in fade-in zoom-in-95">
                      <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-success">Texture applied</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <ColorPicker viewerRef={viewerRef} disabled={!modelUrl} />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
