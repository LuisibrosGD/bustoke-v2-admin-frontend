import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbText,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb/breadcrumb';
import React from 'react';
import Link from 'next/link';

interface BreadcrumbItemProps {
  label: string;
  href?: string;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItemProps[];
}

export function PageBreadcrumb({ items }: PageBreadcrumbProps) {
  const mobileHiddenClassName = 'hidden md:block';

  // Si hay menos de 6 items, mostrar todos
  if (items.length < 6) {
    return (
      <div className={mobileHiddenClassName}>
        <Breadcrumb>
          <BreadcrumbList>
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              return (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : item.href ? (
                      <BreadcrumbLink asChild>
                        <Link href={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbText>{item.label}</BreadcrumbText>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    );
  }

  const firstItem = items[0];
  const secondLastItem = items[items.length - 2];
  const lastItem = items[items.length - 1];

  return (
    <div className={mobileHiddenClassName}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {firstItem.href ? (
              <BreadcrumbLink asChild>
                <Link href={firstItem.href}>{firstItem.label}</Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbText>{firstItem.label}</BreadcrumbText>
            )}
          </BreadcrumbItem>
          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbText>...</BreadcrumbText>
          </BreadcrumbItem>
          <BreadcrumbSeparator />

          <BreadcrumbItem>
            {secondLastItem.href ? (
              <BreadcrumbLink asChild>
                <Link href={secondLastItem.href}>{secondLastItem.label}</Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbText>{secondLastItem.label}</BreadcrumbText>
            )}
          </BreadcrumbItem>
          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>{lastItem.label}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
