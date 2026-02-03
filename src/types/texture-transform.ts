/**
 * Texture UV transform data.
 */
export interface TextureTransform {
  /** Offset U (-1.0 to 1.0), default 0 */
  offsetU: number;
  /** Offset V (-1.0 to 1.0), default 0 */
  offsetV: number;
  /** Scale U (0.1 to 5.0), default 1 */
  scaleU: number;
  /** Scale V (0.1 to 5.0), default 1 */
  scaleV: number;
  /** Rotation in degrees (0 to 360), default 0 */
  rotation: number;
}

/**
 * Union type for texture transform properties.
 */
export type TextureTransformProperty = keyof TextureTransform;

/**
 * Default texture transform values.
 */
export const DEFAULT_TEXTURE_TRANSFORM: TextureTransform = {
  offsetU: 0,
  offsetV: 0,
  scaleU: 1,
  scaleV: 1,
  rotation: 0,
};

/**
 * Transform limits for validation.
 */
export const TRANSFORM_LIMITS = {
  offset: { min: -1, max: 1, step: 0.01 },
  scale: { min: 0.1, max: 5, step: 0.1 },
  rotation: { min: 0, max: 360, step: 1 },
} as const;
