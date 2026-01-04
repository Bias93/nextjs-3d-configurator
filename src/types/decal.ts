/**
 * Tuple representing a 3D vector [x, y, z].
 */
export type Vector3Tuple = [number, number, number];

/**
 * Transform data for a decal on 3D model.
 */
export interface DecalTransform {
  /** 3D position on mesh surface [x, y, z] */
  position: Vector3Tuple;
  /** Rotation in radians [rx, ry, rz] */
  rotation: Vector3Tuple;
  /** Uniform scale factor */
  scale: number;
}

/**
 * State for a decal being edited.
 */
export interface DecalState {
  /** URL of the texture image */
  textureUrl: string | null;
  /** Name of the material the decal is applied to */
  materialName: string | null;
  /** Current transform values */
  transform: DecalTransform;
  /** Whether the editor is currently open */
  isEditing: boolean;
}

/**
 * Default decal transform values.
 */
export const DEFAULT_DECAL_TRANSFORM: DecalTransform = {
  position: [0, 0, 0.1],
  rotation: [0, 0, 0],
  scale: 0.3,
};

/**
 * Transform limits for validation.
 */
export const DECAL_LIMITS = {
  scale: { min: 0.05, max: 2.0 },
  position: { min: -2, max: 2 },
} as const;

/**
 * Props for the DecalEditor component.
 */
export interface DecalEditorProps {
  /** URL of the GLB model */
  modelUrl: string;
  /** URL of the texture to apply as decal */
  textureUrl: string;
  /** Initial transform values */
  initialTransform?: DecalTransform;
  /** Callback when transform changes */
  onTransformChange: (transform: DecalTransform) => void;
  /** Callback when user applies changes */
  onApply: () => void;
  /** Callback when user cancels */
  onCancel: () => void;
}
