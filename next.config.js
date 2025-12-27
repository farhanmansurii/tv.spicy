/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Next.js 16 optimizations
  experimental: {
    // Enable Turbopack file system caching for faster dev builds
    turbopackFileSystemCacheForDev: true,
    // React Compiler requires babel-plugin-react-compiler package
    // Uncomment after installing: npm install babel-plugin-react-compiler
    // reactCompiler: true,
  },
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },
}

module.exports = nextConfig
