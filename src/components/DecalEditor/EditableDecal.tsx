'use client';

import { useRef, useMemo, useEffect, useCallback } from 'react';
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
 * Inner component that renders the decal with hooks.
 * Assumes textureUrl is already validated by parent.
 */
function EditableDecalInner({
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

  // Create matrix for PivotControls initial/current transform
  // Note: We don't include scale in the matrix - scale is handled separately by Decal
  const pivotMatrix = useMemo(() => {
    const m = new THREE.Matrix4();
    m.compose(
      new THREE.Vector3(...transform.position),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...transform.rotation)),
      new THREE.Vector3(1, 1, 1) // Uniform scale = 1, actual scale via Decal prop
    );
    return m;
  }, [transform.position, transform.rotation]);

  // Convert transform to Three.js objects for Decal
  const decalPosition = useMemo(
    () => new THREE.Vector3(...transform.position),
    [transform.position]
  );

  const decalRotation = useMemo(
    () => new THREE.Euler(...transform.rotation),
    [transform.rotation]
  );

  // Handle PivotControls drag - drei v10.7.7 signature:
  // onDrag(localMatrix, deltaLocalMatrix, worldMatrix, deltaWorldMatrix)
  const handleDrag = useCallback(
    (
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
        // Keep scale from state - scale is controlled separately via slider
        scale: transform.scale,
      });
    },
    [onTransformChange, transform.scale]
  );

  return (
    <>
      {/* PivotControls for interactive transform */}
      <PivotControls
        ref={pivotRef}
        matrix={pivotMatrix}
        autoTransform={false} // We control transform via state, not auto
        scale={0.4}
        visible={isSelected}
        depthTest={false}
        lineWidth={2}
        axisColors={['#ff6b6b', '#51cf66', '#339af0']}
        hoveredColor="#ffd43b"
        onDrag={handleDrag}
        activeAxes={[true, true, true]}
        disableScaling={true} // Scale via slider only
      >
        {/* Invisible helper mesh for the gizmo to attach to */}
        <group>
          <mesh visible={false}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </group>
      </PivotControls>

      {/* The actual Decal rendered on the mesh */}
      <Decal
        mesh={meshRef as React.RefObject<THREE.Mesh>}
        position={decalPosition}
        rotation={decalRotation}
        scale={transform.scale}
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
          depthTest={true}
          depthWrite={false}
        />
      </Decal>
    </>
  );
}

/**
 * Wrapper component that validates props before rendering.
 * Prevents "Cannot read properties of null (reading 'trim')" errors from useTexture.
 */
export function EditableDecal(props: EditableDecalProps) {
  const { textureUrl, meshRef } = props;

  // Validate textureUrl
  const isValidTextureUrl = textureUrl && typeof textureUrl === 'string' && textureUrl.trim().length > 0;

  if (!isValidTextureUrl) {
    console.warn('[EditableDecal] Invalid texture URL provided');
    return null;
  }

  if (!meshRef.current) {
    return null;
  }

  return <EditableDecalInner {...props} />;
}

export default EditableDecal;
