import { InsightsController } from './admin/insights.controller';
import { AttachmentsController } from './core/attachments.controller';
import { AttachmentStorage } from './core/attachment-storage';
import { QuestTemplatesController } from './admin/quest-templates.controller';
import { Controller, Get, Inject, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Request } from 'express';
import { clientTracker, DatabaseRateLimit } from './common/rate-limit';
import { MaintenanceController } from './common/maintenance.controller';
import { Database, DatabaseModule } from './common/database';
import { Public } from './common/http';
import { AuthGuard } from './auth/auth.guard';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { MailAdapter } from './auth/mail.adapter';
import { PlanningController } from './core/planning.controller';
import { PlanningService } from './core/planning.service';
import { HabitsController } from './core/habits.controller';
import { HabitsService } from './core/habits.service';
import { ReflectionController } from './core/reflection.controller';
import { QuestsService } from './core/quests.service';
import { GamificationController } from './gamification/gamification.controller';
import { XpService } from './gamification/xp.service';
import { RewardsService } from './gamification/rewards.service';
import { SocialController } from './social/social.controller';
import { FriendsService } from './social/friends.service';
import { ChallengeLifecycleService } from './social/challenge-lifecycle.service';
import { ChallengesService } from './social/challenges.service';
import { ChallengeScoringService } from './social/challenge-scoring.service';
import { AccountController } from './core/account.controller';
import { FeedbackController } from './core/feedback.controller';
import { DashboardService } from './core/dashboard.service';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';
import { ContentController } from './admin/content.controller';
@Controller('health')
class HealthController {
  constructor(@Inject(Database) private readonly db: Database) {}
  @Public() @Get() async health() {
    await this.db.$queryRaw`SELECT 1`;
    return { status: 'ok', version: '0.1.0' };
  }
}
@Module({
  imports: [
    DatabaseModule,
    ThrottlerModule.forRootAsync({
      inject: [Database],
      useFactory: (db: Database) => ({
        throttlers: [{ ttl: 60000, limit: 180 }],
        getTracker: (_request, context) =>
          clientTracker(context.switchToHttp().getRequest<Request>()),
        ...(process.env['VERCEL'] === '1' ? { storage: new DatabaseRateLimit(db) } : {}),
      }),
    }),
  ],
  controllers: [
    MaintenanceController,
    InsightsController,
    AttachmentsController,
    HealthController,
    AuthController,
    PlanningController,
    HabitsController,
    ReflectionController,
    GamificationController,
    SocialController,
    AccountController,
    FeedbackController,
    AdminController,
    ContentController,
    QuestTemplatesController,
  ],
  providers: [
    AttachmentStorage,
    AuthService,
    MailAdapter,
    PlanningService,
    HabitsService,
    QuestsService,
    XpService,
    RewardsService,
    FriendsService,
    ChallengesService,
    ChallengeLifecycleService,
    ChallengeScoringService,
    DashboardService,
    AdminService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}
