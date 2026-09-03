import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Limites da seção 10. Sem Upstash configurado (ex.: dev local sem
// conta criada ainda), o rate limit é ignorado — nunca bloqueia o
// usuário por falta de infraestrutura opcional.
const LIMIT_CONFIG = {
  login: { max: 5, window: "15 m" as const },
  search: { max: 10, window: "1 h" as const },
  export: { max: 5, window: "1 h" as const },
  checkout: { max: 8, window: "1 h" as const },
  ticket_create: { max: 10, window: "1 h" as const },
};

export type RateLimitKind = keyof typeof LIMIT_CONFIG;

export interface RateLimitCheck {
  allowed: boolean;
  remaining?: number;
}

const limiters = new Map<RateLimitKind, Ratelimit>();

function getLimiter(kind: RateLimitKind): Ratelimit | null {
  if (!redis) return null;

  const cached = limiters.get(kind);
  if (cached) return cached;

  const { max, window } = LIMIT_CONFIG[kind];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, window),
    prefix: `codevision-radar:ratelimit:${kind}`,
  });
  limiters.set(kind, limiter);
  return limiter;
}

export async function checkRateLimit(
  kind: RateLimitKind,
  identifier: string,
): Promise<RateLimitCheck> {
  const limiter = getLimiter(kind);
  if (!limiter) {
    return { allowed: true };
  }

  const result = await limiter.limit(identifier);
  return { allowed: result.success, remaining: result.remaining };
}
