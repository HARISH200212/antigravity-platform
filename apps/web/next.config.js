/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    // Lint warnings won't block production builds — fixed in Phase 9
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type errors are warnings-only during initial deploy — fixed in Phase 9
    ignoreBuildErrors: true,
  },
  turbopack: {
    resolveAlias: {
      '@': '.',
    },
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://agt-api.onrender.com',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'wss://agt-api.onrender.com',
  },
};

export default nextConfig;
