/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & ModelViewerAttributes,
        HTMLElement
      >;
    }
  }

  interface ModelViewerAttributes {
    src?: string;
    poster?: string;
    alt?: string;
    ar?: boolean;
    'ar-modes'?: string;
    'ar-scale'?: string;
    'camera-controls'?: boolean;
    'touch-action'?: string;
    'auto-rotate'?: boolean;
    'rotation-per-second'?: string;
    'interaction-prompt'?: string;
    'shadow-intensity'?: string;
    'shadow-softness'?: string;
    exposure?: string;
    'environment-image'?: string;
    'skybox-image'?: string;
    'tone-mapping'?: string;
    loading?: 'auto' | 'lazy' | 'eager';
    reveal?: 'auto' | 'manual';
    'camera-orbit'?: string;
    'min-camera-orbit'?: string;
    'max-camera-orbit'?: string;
    'field-of-view'?: string;
    'min-field-of-view'?: string;
    'max-field-of-view'?: string;
    'interpolation-decay'?: string;
    style?: React.CSSProperties;
    class?: string;
    ref?: React.Ref<any>;
  }

  interface Texture {
    name?: string;
    source?: {
      uri?: string;
    };
  }

  interface Material {
    name: string;
    pbrMetallicRoughness: {
      baseColorTexture: Texture | null;
      baseColorFactor: [number, number, number, number];
      setBaseColorFactor: (color: [number, number, number, number]) => void;
      setBaseColorTexture: (texture: Texture | null) => void;
    };
  }

  interface ModelViewerElement extends HTMLElement {
    model: {
      materials: Material[];
    } | null;
    availableAnimations: string[];
    currentTime: number;
    paused: boolean;
    autoRotate: boolean;
    cameraOrbit: string;
    play: (options?: { repetitions?: number }) => void;
    pause: () => void;
    updateFraming: () => void;
    toDataURL: (type?: string, quality?: number) => string;
    dismissPoster: () => void;
    createTexture: (uri: string, type?: string) => Promise<Texture>;
  }
}
