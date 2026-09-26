import { notify } from '../common/notifications';
import { Inject, Injectable } from '@nestjs/common';
import { Database } from '../common/database';
import { XpService } from '../gamification/xp.service';
import { challengeInclude, ChallengeScoringService } from './challenge-scoring.service';
@Injectable()
export class ChallengeLifecycleService {
  constructor(
    @Inject(Database) private readonly db: Database,
    @Inject(XpService) private readonly xp: XpService,
    @Inject(ChallengeScoringService) private readonly scoring: ChallengeScoringService,
  ) {}
  async advance(id: string) {
    await this.db.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM "Challenge" WHERE id = ${id} FOR UPDATE`;
        let challenge = await tx.challenge.findUnique({ where: { id }, include: challengeInclude });
        if (
          !challenge ||
          ['COMPLETED', 'CANCELLED', 'DRAFT', 'INVITED'].includes(challenge.status) ||
          challenge.startDate > new Date()
        )
          return;
        // Consistent lock order with all XP-bearing workflows and habit edits.
        for (const participant of [...challenge.participants].sort((a, b) =>
          a.userId.localeCompare(b.userId),
        )) {
          await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${participant.userId} FOR UPDATE`;
        }
        if (challenge.status !== 'ACTIVE') {
          for (const participant of challenge.participants) {
            const eligible = await tx.habit.findMany({
              where: {
                userId: participant.userId,
                status: 'ACTIVE',
                ...(participant.habitId ? { id: participant.habitId } : {}),
                ...(challenge.areaId ? { areaId: challenge.areaId } : {}),
              },
            });
            await tx.challengeHabitSnapshot.createMany({
              data: eligible.map((habit) => ({
                participantId: participant.id,
                habitId: habit.id,
                target: habit.target,
                unit: habit.unit,
                xpReward: habit.xpReward,
                frequency: habit.frequency,
                scheduleDays: habit.scheduleDays,
                weeklyTarget: habit.weeklyTarget,
                startDate: habit.startDate,
              })),
            });
            const baselineEnd = challenge.startDate,
              baselineStart = new Date(
                baselineEnd.getTime() - (challenge.rules?.baselineDays ?? 14) * 86_400_000,
              );
            const logs = await tx.habitLog.findMany({
              where: {
                userId: participant.userId,
                habitId: { in: eligible.map((habit) => habit.id) },
                date: { gte: baselineStart, lt: baselineEnd },
              },
              select: { value: true },
            });
            if (
              challenge.mode === 'IMPROVEMENT' &&
              (logs.length < 7 || eligible.length !== 1 || eligible[0]?.frequency !== 'DAILY')
            ) {
              await tx.challenge.update({ where: { id }, data: { status: 'CANCELLED' } });
              await notify(tx, {
                data: challenge.participants.map((p) => ({
                  userId: p.userId,
                  type: 'CHALLENGE',
                  title: 'Build a reliable starting point',
                  body: 'Improvement challenges need at least seven baseline logs. Try a consistency challenge while building your baseline.',
                  arabic: {
                    title: 'ابنِ نقطة بداية موثوقة',
                    body: 'تحتاج تحديات التحسن إلى سبعة سجلات سابقة على الأقل. جرّب تحدي التزام أثناء بناء نقطة بدايتك.',
                  },
                  href: '/challenges',
                })),
              });
              return;
            }
            const baseline = logs.length
              ? logs.reduce((sum, item) => sum + item.value, 0) / logs.length
              : null;
            await tx.challengeParticipant.update({
              where: { id: participant.id },
              data: {
                baseline,
                baselineStart,
                baselineEnd,
                timezoneSnapshot: participant.user.profile?.timezone ?? 'UTC',
              },
            });
          }
          await tx.challengeRule.update({
            where: { challengeId: id },
            data: { frozenAt: new Date() },
          });
          await tx.challenge.update({
            where: { id },
            data: { status: 'ACTIVE', activatedAt: new Date() },
          });
          await notify(tx, {
            data: challenge.participants.map((p) => ({
              userId: p.userId,
              type: 'CHALLENGE_START',
              title: 'Your shared journey starts now',
              body: challenge!.title,
              arabic: { title: 'تبدأ رحلتكم المشتركة الآن', body: challenge!.title },
              href: '/challenges',
            })),
          });
          challenge = await tx.challenge.findUniqueOrThrow({
            where: { id },
            include: challengeInclude,
          });
        }
        const final = challenge.endDate <= new Date();
        await this.scoring.calculate(tx, challenge, final);
        if (final) {
          await tx.challenge.update({
            where: { id },
            data: { status: 'COMPLETED', completedAt: new Date() },
          });
          for (const participant of [...challenge.participants].sort((a, b) =>
            a.userId.localeCompare(b.userId),
          )) {
            await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${participant.userId} FOR UPDATE`;
            const score = await tx.challengeScore.findUniqueOrThrow({
              where: {
                challengeId_participantId: { challengeId: id, participantId: participant.id },
              },
            });
            if (score.progress > 0)
              await this.xp.award(
                tx,
                participant.userId,
                'CHALLENGE',
                id,
                100,
                `challenge:${id}:${participant.userId}`,
              );
            await this.xp.evaluateAchievements(tx, participant.userId);
            await tx.analyticsEvent.create({
              data: { userId: participant.userId, name: 'challenge_completed' },
            });
            await notify(tx, {
              data: {
                userId: participant.userId,
                type: 'CHALLENGE_END',
                title: 'Look how far you have come',
                body: `${challenge.title} is complete. Your results are ready.`,
                arabic: {
                  title: 'انظر كم تقدمت',
                  body: `اكتمل ${challenge.title}. نتائجكم جاهزة.`,
                },
                href: '/challenges',
              },
            });
          }
        }
      },
      { timeout: 30000 },
    );
  }
  async tick() {
    const pending = await this.db.challenge.findMany({
      where: {
        status: { in: ['SCHEDULED', 'ACCEPTED', 'ACTIVE'] },
        startDate: { lte: new Date() },
      },
      select: { id: true },
      orderBy: [{ endDate: 'asc' }, { id: 'asc' }],
      take: 100,
    });
    for (const challenge of pending) await this.advance(challenge.id);
  }
}
