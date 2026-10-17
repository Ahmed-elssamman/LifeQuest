import { describe, expect, it } from 'vitest';
import { rankRewards } from '../../apps/api/src/gamification/reward-scoring';

describe('reward suggestions', () => {
  const rewards = [
    { id: 'coffee', title: 'Coffee', category: 'drinks', cost: 50, contexts: ['morning'] },
    { id: 'book', title: 'Book', category: 'books', cost: 200, contexts: [] },
    { id: 'walk', title: 'Walk', category: 'outings', cost: 50, contexts: [] },
  ];

  it('uses explicit favorites and satisfied history while leaving room for discovery', () => {
    const history = [
      {
        rewardId: 'coffee',
        createdAt: new Date('2020-01-01'),
        rating: 5,
        reward: { category: 'drinks' },
      },
    ];
    const ranked = rankRewards(rewards, history, new Set(['book']), 100, 'morning');
    expect(ranked[0]?.reward.id).toBe('coffee');
    expect(ranked[0]?.reason).toBe('enjoyed_category');
    expect(ranked.find((item) => item.reward.id === 'book')?.reason).toBe('favorite');
    expect(ranked.find((item) => item.reward.id === 'walk')?.reason).toBe('discover');
  });

  it('does not mistake a low rating for satisfaction', () => {
    const ranked = rankRewards(
      rewards,
      [
        {
          rewardId: 'coffee',
          createdAt: new Date('2020-01-01'),
          rating: 1,
          reward: { category: 'drinks' },
        },
      ],
      new Set(),
      100,
      'evening',
    );
    expect(ranked.find((item) => item.reward.id === 'coffee')?.reason).toBe('another_option');
    expect(ranked[0]?.reward.id).not.toBe('coffee');
  });
});
