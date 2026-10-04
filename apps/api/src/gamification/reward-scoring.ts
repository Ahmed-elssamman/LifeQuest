type Candidate = {
  id: string;
  title: string;
  category: string;
  cost: number;
  contexts: string[];
};
type History = {
  rewardId: string;
  createdAt: Date;
  rating: number | null;
  reward: { category: string };
};

export function rankRewards<T extends Candidate>(
  rewards: T[],
  history: History[],
  favoriteIds: Set<string>,
  balance: number,
  context: string,
) {
  const categoryUse = new Map<string, { count: number; rated: number; ratingTotal: number }>();
  const lastUse = new Map<string, Date>();
  for (const item of history) {
    const category = item.reward.category;
    const previous = categoryUse.get(category) ?? { count: 0, rated: 0, ratingTotal: 0 };
    categoryUse.set(category, {
      count: previous.count + 1,
      rated: previous.rated + (item.rating === null ? 0 : 1),
      ratingTotal: previous.ratingTotal + (item.rating ?? 0),
    });
    if (!lastUse.has(item.rewardId)) lastUse.set(item.rewardId, item.createdAt);
  }
  return rewards
    .map((reward) => {
      const affinity = categoryUse.get(reward.category);
      const favorite = favoriteIds.has(reward.id);
      const satisfied =
        affinity && affinity.rated > 0 ? affinity.ratingTotal / affinity.rated >= 4 : false;
      const disliked =
        affinity && affinity.rated > 0 ? affinity.ratingTotal / affinity.rated < 3 : false;
      const recent = lastUse.get(reward.id);
      const cooling = recent && Date.now() - recent.getTime() < 7 * 86400000;
      const score =
        (favorite ? 6 : 0) +
        Math.min(affinity?.count ?? 0, 4) * 2 +
        (satisfied ? 3 : 0) +
        (reward.contexts.includes(context) ? 2 : 0) +
        (reward.cost <= balance ? 2 : 0) +
        (!affinity ? 1 : 0) -
        (disliked ? 5 : 0) -
        (cooling ? 3 : 0);
      const reason = favorite
        ? 'favorite'
        : satisfied
          ? 'enjoyed_category'
          : reward.contexts.includes(context)
            ? 'time_match'
            : !affinity
              ? 'discover'
              : disliked
                ? 'another_option'
                : 'chosen_category';
      return { reward, score, reason };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.reward.cost - b.reward.cost ||
        a.reward.id.localeCompare(b.reward.id),
    )
    .slice(0, 4);
}
