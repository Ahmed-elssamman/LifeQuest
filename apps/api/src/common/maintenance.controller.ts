import { Controller, Get, Inject, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { Public } from './http';
import { Database } from './database';
import { ChallengeLifecycleService } from '../social/challenge-lifecycle.service';
import { AttachmentCleanup } from '../core/attachment-cleanup';

export async function cleanupExpiredRecords(db: Database) {
  const now = new Date();
  await db.rateLimitBucket.deleteMany({
    where: {
      expiresAt: { lt: now },
      OR: [{ blockedUntil: null }, { blockedUntil: { lt: now } }],
    },
  });
  await db.session.deleteMany({ where: { expiresAt: { lt: now } } });
  await db.authToken.deleteMany({ where: { expiresAt: { lt: now } } });
}

@Controller('internal/maintenance')
export class MaintenanceController {
  constructor(
    @Inject(Database) private readonly db: Database,
    @Inject(ChallengeLifecycleService) private readonly lifecycle: ChallengeLifecycleService,
    @Inject(AttachmentCleanup) private readonly cleanup: AttachmentCleanup,
  ) {}
  @Public()
  @Get()
  async run(@Req() request: Request) {
    const secret = process.env['CRON_SECRET'];
    const actual = Buffer.from(request.headers.authorization ?? '');
    const expected = Buffer.from(`Bearer ${secret ?? ''}`);
    if (!secret || actual.length !== expected.length || !timingSafeEqual(actual, expected))
      throw new UnauthorizedException();
    await this.lifecycle.tick();
    await cleanupExpiredRecords(this.db);
    await this.cleanup.drain();
    return { success: true };
  }
}
