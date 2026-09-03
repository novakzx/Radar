import { z } from "zod";

export const emailSchema = z
  .email({ error: "Informe um e-mail válido." })
  .trim()
  .toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, { error: "A senha deve ter pelo menos 8 caracteres." })
  .regex(/[a-zA-Z]/, { error: "A senha deve conter ao menos uma letra." })
  .regex(/[0-9]/, { error: "A senha deve conter ao menos um número." });

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: "Informe sua senha." }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
