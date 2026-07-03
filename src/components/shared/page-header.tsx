import { Button } from '../ui';
import Link from 'next/link';

interface PageHeaderButton {
  label: string;
  icon: React.ReactNode;
  variant?: 'outline' | 'default';
  as: 'link' | 'button';
  href?: string;
  onClick?: () => void;
}

interface PageHeaderProps {
  title: string;
  description: string;
  buttons?: PageHeaderButton[];
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  buttons,
  children,
}: PageHeaderProps) {
  return (
    <section className="flex max-md:flex-col max-md:gap-6 justify-between gap-4">
      <div>
        <h1 className="font-semibold max-md:text-2xl text-3xl mb-1">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="flex max-md:gap-2 gap-3">
        {buttons?.map((button) =>
          button.as === 'link' && !!button.href ? (
            <Button
              asChild
              key={button.label}
              variant={button.variant}
              className="max-md:px-3 max-md:py-2"
            >
              <Link href={button.href}>
                {button.icon}
                {button.label}
              </Link>
            </Button>
          ) : (
            <Button
              key={button.label}
              variant={button.variant}
              onClick={button.onClick}
              className="max-md:px-3 max-md:py-2"
            >
              {button.icon}
              {button.label}
            </Button>
          )
        )}
        {children}
      </div>
    </section>
  );
}
