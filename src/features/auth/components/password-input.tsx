'use client';

import { Controller, useFormContext } from 'react-hook-form';

import {
  Field,
  FieldLabel,
  FieldError,
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from '@/components/ui';
import { useState } from 'react';

export function PasswordInput({
  name,
  label = 'Contraseña*',
  placeholder = 'Escribe tu contraseña',
}: {
  name: string;
  label?: string;
  placeholder?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const form = useFormContext();
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="relative">
          <FieldLabel htmlFor={name} className="md:text-base xl:text-sm">
            {label}
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id={name}
              type={showPassword ? 'text' : 'password'}
              placeholder={placeholder}
              aria-invalid={fieldState.invalid}
              className="md:h-12 md:text-base xl:h-11 xl:text-sm"
              {...field}
            />
            {field.value && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  className="font-semibold text-primary-700 md:text-base xl:text-sm"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}
