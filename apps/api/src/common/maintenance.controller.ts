import { Controller, Get, Inject, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { Public } from './http';
import { Database } from './database';
import { ChallengeLifecycleService } from '../social/challenge-lifecycle.service';
import { AttachmentCleanup } from '../core/attachment-cleanup';

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
    const now = new Date();
    await this.db.rateLimitBucket.deleteMany({
      where: {
        expiresAt: { lt: now },
        OR: [{ blockedUntil: null }, { blockedUntil: { lt: now } }],
      },
    });
    await this.db.session.deleteMany({ where: { expiresAt: { lt: now } } });
    await this.db.authToken.deleteMany({ where: { expiresAt: { lt: now } } });
    await this.cleanup.drain();
    return { success: true };
  }
}
