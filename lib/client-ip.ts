import "server-only";
import { headers } from "next/headers";

/** IP do cliente a partir dos headers de proxy (Vercel define x-forwarded-for). */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return headerList.get("x-real-ip") ?? "unknown";
}
