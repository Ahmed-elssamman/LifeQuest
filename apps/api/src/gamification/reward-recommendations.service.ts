import { Inject, Injectable } from '@nestjs/common';
import { Database } from '../common/database';
import { XpService } from './xp.service';

import { rankRewards } from './reward-scoring';

@Injectable()
export class RewardRecommendationsService {
  constructor(
    @Inject(Database) private readonly db: Database,
    @Inject(XpService) private readonly xp: XpService,
  ) {}

  async list(userId: string) {
    const [rewards, history, favorites, totals] = await Promise.all([
      this.db.reward.findMany({
        where: { active: true, OR: [{ userId }, { userId: null }] },
        orderBy: [{ cost: 'asc' }, { id: 'asc' }],
        take: 100,
        select: {
          id: true,
          userId: true,
          title: true,
          titleAr: true,
          category: true,
          categoryAr: true,
          cost: true,
          contexts: true,
        },
      }),
      this.db.rewardRedemption.findMany({
        where: { userId, refundedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          rewardId: true,
          createdAt: true,
          rating: true,
          reward: { select: { category: true } },
        },
      }),
      this.db.rewardFavorite.findMany({ where: { userId }, select: { rewardId: true } }),
      this.xp.totals(this.db, userId),
    ]);
    const hour = new Date().getHours();
    const context = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    return rankRewards(
      rewards,
      history,
      new Set(favorites.map((item) => item.rewardId)),
      totals.balance,
      context,
    );
  }
}
