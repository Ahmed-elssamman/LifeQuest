import { Prisma } from '@prisma/client';

/** Erase personal content while retaining pseudonymous financial and scoring evidence. */
export async function erasePersonalContent(tx: Prisma.TransactionClient, userId: string) {
  await tx.profile.update({
    where: { userId },
    data: {
      displayName: 'Deleted explorer',
      bio: '',
      avatarUrl: null,
      timezone: 'UTC',
      language: 'en',
      preferredRoutine: '',
      profileVisibility: 'PRIVATE',
      notificationsEnabled: false,
      shareChallengeScore: false,
      shareStreak: false,
    },
  });
  await tx.dailyCheckIn.deleteMany({ where: { userId } });
  await tx.monthJourney.deleteMany({ where: { userId } });
  await tx.userProgress.deleteMany({ where: { userId } });
  await tx.userLifeArea.deleteMany({ where: { userId } });
  await tx.habitExperiment.deleteMany({ where: { habit: { userId } } });
  await tx.habitLog.updateMany({ where: { userId }, data: { note: '' } });
  await tx.habit.updateMany({
    where: { userId },
    data: {
      name: 'Deleted habit',
      description: '',
      minimumAction: '',
      whyItMatters: '',
      failureReason: '',
      notes: '',
      nextExperiment: '',
      preferredTime: '',
      commitment: '',
      status: 'ARCHIVED',
    },
  });
  await tx.goal.updateMany({
    where: { userId },
    data: { title: 'Deleted goal', description: '', notes: '', status: 'ARCHIVED' },
  });
  await tx.project.updateMany({
    where: { userId },
    data: { title: 'Deleted project', description: '', notes: '', status: 'ARCHIVED' },
  });
  await tx.task.updateMany({
    where: { userId },
    data: { title: 'Deleted task', description: '', labels: [], status: 'ARCHIVED' },
  });
  await tx.milestone.deleteMany({ where: { OR: [{ goal: { userId } }, { project: { userId } }] } });
  await tx.questProgress.updateMany({
    where: { quest: { userId } },
    data: { title: 'Deleted step' },
  });
  await tx.weeklyQuest.updateMany({
    where: { userId },
    data: {
      title: 'Deleted quest',
      description: '',
      realReward: '',
      encouragement: '',
      reflection: '',
    },
  });
  await tx.rewardFavorite.deleteMany({ where: { userId } });
  await tx.rewardSavingsTarget.deleteMany({ where: { userId } });
  await tx.rewardRedemption.updateMany({
    where: { userId },
    data: { rating: null, ratedAt: null },
  });
  await tx.reward.updateMany({
    where: { userId },
    data: {
      title: 'Deleted reward',
      description: '',
      notes: '',
      category: 'personal',
      contexts: [],
      cooldownDays: 0,
      active: false,
    },
  });
  await tx.challenge.updateMany({
    where: { ownerId: userId },
    data: { title: 'Deleted challenge', description: '' },
  });
  await tx.challengeParticipant.updateMany({
    where: { userId },
    data: { shareScore: false, shareProgress: false, shareStreak: false },
  });
  await tx.friendship.deleteMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } });
  await tx.notification.deleteMany({ where: { userId } });
  await tx.analyticsEvent.deleteMany({ where: { userId } });
  const attachments = await tx.feedbackAttachment.findMany({
    where: { feedback: { userId } },
    select: { storageKey: true },
  });
  await tx.attachmentDeletion.createMany({ data: attachments, skipDuplicates: true });
  await tx.feedbackAttachment.deleteMany({ where: { feedback: { userId } } });
  await tx.feedbackReply.deleteMany({ where: { feedback: { userId } } });
  await tx.feedback.updateMany({
    where: { userId },
    data: {
      userId: null,
      anonymous: true,
      title: 'Deleted feedback',
      description: '',
      status: 'CLOSED',
    },
  });
  return attachments.map((item) => item.storageKey);
}
