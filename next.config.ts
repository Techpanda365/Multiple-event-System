import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ✅ Yeh line add karo
  output: 'standalone',
  
  // ✅ Dynamic pages ke liye
  staticPageGenerationTimeout: 120,
  
  // ✅ Next.js 16.2.9 specific
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  
  // ✅ Experimental features
  experimental: {
    // Agar server actions use kar rahe ho toh
    // serverActions: true,
  },
};

export default nextConfig;