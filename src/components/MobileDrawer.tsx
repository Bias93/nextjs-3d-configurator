'use client';

import { useState } from 'react';
import { Drawer } from 'vaul';
import { ModelUploader } from '@/components/ModelUploader';
import { TextureUploader } from '@/components/TextureUploader';

interface MobileDrawerProps {
  modelUrl: string | null;
  modelName: string | null;
  textureUrl: string | null;
  textureApplied: boolean;
  onModelSelect: (url: string, fileName: string) => void;
  onTextureSelect: (url: string) => void;
}

/**
 * Mobile-only bottom sheet drawer using Vaul library.
 * Dynamically imported to avoid SSR hydration issues.
 */
export function MobileDrawer({
  modelUrl,
  modelName,
  textureUrl,
  textureApplied,
  onModelSelect,
  onTextureSelect,
}: MobileDrawerProps) {
  const [snap, setSnap] = useState<number | string | null>("100px");

  return (
    <Drawer.Root
      snapPoints={["100px", "350px"]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      modal={false}
      open={true}
      dismissible={false}
    >
      <Drawer.Portal>
        <Drawer.Content 
          className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-surface-800 rounded-t-3xl outline-none border-t border-surface-700"
        >
          <Drawer.Handle className="mx-auto mt-3 mb-2 w-12 h-1.5 rounded-full bg-surface-500 cursor-grab active:cursor-grabbing" />
          
          <div className="px-4 pb-4 overflow-y-auto flex-1">
            <div className="space-y-6">
              <ModelUploader 
                onModelSelect={onModelSelect}
                currentModel={modelUrl}
                modelName={modelName}
              />

              <div className="h-px bg-linear-to-r from-transparent via-surface-600 to-transparent" />

              <TextureUploader 
                onTextureSelect={onTextureSelect}
                disabled={!modelUrl}
                currentTexture={textureUrl}
              />

              {textureApplied && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10 border border-success/20">
                  <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-success">Texture applied</span>
                </div>
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
