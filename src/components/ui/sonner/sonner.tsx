'use client';

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
          '--error-bg': 'var(--color-error-50)',
          '--error-text': 'var(--color-error-900)',
          '--error-border': 'var(--color-error-200)',
          '--success-bg': 'var(--color-success-50)',
          '--success-text': 'var(--color-success-900)',
          '--success-border': 'var(--color-success-200)',
          '--warning-bg': 'var(--color-warning-50)',
          '--warning-text': 'var(--color-warning-900)',
          '--warning-border': 'var(--color-warning-200)',
        } as React.CSSProperties
      }
      {...props}
      richColors
      closeButton
    />
  );
};

export { Toaster };
