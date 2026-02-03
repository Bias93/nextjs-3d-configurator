'use client';

import { Suspense, useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center } from '@react-three/drei';
import * as THREE from 'three';
import type { DecalTransform, DecalEditorProps } from '@/types/decal';
import { EditableDecal } from './EditableDecal';
import DecalTransformPanel from './DecalTransformPanel';

// No module-level variables - use refs to avoid React Strict Mode issues

interface ModelProps {
  url: string;
  textureUrl: string;
  transform: DecalTransform;
  onTransformChange: (transform: DecalTransform) => void;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * Inner Model component that loads GLB and provides mesh reference for Decal.
 * This component assumes URL is already validated.
 */
function ModelInner({
  url,
  textureUrl,
  transform,
  onTransformChange,
  isSelected,
  onSelect,
}: ModelProps) {
  const { scene } = useGLTF(url);
  const [targetMesh, setTargetMesh] = useState<THREE.Mesh | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);

  // Memoize scene clone to avoid recreating on every render
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  // Find first mesh for decal target when scene changes
  useEffect(() => {
    let found: THREE.Mesh | null = null;
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && !found) {
        found = child;
      }
    });
    meshRef.current = found;
    setTargetMesh(found);
  }, [clonedScene]);

  return (
    <Center>
      <primitive
        object={clonedScene}
        onClick={onSelect}
      />

      {targetMesh && meshRef.current && textureUrl && (
        <EditableDecal
          meshRef={meshRef}
          textureUrl={textureUrl}
          transform={transform}
          onTransformChange={onTransformChange}
          isSelected={isSelected}
          onSelect={onSelect}
        />
      )}
    </Center>
  );
}

/**
 * Wrapper component that validates URLs before rendering ModelInner.
 * This prevents "Cannot read properties of null (reading 'trim')" errors.
 */
function Model(props: ModelProps) {
  const { url, textureUrl } = props;

  // Debug logging
  useEffect(() => {
    console.log('[DecalEditor Model] URLs:', {
      url: url?.substring(0, 50),
      textureUrl: textureUrl?.substring(0, 50),
      urlType: typeof url,
      textureUrlType: typeof textureUrl
    });
  }, [url, textureUrl]);

  // Validate URLs - render nothing if invalid
  const isValidUrl = url && typeof url === 'string' && url.trim().length > 0;
  const isValidTextureUrl = textureUrl && typeof textureUrl === 'string' && textureUrl.trim().length > 0;

  if (!isValidUrl || !isValidTextureUrl) {
    console.warn('[DecalEditor Model] Invalid URLs, rendering null', { isValidUrl, isValidTextureUrl });
    return null;
  }

  return <ModelInner {...props} />;
}

/**
 * Loading fallback.
 */
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#333" wireframe />
    </mesh>
  );
}

/**
 * Debug cube to verify R3F is rendering.
 */
function DebugCube() {
  return (
    <mesh position={[2, 0, 0]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}

/**
 * Main R3F Canvas for decal editing.
 */
export function DecalEditorCanvas({
  modelUrl,
  textureUrl,
  initialTransform,
  onTransformChange,
  onApply,
  onCancel,
}: DecalEditorProps) {
  const [transform, setTransform] = useState<DecalTransform>(
    initialTransform || {
      position: [0, 0, 0.1],
      rotation: [0, 0, 0],
      scale: 0.3,
    }
  );

  // Selection state - lifted from Model component
  const [isSelected, setIsSelected] = useState(true);

  // Refs for WebGL cleanup (use refs instead of module-level variables for React Strict Mode)
  const glRendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const isMountedRef = useRef(true);

  // Notify parent of transform changes
  const handleTransformChange = useCallback((newTransform: DecalTransform) => {
    setTransform(newTransform);
    onTransformChange(newTransform);
  }, [onTransformChange]);

  // Handle panel changes (also notify parent)
  const handlePanelChange = useCallback((newTransform: DecalTransform) => {
    setTransform(newTransform);
    onTransformChange(newTransform);
  }, [onTransformChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
      // Cmd/Ctrl + Enter to apply
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        onApply();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, onApply]);

  // Click outside handler for Canvas
  const handlePointerMissed = useCallback(() => {
    setIsSelected(false);
  }, []);

  // Select handler
  const handleSelect = useCallback(() => {
    setIsSelected(true);
  }, []);

  // Handle Canvas creation - store renderer for cleanup
  const handleCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
    glRendererRef.current = gl;
  }, []);

  // Track mounted state for React Strict Mode
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Note: We intentionally do NOT cleanup the WebGL context on unmount
  // The forceContextLoss() call was causing issues with React Strict Mode
  // and the browser's WebGL context management. Let the browser handle cleanup.

  return (
    <div className="fixed inset-0 z-100 bg-surface-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-surface-100 uppercase tracking-wider">Decal Editor</h2>
            <p className="text-xs text-surface-500">Drag gizmo to position • Escape to cancel • ⌘+Enter to apply</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const resetTransform = { position: [0, 0, 0.1] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: 0.3 };
              setTransform(resetTransform);
              onTransformChange(resetTransform);
            }}
            className="px-4 py-2 text-xs font-bold text-surface-400 hover:text-surface-200 transition-colors uppercase tracking-wider"
          >
            Reset
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold text-surface-400 hover:text-surface-200 transition-colors uppercase tracking-wider"
          >
            Cancel
          </button>
          <button
            onClick={onApply}
            className="px-6 py-2 text-xs font-bold text-surface-950 bg-accent-500 hover:bg-accent-400 rounded-lg transition-colors uppercase tracking-wider"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <Canvas
          camera={{ position: [0, 1, 3], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          onPointerMissed={handlePointerMissed}
          onCreated={handleCreated}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Environment preset="studio" />

          <OrbitControls
            makeDefault
            enablePan={true}
            minDistance={1}
            maxDistance={10}
          />

          {/* Debug cube to verify R3F renders */}
          <DebugCube />

          <Suspense fallback={<LoadingFallback />}>
            <Model
              url={modelUrl}
              textureUrl={textureUrl}
              transform={transform}
              onTransformChange={handleTransformChange}
              isSelected={isSelected}
              onSelect={handleSelect}
            />
          </Suspense>
        </Canvas>

        {/* Transform Panel Overlay */}
        <DecalTransformPanel
          transform={transform}
          onChange={handlePanelChange}
        />
      </div>
    </div>
  );
}

export default DecalEditorCanvas;
