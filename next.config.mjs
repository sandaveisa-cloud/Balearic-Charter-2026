import createNextIntlPlugin from 'next-intl/plugin';

// next-intl App Router request config
// See: https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable source maps in production to prevent 404 errors for .map files
  productionBrowserSourceMaps: false,
  // Ensure date-fns is properly transpiled
  transpilePackages: ['date-fns'],
  
  // Redirects for legacy and locale-specific paths accessed without locale prefix
  async redirects() {
    return [
      // Root path redirect to default locale (backup if middleware fails)
      {
        source: '/',
        destination: '/en',
        permanent: false, // Use temporary redirect to allow middleware to handle it
      },
      // Spanish paths without locale prefix -> redirect to /es/
      {
        source: '/sobre-nosotros',
        destination: '/es/sobre-nosotros',
        permanent: true,
      },
      {
        source: '/contacto',
        destination: '/es/contacto',
        permanent: true,
      },
      // German paths without locale prefix -> redirect to /de/
      {
        source: '/ueber-uns',
        destination: '/de/ueber-uns',
        permanent: true,
      },
      {
        source: '/kontakt',
        destination: '/de/kontakt',
        permanent: true,
      },
      // English paths without locale prefix -> redirect to /en/
      {
        source: '/about',
        destination: '/en/about',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/en/contact',
        permanent: true,
      },
      {
        source: '/fleet',
        destination: '/en/fleet',
        permanent: true,
      },
      {
        source: '/destinations',
        destination: '/en/destinations',
        permanent: true,
      },
      // Hash-based legacy anchors (for old bookmarks)
      {
        source: '/:locale/sobre-nosotros#booking',
        destination: '/:locale/contacto',
        permanent: true,
      },
      {
        source: '/:locale/about#booking',
        destination: '/:locale/contact',
        permanent: true,
      },
    ]
  },
  
  webpack: (config, { isServer, dev }) => {
    // Fix for date-fns vendor chunk issue
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    // Disable source maps in production
    if (!dev) {
      config.devtool = false;
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '**',
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
