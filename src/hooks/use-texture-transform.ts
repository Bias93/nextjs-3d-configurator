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

  // Ref to hold the authoritative latest state (committed + pending)
  // This solves the stale closure issue where rapid updates read old state
  const latestTransformsRef = useRef<Record<string, TextureTransform>>({});

  // Initialize ref from state on mount (or if state is externally set)
  // However, since we drive state from here, we mostly sync state TO ref
  // when component mounts or resets.
  // We'll update the ref whenever we call setTransforms, but also update it
  // immediately on user input.

  /**
   * Gets the transform for a material, or returns defaults.
   * This returns the REACT STATE version (for rendering UI).
   */
  const getTransform = useCallback((materialName: string): TextureTransform => {
    return transforms[materialName] || { ...DEFAULT_TEXTURE_TRANSFORM };
  }, [transforms]);

  /**
   * Internal update with debounce.
   * This synchronizes the Ref state to the React state.
   */
  const debouncedUpdate = useCallback((materialName: string, transform: TextureTransform) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setTransforms(prev => ({
        ...prev,
        [materialName]: transform,
      }));
    }, debounceMs);
  }, [debounceMs]);

  /**
   * Updates a single property of the transform.
   * Updates the Ref immediately (for subsequent calculations) and schedules state update.
   */
  const updateProperty = useCallback((
    materialName: string,
    property: keyof TextureTransform,
    value: number
  ) => {
    // 1. Get the LATEST value from Ref (not stale state)
    const current = latestTransformsRef.current[materialName] || DEFAULT_TEXTURE_TRANSFORM;

    // 2. Calculate new transform
    const updated = { ...current, [property]: value };

    // 3. Update Ref IMMEDIATELY so next call sees it
    latestTransformsRef.current[materialName] = updated;

    // 4. Schedule React state update (for UI)
    debouncedUpdate(materialName, updated);
  }, [debouncedUpdate]);

  /**
   * Sets the complete transform for a material.
   */
  const setTransform = useCallback((materialName: string, transform: TextureTransform) => {
    // Update Ref
    latestTransformsRef.current[materialName] = transform;
    // Update State immediately (no debounce needed for direct set)
    setTransforms(prev => ({
      ...prev,
      [materialName]: transform,
    }));
  }, []);

  /**
   * Resets a material's transform to defaults.
   */
  const resetTransform = useCallback((materialName: string) => {
    const defaultTransform = { ...DEFAULT_TEXTURE_TRANSFORM };
    // Update Ref
    latestTransformsRef.current[materialName] = defaultTransform;
    // Update State
    setTransforms(prev => ({
      ...prev,
      [materialName]: defaultTransform,
    }));
  }, []);

  /**
   * Clears all transforms.
   */
  const clearAll = useCallback(() => {
    latestTransformsRef.current = {};
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
