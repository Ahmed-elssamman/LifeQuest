import { ThrottlerStorage } from '@nestjs/throttler';
import { createHash } from 'node:crypto';
import { isIP } from 'node:net';
import { Request } from 'express';
import { Database } from './database';

export function clientTracker(request: Request) {
  // Vercel overwrites this header at its trusted edge. Never trust it locally.
  const forwarded = request.headers['x-vercel-forwarded-for'];
  const address = typeof forwarded === 'string' ? (forwarded.split(',')[0] ?? '').trim() : '';
  return process.env['VERCEL'] === '1' && isIP(address) ? address : (request.ip ?? 'unknown');
}

/** Atomic shared windows prevent cold starts or parallel instances bypassing limits. */
export class DatabaseRateLimit implements ThrottlerStorage {
  constructor(private readonly db: Database) {}
  async increment(key: string, ttl: number, limit: number, blockDuration: number) {
    const hash = createHash('sha256').update(key).digest('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttl);
    const blockedUntil = new Date(now.getTime() + blockDuration);
    const rows = await this.db.$queryRaw<
      { hits: number; expiresAt: Date; blockedUntil: Date | null }[]
    >`INSERT INTO "RateLimitBucket" ("key", "hits", "expiresAt", "blockedUntil")
      VALUES (${hash}, 1, ${expiresAt}, NULL)
      ON CONFLICT ("key") DO UPDATE SET
        "hits" = CASE WHEN "RateLimitBucket"."expiresAt" <= ${now}
          AND COALESCE("RateLimitBucket"."blockedUntil", ${now}) <= ${now}
          THEN 1 ELSE "RateLimitBucket"."hits" + 1 END,
        "expiresAt" = CASE WHEN "RateLimitBucket"."expiresAt" <= ${now}
          AND COALESCE("RateLimitBucket"."blockedUntil", ${now}) <= ${now}
          THEN ${expiresAt} ELSE "RateLimitBucket"."expiresAt" END,
        "blockedUntil" = CASE
          WHEN "RateLimitBucket"."blockedUntil" > ${now} THEN "RateLimitBucket"."blockedUntil"
          WHEN "RateLimitBucket"."expiresAt" <= ${now} THEN NULL
          WHEN "RateLimitBucket"."hits" >= ${limit} THEN ${blockedUntil}
          ELSE NULL END
      RETURNING "hits", "expiresAt", "blockedUntil"`;
    const row = rows[0];
    if (!row) throw new Error('Rate limit storage unavailable');
    return {
      totalHits: row.hits,
      timeToExpire: Math.max(0, Math.ceil((row.expiresAt.getTime() - now.getTime()) / 1000)),
      isBlocked: Boolean(row.blockedUntil && row.blockedUntil > now),
      timeToBlockExpire: Math.max(
        0,
        Math.ceil(((row.blockedUntil?.getTime() ?? 0) - now.getTime()) / 1000),
      ),
    };
  }
}
