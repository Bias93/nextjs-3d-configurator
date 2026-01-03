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
      {/* Floating Color Picker - Always visible when model loaded */}
      {modelUrl && (
        <div className="fixed bottom-20 left-4 right-20 z-40">
          <div className="bg-surface-900/95 backdrop-blur-md rounded-xl border border-surface-700 p-3 shadow-xl">
            <ColorPicker viewerRef={viewerRef} disabled={!modelUrl} />
          </div>
        </div>
      )}

      {/* FAB Trigger Button - Bottom right */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 shadow-lg shadow-accent-500/30 flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Open customization panel"
      >
        <svg className="w-6 h-6 text-surface-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </button>

      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="bg-surface-900 border-surface-700 max-h-[70vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-surface-300 text-sm font-medium text-center">
              Upload Files
            </DrawerTitle>
          </DrawerHeader>

          <div className="overflow-y-auto px-4 pb-6">
            <div className="space-y-5">
              <ModelUploader
                onModelSelect={onModelSelect}
                currentModel={modelUrl}
                modelName={modelName}
              />

              <div className="h-px bg-gradient-to-r from-transparent via-surface-700 to-transparent" />

              <TextureUploader
                onTextureSelect={onTextureSelect}
                disabled={!modelUrl}
                currentTexture={textureUrl}
              />

              {textureApplied && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-success/10 border border-success/20">
                  <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-success">Texture applied</span>
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
