'use client';

import { useState, useCallback, useMemo } from 'react';
import type { DecalTransform, DecalState, Vector3Tuple } from '@/types/decal';
import { DEFAULT_DECAL_TRANSFORM } from '@/types/decal';

/**
 * Hook for managing decal transform state.
 */
export function useDecalTransform() {
  const [state, setState] = useState<DecalState>({
    textureUrl: null,
    materialName: null,
    transform: { ...DEFAULT_DECAL_TRANSFORM },
    isEditing: false,
  });

  // Store initial transform for cancel functionality
  const [initialTransform, setInitialTransform] = useState<DecalTransform>(
    { ...DEFAULT_DECAL_TRANSFORM }
  );

  /**
   * Starts editing mode with given texture.
   */
  const startEditing = useCallback((textureUrl: string, materialName: string) => {
    setInitialTransform({ ...state.transform });
    setState(prev => ({
      ...prev,
      textureUrl,
      materialName,
      isEditing: true,
    }));
  }, [state.transform]);

  /**
   * Stops editing mode without saving.
   */
  const cancelEditing = useCallback(() => {
    setState(prev => ({
      ...prev,
      transform: { ...initialTransform },
      isEditing: false,
    }));
  }, [initialTransform]);

  /**
   * Applies changes and exits editing mode.
   */
  const applyEditing = useCallback(() => {
    setState(prev => ({
      ...prev,
      isEditing: false,
    }));
  }, []);

  /**
   * Updates position.
   */
  const setPosition = useCallback((position: Vector3Tuple) => {
    setState(prev => ({
      ...prev,
      transform: { ...prev.transform, position },
    }));
  }, []);

  /**
   * Updates rotation.
   */
  const setRotation = useCallback((rotation: Vector3Tuple) => {
    setState(prev => ({
      ...prev,
      transform: { ...prev.transform, rotation },
    }));
  }, []);

  /**
   * Updates scale.
   */
  const setScale = useCallback((scale: number) => {
    setState(prev => ({
      ...prev,
      transform: { ...prev.transform, scale: Math.max(0.05, Math.min(2.0, scale)) },
    }));
  }, []);

  /**
   * Updates the entire transform at once.
   */
  const setTransform = useCallback((transform: DecalTransform) => {
    setState(prev => ({
      ...prev,
      transform,
    }));
  }, []);

  /**
   * Resets transform to defaults.
   */
  const resetTransform = useCallback(() => {
    setState(prev => ({
      ...prev,
      transform: { ...DEFAULT_DECAL_TRANSFORM },
    }));
  }, []);

  return useMemo(() => ({
    ...state,
    startEditing,
    cancelEditing,
    applyEditing,
    setPosition,
    setRotation,
    setScale,
    setTransform,
    resetTransform,
  }), [state, startEditing, cancelEditing, applyEditing, setPosition, setRotation, setScale, setTransform, resetTransform]);
}

export type UseDecalTransformReturn = ReturnType<typeof useDecalTransform>;
