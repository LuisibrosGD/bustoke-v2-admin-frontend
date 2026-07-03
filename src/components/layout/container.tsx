import { cn } from '@/lib/utils/style';

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('container mx-auto px-3 sm:px-4', className)}>
      {children}
    </div>
  );
}
