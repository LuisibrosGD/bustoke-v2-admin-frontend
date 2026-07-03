import { z } from 'zod';

export const signInFormSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un email válido.' }),
  password: z
    .string()
    .min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' }),
});

export type SignInFormSchema = z.infer<typeof signInFormSchema>;

export const recoverEmailFormSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un email válido.' }),
});

export type RecoverEmailFormSchema = z.infer<typeof recoverEmailFormSchema>;

export const resetPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' }),
    confirmPassword: z.string().min(8, {
      message:
        'La confirmación de contraseña debe tener al menos 8 caracteres.',
    }),
    token: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas deben coincidir.',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormSchema = z.infer<typeof resetPasswordFormSchema>;
