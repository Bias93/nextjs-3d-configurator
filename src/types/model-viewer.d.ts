/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';

declare global {
  interface ModelViewerAttributes {
    src?: string;
    poster?: string;
    alt?: string;
    ar?: boolean;
    'ar-modes'?: string;
    'ar-scale'?: string;
    'ar-placement'?: 'floor' | 'wall';
    'xr-environment'?: boolean;
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
    'skybox-height'?: string;
    'tone-mapping'?: 'neutral' | 'aces' | 'agx' | 'cineon' | 'reinhard' | 'linear' | 'none';
    loading?: 'auto' | 'lazy' | 'eager';
    reveal?: 'auto' | 'manual';
    'camera-orbit'?: string;
    'min-camera-orbit'?: string;
    'max-camera-orbit'?: string;
    'field-of-view'?: string;
    'min-field-of-view'?: string;
    'max-field-of-view'?: string;
    'interpolation-decay'?: string;
    'ios-src'?: string;
    style?: React.CSSProperties;
    class?: string;
    className?: string;
    ref?: React.Ref<any>;
    children?: React.ReactNode;
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
    activateAR: () => Promise<void>;
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & ModelViewerAttributes,
        HTMLElement
      >;
    }
  }
}
