"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { registerUser } from "@/services/AuthService";
import { loginSchema, registerSchema } from "@/lib/validation/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/client-ip";

export type AuthFormState =
  | {
      errors?: Partial<Record<"email" | "password", string[]>>;
      message?: string;
    }
  | undefined;

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validated = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const result = await registerUser(validated.data);
  if (!result.ok) {
    return { message: result.error };
  }

  // Após criar a conta, autentica automaticamente e envia para o dashboard.
  try {
    await signIn("credentials", {
      email: validated.data.email,
      password: validated.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        message:
          "Conta criada, mas não foi possível entrar automaticamente. Faça login manualmente.",
      };
    }
    throw error;
  }

  redirect("/dashboard");
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validated = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  // Rate limit por IP + conta (seção 10): 5 tentativas / 15 min, cada
  // combinação verificada separadamente para não travar toda uma rede
  // (IP compartilhado) nem permitir força bruta trocando de IP.
  const ip = await getClientIp();
  const [ipCheck, accountCheck] = await Promise.all([
    checkRateLimit("login", `ip:${ip}`),
    checkRateLimit("login", `account:${validated.data.email}`),
  ]);
  if (!ipCheck.allowed || !accountCheck.allowed) {
    return { message: "Muitas tentativas de login. Tente novamente em alguns minutos." };
  }

  try {
    await signIn("credentials", {
      email: validated.data.email,
      password: validated.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "E-mail ou senha inválidos." };
    }
    throw error;
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await signOut({ redirect: false });
  redirect("/login");
}
