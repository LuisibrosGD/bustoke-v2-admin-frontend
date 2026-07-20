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
