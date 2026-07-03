import { Separator, Skeleton } from '@/components/ui';
import { Fragment } from 'react';

export function SkeletonTable() {
  return (
    <div className="border rounded-md">
      <div className="p-5">
        <Skeleton className="w-full h-6 max-w-xs" />
      </div>
      <div className="h-11 w-full bg-gray-100"></div>
      <div className="flex w-full flex-col">
        {Array.from({ length: 5 }).map((_, index) => (
          <Fragment key={index}>
            <div className="grid grid-cols-12 gap-2 md:gap-6 p-5">
              <Skeleton className="w-full h-6 col-span-3" />
              <Skeleton className="w-full h-6 col-span-2" />
              <Skeleton className="w-full h-6 col-span-2" />
              <Skeleton className="w-full h-6 col-span-2" />
              <Skeleton className="w-full h-6 col-span-2" />
              <Skeleton className="w-full h-6 col-span-1" />
            </div>
            <Separator />
          </Fragment>
        ))}
        <div className="flex justify-between gap-2 md:gap-6 p-5">
          <Skeleton className="w-30 h-9" />
          <Skeleton className="w-30 h-9" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonFilters() {
  return (
    <div className="flex justify-between w-full">
      <Skeleton className="w-full max-w-65 h-9" />
      <Skeleton className="w-30 h-9" />
    </div>
  );
}

export function SkeletonHeaderPage() {
  return (
    <div className="flex justify-between w-full">
      <div className="w-full flex flex-col gap-2">
        <Skeleton className="w-full max-w-65 h-9" />
        <Skeleton className="w-full max-w-100 h-6" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="w-30 h-9" />
        <Skeleton className="w-30 h-9" />
      </div>
    </div>
  );
}
