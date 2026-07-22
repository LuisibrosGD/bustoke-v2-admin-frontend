import { PATHS } from '@/lib/constants/paths';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Panel administrativo: nunca debe poder embeberse en un iframe
          // de otro sitio (clickjacking) ni ser indexado por buscadores.
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      {
        // Rutas de Next.js (route handlers) que no deben reescribirse al
        // backend: sin esto, el catch-all de abajo las intercepta antes de
        // que Next.js llegue a resolver la ruta dinamica /api/reports/[slug].
        source: '/api/reports/:path*',
        destination: '/api/reports/:path*',
      },
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_URL_API || 'http://localhost:5000'}/:path*`,
      },
      {
        source: PATHS.signInPage,
        destination: '/sign-in',
      },
      {
        source: PATHS.recoverEmailPage,
        destination: '/recover-email',
      },
      {
        source: PATHS.emailReviewPage,
        destination: '/email-review',
      },
      {
        source: PATHS.resetPasswordPage,
        destination: '/reset-password',
      },
      {
        source: PATHS.resetPasswordReadyPage,
        destination: '/reset-password/ready',
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
