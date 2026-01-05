'use client';

import { Suspense, useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { DecalTransform, DecalEditorProps } from '@/types/decal';
import { EditableDecal } from './EditableDecal';
import DecalTransformPanel from './DecalTransformPanel';
import { materialTargetMap } from '@/lib/material-utils';

// Define props for the internal Model component
interface ModelProps {
  url: string;
  textureUrl: string;
  transform: DecalTransform;
  onTransformChange: (transform: DecalTransform) => void;
  activeSlotName?: string;
}

/**
 * Model component that loads GLB and provides mesh reference for Decal.
 */
function Model({
  url,
  textureUrl,
  transform,
  onTransformChange,
  activeSlotName,
}: ModelProps) {
  const { scene } = useGLTF(url);
  const texture = useTexture(textureUrl); // Load the texture to apply to the mesh
  const [targetMesh, setTargetMesh] = useState<THREE.Mesh | null>(null);
  const [isSelected, setIsSelected] = useState(true);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const { gl } = useThree();

  // Configure texture encoding to match R3F defaults
  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = false; // model-viewer often flips Y, but standard Three.js might not. Check if needed.
      // Usually GLTF expects flipY=false.
    }
  }, [texture]);

  // Clone scene to avoid modifying cached version
  const clonedScene = scene.clone();

  // Find correct mesh for decal target based on slot name AND apply texture
  useEffect(() => {
    let found: THREE.Mesh | null = null;

    const targetNames = activeSlotName ? (materialTargetMap[activeSlotName] || [activeSlotName]) : [];

    // First try to find by material name
    clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
            const mat = child.material as THREE.MeshStandardMaterial; // Assume standard material
            // Check if this is the target mesh
            if (!found && activeSlotName && targetNames.some(name => mat.name.toLowerCase().includes(name.toLowerCase()))) {
                found = child;
                meshRef.current = child;
                console.log('[DecalEditor] Found target mesh:', child.name);

                // APPLY TEXTURE TO THE MATERIAL so user sees it "wrapped" as requested
                if (texture) {
                    mat.map = texture;
                    mat.needsUpdate = true;
                }
            }
        }
    });

    // Fallback: Find first mesh if not found
    if (!found) {
        clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh && !found) {
            found = child;
            meshRef.current = child;
        }
        });
    }

    setTargetMesh(found);

    // Auto-center logic
    if (found) {
         // Cast to Mesh to ensure geometry access is typed correctly
        const mesh = found as THREE.Mesh;
        if (mesh.geometry) {
            mesh.geometry.computeBoundingBox();
            const box = mesh.geometry.boundingBox;
            if (box) {
                const center = new THREE.Vector3();
                box.getCenter(center);

                // If this is a fresh session or default transform, snap to center
                const isDefault = transform.position[0] === 0 && transform.position[1] === 0 && transform.position[2] === 0.1;

                if (isDefault) {
                     console.log('[DecalEditor] Auto-centering decal at:', center);
                     // We need to notify parent to update state
                     onTransformChange({
                         ...transform,
                         position: [center.x, center.y, center.z + (box.max.z - center.z) + 0.05],
                     });
                }
            }
        }
    }
  }, [url, activeSlotName, texture]);

  // Click outside to deselect
  const handlePointerMissed = useCallback(() => {
    setIsSelected(false);
  }, []);

  useEffect(() => {
    gl.domElement.addEventListener('pointerdown', handlePointerMissed);
    return () => {
      gl.domElement.removeEventListener('pointerdown', handlePointerMissed);
    };
  }, [gl, handlePointerMissed]);

  return (
    <Center>
      <primitive 
        object={clonedScene} 
        onClick={() => setIsSelected(true)}
      />
      
      {targetMesh && meshRef.current && (
        <EditableDecal
          meshRef={meshRef}
          textureUrl={textureUrl}
          transform={transform}
          onTransformChange={onTransformChange}
          isSelected={isSelected}
          onSelect={() => setIsSelected(true)}
        />
      )}
    </Center>
  );
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

// Update DecalEditorProps to include activeSlotName
interface ExtendedDecalEditorProps extends DecalEditorProps {
    activeSlotName?: string;
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
  activeSlotName,
}: ExtendedDecalEditorProps) {
  const [transform, setTransform] = useState<DecalTransform>(
    initialTransform || {
      position: [0, 0, 0.1],
      rotation: [0, 0, 0],
      scale: 0.3,
    }
  );

  // Notify parent of transform changes
  const handleTransformChange = useCallback((newTransform: DecalTransform) => {
    setTransform(newTransform);
    onTransformChange(newTransform);
  }, [onTransformChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

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
            <p className="text-xs text-surface-500">Drag gizmo to position • Escape to cancel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTransform({ position: [0, 0, 0.1], rotation: [0, 0, 0], scale: 0.3 })}
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
          
          <Suspense fallback={<LoadingFallback />}>
            <Model
              url={modelUrl}
              textureUrl={textureUrl}
              transform={transform}
              onTransformChange={handleTransformChange}
              activeSlotName={activeSlotName}
            />
          </Suspense>
        </Canvas>

        {/* Transform Panel Overlay */}
        <DecalTransformPanel 
          transform={transform}
          onChange={setTransform}
        />
      </div>
    </div>
  );
}

export default DecalEditorCanvas;
