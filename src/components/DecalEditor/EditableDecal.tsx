'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useTexture, Decal, PivotControls } from '@react-three/drei';
import * as THREE from 'three';
import type { DecalTransform } from '@/types/decal';

interface EditableDecalProps {
  /** Reference to the parent mesh for decal projection */
  meshRef: React.RefObject<THREE.Mesh | null>;
  /** URL of the texture image */
  textureUrl: string;
  /** Current transform values */
  transform: DecalTransform;
  /** Callback when transform changes via gizmo */
  onTransformChange: (transform: DecalTransform) => void;
  /** Whether this decal is selected (shows gizmo) */
  isSelected: boolean;
  /** Callback when decal is clicked */
  onSelect: () => void;
}

/**
 * Editable decal with PivotControls gizmo for interactive transform.
 */
export function EditableDecal({
  meshRef,
  textureUrl,
  transform,
  onTransformChange,
  isSelected,
  onSelect,
}: EditableDecalProps) {
  const texture = useTexture(textureUrl);
  const pivotRef = useRef<THREE.Group>(null);

  // Configure texture
  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
    }
  }, [texture]);

  // Convert transform to Three.js objects
  const position = useMemo(() => 
    new THREE.Vector3(...transform.position), 
    [transform.position]
  );
  
  const rotation = useMemo(() => 
    new THREE.Euler(...transform.rotation), 
    [transform.rotation]
  );

  // Handle PivotControls drag
  const handleDrag = (
    localMatrix: THREE.Matrix4,
    _deltaLocalMatrix: THREE.Matrix4,
    _worldMatrix: THREE.Matrix4,
    _deltaWorldMatrix: THREE.Matrix4
  ) => {
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scl = new THREE.Vector3();
    
    localMatrix.decompose(pos, quat, scl);
    
    const euler = new THREE.Euler().setFromQuaternion(quat);
    
    onTransformChange({
      position: [pos.x, pos.y, pos.z],
      rotation: [euler.x, euler.y, euler.z],
      scale: Math.max(0.05, Math.min(2.0, scl.x * transform.scale)),
    });
  };

  if (!meshRef.current) return null;

  return (
    <>
      {/* PivotControls for interactive transform */}
      <PivotControls
        ref={pivotRef}
        offset={transform.position}
        rotation={transform.rotation}
        scale={0.3}
        visible={isSelected}
        depthTest={false}
        lineWidth={2}
        axisColors={['#ff6b6b', '#51cf66', '#339af0']}
        hoveredColor="#ffd43b"
        onDrag={handleDrag}
        activeAxes={[true, true, true]}
      >
        {/* Helper mesh for visual feedback of position */}
        <mesh>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color="yellow" wireframe depthTest={false} />
        </mesh>
      </PivotControls>

      {/* The actual Decal rendered on the mesh */}
      <Decal
        mesh={meshRef as any}
        position={position}
        rotation={rotation}
        scale={transform.scale}
        renderOrder={100}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <meshStandardMaterial
          map={texture}
          transparent
          polygonOffset
          polygonOffsetFactor={-10}
          depthTest={false} // Disable depth test to ensure visibility
          depthWrite={false}
          side={THREE.DoubleSide} // Ensure visibility from all angles
        />
      </Decal>
    </>
  );
}

export default EditableDecal;
