'use client';

import { XIcon } from 'lucide-react';
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
} from '../ui';
import { cva } from 'class-variance-authority';

export const alertVariants = cva('border-none', {
  variants: {
    type: {
      success: 'bg-success-50 text-success-700',
      warning: 'bg-warning-50 text-warning-700',
      error: 'bg-error-50 text-error-700',
    },
  },
  defaultVariants: {
    type: 'success',
  },
});

export const alertTitleVariants = cva('mb-1 font-medium', {
  variants: {
    type: {
      success: 'text-success-700',
      warning: 'text-warning-700',
      error: 'text-error-700',
    },
  },
});

export const badgeVariants = cva('bg-white border', {
  variants: {
    type: {
      success: 'border-success-200 text-success-700',
      warning: 'border-warning-200 text-warning-700',
      error: 'border-error-200 text-error-700',
    },
  },
});

export const alertDescriptionVariants = cva('', {
  variants: {
    type: {
      success: 'text-success-700',
      warning: 'text-warning-700',
      error: 'text-error-700',
    },
  },
});

export const closeButtonVariants = cva('', {
  variants: {
    type: {
      success: 'text-success-700',
      warning: 'text-warning-700',
      error: 'text-error-700',
    },
  },
});

export function GlobalAlert({
  title,
  description,
  onClose,
  badgeLabel,
  type = 'success',
}: {
  type?: 'success' | 'warning' | 'error';
  title?: string;
  showTypeIcon?: boolean;
  description: string;
  badgeLabel?: string;
  onClose?: () => void;
}) {
  return (
    <Alert className={alertVariants({ type })}>
      {title && (
        <AlertTitle className={alertTitleVariants({ type })}>
          {title}
        </AlertTitle>
      )}
      <AlertDescription>
        <div className="flex items-center gap-3">
          {badgeLabel && (
            <Badge className={badgeVariants({ type })}>{badgeLabel}</Badge>
          )}
          <span className={alertDescriptionVariants({ type })}>
            {description}
          </span>
        </div>
      </AlertDescription>
      {Boolean(onClose) && (
        <AlertAction>
          <Button
            type="button"
            className={closeButtonVariants({ type })}
            size="icon-sm"
            variant="link"
            onClick={onClose}
          >
            <XIcon />
          </Button>
        </AlertAction>
      )}
    </Alert>
  );
}
