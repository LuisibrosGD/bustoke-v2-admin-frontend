import { cn } from '@/lib/utils';
import { ClassValue } from 'class-variance-authority/types';
import { ReactNode } from 'react';

interface FeatureStatsCardProps {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  iconWrapperClassName?: ClassValue;
}

export function FeatureStatsCard({
  title,
  value,
  icon,
  iconWrapperClassName = 'bg-blue-50 text-blue-600',
}: FeatureStatsCardProps) {
  return (
    <div className="bg-card border rounded-lg p-5 flex items-center gap-4">
      <div className={cn('p-3 rounded-lg', iconWrapperClassName)}>{icon}</div>
      <div>
        <p className="text-xxs font-bold text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}
