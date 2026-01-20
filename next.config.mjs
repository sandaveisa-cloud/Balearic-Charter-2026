import createNextIntlPlugin from 'next-intl/plugin';

// Use relative path - ensure i18n.ts is in the root directory
// Vercel should resolve this correctly during build
const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure date-fns is properly transpiled
  transpilePackages: ['date-fns'],
  webpack: (config, { isServer }) => {
    // Fix for date-fns vendor chunk issue
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  images: {
    domains: ['localhost', 'supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    // Enable automatic image optimization
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for different breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum quality for optimized images
    minimumCacheTTL: 60,
    // Enable dangerous allow all for Supabase Storage (can be restricted later)
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default withNextIntl(nextConfig);
