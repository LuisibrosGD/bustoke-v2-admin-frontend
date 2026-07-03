import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bustoke - Admin',
  description: 'Bustoke - Panel de administración de transporte',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/icons/logo.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      {
        url: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcut: ['/favicon.ico'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

import { GlobalAlertDialog, Providers } from '@/components/shared';
import { Toaster } from '@/components/ui';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-dvh antialiased">
        <Providers>
          {children}
          <GlobalAlertDialog />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
