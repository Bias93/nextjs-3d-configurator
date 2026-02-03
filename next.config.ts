import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Disable React Strict Mode to prevent double mount/unmount cycles
  // that cause WebGL context issues with R3F
  reactStrictMode: false,

  // Necessario per model-viewer (web component)
  transpilePackages: ['@google/model-viewer', 'three'],
};

export default nextConfig;
