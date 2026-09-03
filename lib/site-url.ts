import "server-only";
import { headers } from "next/headers";

/**
 * URL pública da aplicação (sem barra final). Usa `NEXT_PUBLIC_APP_URL`
 * quando configurada (mesma variável do sitemap/robots); caso
 * contrário, deriva do próprio request (host + proto via headers do
 * proxy da Vercel) — nunca aceita esse valor vindo do client.
 */
export async function getBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") ?? "https";
  return `${protocol}://${host}`;
}
