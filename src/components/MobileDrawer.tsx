'use client';

import { useState, RefObject } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
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
      {/* Collapsed bar - always visible at bottom */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-0 inset-x-0 z-40 bg-surface-900 border-t border-surface-700 py-3 px-4"
      >
        <div className="w-12 h-1 bg-surface-600 rounded-full mx-auto mb-2" />
        <span className="text-xs font-medium text-surface-400 uppercase tracking-widest">
          Tap to customize
        </span>
      </button>

      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="bg-surface-900 border-surface-700 max-h-[85vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-surface-300 text-sm font-medium text-center">
              Customize
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

              <div className="h-px bg-gradient-to-r from-transparent via-surface-700 to-transparent" />

              <ColorPicker
                viewerRef={viewerRef}
                disabled={!modelUrl}
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
