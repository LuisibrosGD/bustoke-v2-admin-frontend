import { cva } from 'class-variance-authority';

const tagStatusContainerVariants = cva(
  'inline-flex items-center gap-2 text-sm font-medium rounded-full px-2.5 py-0.5',
  {
    variants: {
      status: {
        success: 'bg-success-50 text-success-700',
        warning: 'bg-warning-50 text-warning-700 border border-warning-100',
        error: 'bg-error-50 text-error-700',
        default: 'bg-gray-50 text-gray-700',
        info: 'bg-info-50 text-info-700',
        indigo: 'bg-indigo-50 text-indigo-700',
        purple: 'bg-purple-50 text-purple-700 border border-purple-100',
        pink: 'bg-pink-50 text-pink-700',
        orange: 'bg-orange-50 text-orange-700',
        teal: 'bg-teal-50 text-teal-700',
        blue: 'bg-blue-50 text-blue-700',
      },
    },
    defaultVariants: {
      status: 'default',
    },
  }
);

const tagStatusIndicatorVariants = cva('size-2 rounded-full', {
  variants: {
    status: {
      success: 'bg-success-700',
      warning: 'bg-warning-500',
      error: 'bg-error-700',
      default: 'bg-gray-500',
      info: 'bg-info-500',
      indigo: 'bg-indigo-500',
      purple: 'bg-purple-500',
      pink: 'bg-pink-500',
      orange: 'bg-orange-500',
      teal: 'bg-teal-500',
      blue: 'bg-blue-500',
    },
  },
  defaultVariants: {
    status: 'default',
  },
});

export type TagStatusColor =
  | 'success'
  | 'warning'
  | 'error'
  | 'default'
  | 'info'
  | 'indigo'
  | 'purple'
  | 'pink'
  | 'orange'
  | 'teal'
  | 'blue';

export function TagStatus({
  children,
  status = 'success',
  icon,
  className,
  ...props
}: {
  children: React.ReactNode;
  status?: TagStatusColor;
  icon?: React.ReactNode;
} & React.ComponentProps<'div'>) {
  return (
    <div
      className={tagStatusContainerVariants({ status, className })}
      {...props}
    >
      {icon ?? <div className={tagStatusIndicatorVariants({ status })} />}
      {children}
    </div>
  );
}
