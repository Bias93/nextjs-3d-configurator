import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },

  // Necessario per model-viewer (web component)
  transpilePackages: ['@google/model-viewer', 'three'],
};

export default nextConfig;
