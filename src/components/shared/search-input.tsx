'use client';

import {
  FieldDescription,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Spinner,
} from '@/components/ui';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

interface SearchInputProps extends React.ComponentProps<'input'> {
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
  description?: string;
}

export function SearchInput({
  placeholder = 'Buscar por nombre o por código',
  isLoading = false,
  description,
  className,
  onChange,
  ...props
}: SearchInputProps) {
  const isMobile = useIsMobile();
  const displayPlaceholder = isMobile ? 'Buscar' : placeholder;

  return (
    <div className="w-full">
      <InputGroup className={cn('md:max-w-sm', className)}>
        <InputGroupInput
          placeholder={displayPlaceholder}
          onChange={onChange}
          {...props}
        />
        <InputGroupAddon>
          {isLoading ? <Spinner /> : <Search />}
        </InputGroupAddon>
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
    </div>
  );
}
