import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ✅ ESLint key is REMOVED - this is correct
  // ESLint is now configured in eslint.config.mjs
  
  output: 'standalone',
  staticPageGenerationTimeout: 120,
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
};

export default nextConfig;