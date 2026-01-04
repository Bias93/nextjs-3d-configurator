'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { TextureTransform } from '@/types/texture-transform';
import { DEFAULT_TEXTURE_TRANSFORM } from '@/types/texture-transform';

/**
 * Hook for managing texture UV transforms per material with debounce.
 */
export function useTextureTransform(debounceMs: number = 16) {
  // Store transforms per material name
  const [transforms, setTransforms] = useState<Record<string, TextureTransform>>({});
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdateRef = useRef<{ material: string; transform: TextureTransform } | null>(null);

  /**
   * Gets the transform for a material, or returns defaults.
   */
  const getTransform = useCallback((materialName: string): TextureTransform => {
    return transforms[materialName] || { ...DEFAULT_TEXTURE_TRANSFORM };
  }, [transforms]);

  /**
   * Internal update with debounce.
   */
  const debouncedUpdate = useCallback((materialName: string, transform: TextureTransform) => {
    pendingUpdateRef.current = { material: materialName, transform };

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (pendingUpdateRef.current) {
        setTransforms(prev => ({
          ...prev,
          [pendingUpdateRef.current!.material]: pendingUpdateRef.current!.transform,
        }));
        pendingUpdateRef.current = null;
      }
    }, debounceMs);
  }, [debounceMs]);

  /**
   * Updates a single property of the transform.
   */
  const updateProperty = useCallback((
    materialName: string,
    property: keyof TextureTransform,
    value: number
  ) => {
    const current = transforms[materialName] || DEFAULT_TEXTURE_TRANSFORM;
    const updated = { ...current, [property]: value };
    debouncedUpdate(materialName, updated);
  }, [transforms, debouncedUpdate]);

  /**
   * Sets the complete transform for a material.
   */
  const setTransform = useCallback((materialName: string, transform: TextureTransform) => {
    setTransforms(prev => ({
      ...prev,
      [materialName]: transform,
    }));
  }, []);

  /**
   * Resets a material's transform to defaults.
   */
  const resetTransform = useCallback((materialName: string) => {
    setTransforms(prev => ({
      ...prev,
      [materialName]: { ...DEFAULT_TEXTURE_TRANSFORM },
    }));
  }, []);

  /**
   * Clears all transforms.
   */
  const clearAll = useCallback(() => {
    setTransforms({});
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    transforms,
    getTransform,
    updateProperty,
    setTransform,
    resetTransform,
    clearAll,
  };
}

export type UseTextureTransformReturn = ReturnType<typeof useTextureTransform>;
