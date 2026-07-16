import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ✅ REMOVED: eslint key (no longer supported in next.config.ts)
  // ESLint is now configured in eslint.config.mjs
  
  // Output configuration for Render deployment
  output: 'standalone',
  
  // Timeout for static page generation
  staticPageGenerationTimeout: 120,
  
  // External packages that should be handled by server
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  
  // Optional: Experimental features (uncomment if needed)
  // experimental: {
  //   serverActions: true,
  // },
  
  // Optional: Image optimization settings
  // images: {
  //   domains: ['your-domain.com'],
  //   remotePatterns: [
  //     {
  //       protocol: 'https',
  //       hostname: '**',
  //     },
  //   ],
  // },
  
  // Optional: Redirects and rewrites
  // async redirects() {
  //   return [
  //     {
  //       source: '/old-path',
  //       destination: '/new-path',
  //       permanent: true,
  //     },
  //   ];
  // },
};

export default nextConfig;