import { achievementProgress } from './achievement-progress';
import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InputOf, redeemSchema, rewardSchema, paginationSchema } from '@lifequest/contracts';
import { pageArgs, pageResult } from '../core/ownership';
import { Database } from '../common/database';
import { CurrentUser, Identity, Validate } from '../common/http';
import { XpService } from './xp.service';
import { RewardsService } from './rewards.service';
@ApiTags('XP, achievements and rewards')
@Controller()
export class GamificationController {
  constructor(
    @Inject(Database) private readonly db: Database,
    @Inject(XpService) private readonly xp: XpService,
    @Inject(RewardsService) private readonly rewards: RewardsService,
  ) {}
  @Get('xp') summary(@CurrentUser() user: Identity) {
    return this.xp.summary(user.id);
  }
  @Get('achievements') async achievements(@CurrentUser() user: Identity) {
    const [items, owned, values] = await Promise.all([
      this.db.achievement.findMany({ where: { active: true }, orderBy: { threshold: 'asc' } }),
      this.db.userAchievement.findMany({ where: { userId: user.id } }),
      achievementProgress(this.db, user.id),
    ]);
    return items
      .filter((item) => !item.hidden || owned.some((own) => own.achievementId === item.id))
      .map((item) => ({
        ...item,
        unlockedAt: owned.find((own) => own.achievementId === item.id)?.unlockedAt ?? null,
        progress: Math.min(item.threshold, values[item.condition] ?? 0),
      }));
  }
  @Get('rewards') list(
    @CurrentUser() user: Identity,
    @Query(new Validate(paginationSchema)) query: InputOf<typeof paginationSchema>,
  ) {
    return this.rewards.list(user.id, query);
  }
  @Post('rewards') create(
    @CurrentUser() user: Identity,
    @Body(new Validate(rewardSchema)) input: InputOf<typeof rewardSchema>,
  ) {
    return this.rewards.create(user.id, input);
  }
  @Post('rewards/:id/redeem') redeem(
    @CurrentUser() user: Identity,
    @Param('id') id: string,
    @Body(new Validate(redeemSchema)) input: InputOf<typeof redeemSchema>,
  ) {
    return this.rewards.redeem(user.id, id, input.idempotencyKey);
  }
  @Get('redemptions') async history(
    @CurrentUser() user: Identity,
    @Query(new Validate(paginationSchema)) query: InputOf<typeof paginationSchema>,
  ) {
    const [items, total] = await Promise.all([
      this.db.rewardRedemption.findMany({
        where: { userId: user.id },
        include: { reward: { select: { title: true, icon: true } } },
        orderBy: { createdAt: 'desc' },
        ...pageArgs(query.page, query.limit),
      }),
      this.db.rewardRedemption.count({ where: { userId: user.id } }),
    ]);
    return pageResult(items, total, query.page, query.limit);
  }
  @Post('redemptions/:id/refund') refund(@CurrentUser() user: Identity, @Param('id') id: string) {
    return this.rewards.refund(user.id, id);
  }
}
