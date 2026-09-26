import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import { addDays, dateOnly, localDate } from '../libs/domain/src/habits';
const db = new PrismaClient({ log: [] });
export async function seed(database = db) {
  const today = dateOnly(localDate(new Date(), 'Africa/Cairo'));
  const areas = [
    {
      id: 'area-faith',
      slug: 'faith',
      name: 'Faith',
      nameAr: 'الدين',
      color: 'violet',
      icon: 'sparkles',
      sortOrder: 0,
    },
    {
      id: 'area-body',
      slug: 'body',
      name: 'Body',
      nameAr: 'الجسد',
      color: 'coral',
      icon: 'heart',
      sortOrder: 1,
    },
    {
      id: 'area-growth',
      slug: 'growth',
      name: 'Growth',
      nameAr: 'التطوير',
      color: 'mint',
      icon: 'sprout',
      sortOrder: 2,
    },
    {
      id: 'area-mind',
      slug: 'mind',
      name: 'Mind',
      nameAr: 'النفس',
      color: 'sky',
      icon: 'sun',
      sortOrder: 3,
    },
  ];
  for (const area of areas)
    await database.lifeArea.upsert({ where: { id: area.id }, create: area, update: {} });
  await database.questTemplate.upsert({
    where: { id: 'template-small-wins' },
    update: {},
    create: {
      id: 'template-small-wins',
      title: 'A week of small wins',
      titleAr: 'أسبوع من الإنجازات الصغيرة',
      description: 'Choose one direction, make a little progress, and notice what helped.',
      areaId: 'area-growth',
      difficulty: 'EASY',
      items: {
        create: [
          { title: 'Choose one meaningful priority', sortOrder: 0 },
          { title: 'Spend twenty minutes on the next step', sortOrder: 1 },
          { title: 'Write down one thing that helped', sortOrder: 2 },
        ],
      },
    },
  });
  const levels = [
    { number: 1, title: 'New beginnings', titleAr: 'بداية', minXp: 0 },
    { number: 2, title: 'Finding rhythm', titleAr: 'مستمر', minXp: 250 },
    { number: 3, title: 'On the rise', titleAr: 'صاعد', minXp: 700 },
    { number: 4, title: 'In balance', titleAr: 'متوازن', minXp: 1500 },
    { number: 5, title: 'Pathfinder', titleAr: 'رائد', minXp: 3000 },
    { number: 6, title: 'Living with purpose', titleAr: 'صاحب أثر', minXp: 6000 },
  ];
  for (const level of levels)
    await database.level.upsert({ where: { number: level.number }, create: level, update: {} });
  const achievements = [
    {
      id: 'achievement-streak',
      slug: 'seven-steady-days',
      title: 'Seven steady days',
      titleAr: 'سبعة أيام ثابتة',
      description: 'Show up for a daily habit seven days in a row. Minimum actions count.',
      icon: 'flame',
      condition: 'STREAK_DAYS',
      threshold: 7,
      xpReward: 75,
      hidden: false,
    },
    {
      id: 'achievement-first',
      slug: 'first-step',
      title: 'The first step',
      titleAr: 'الخطوة الأولى',
      description: 'Complete your first habit. This is where change begins.',
      icon: 'footprints',
      condition: 'HABIT_COUNT',
      threshold: 1,
      xpReward: 25,
    },
    {
      id: 'achievement-rhythm',
      slug: 'finding-rhythm',
      title: 'Finding your rhythm',
      titleAr: 'إيقاعك الخاص',
      description: 'Show up for 25 habit actions.',
      icon: 'flame',
      condition: 'HABIT_COUNT',
      threshold: 25,
      xpReward: 75,
    },
    {
      id: 'achievement-steady',
      slug: 'steady-growth',
      title: 'Quietly unstoppable',
      titleAr: 'تقدم ثابت',
      description: 'Take 100 small steps toward a better life.',
      icon: 'mountain',
      condition: 'HABIT_COUNT',
      threshold: 100,
      xpReward: 150,
    },
    {
      id: 'achievement-reflect',
      slug: 'reflect',
      title: 'A moment for yourself',
      titleAr: 'لحظة لنفسك',
      description: 'Complete seven daily reflections.',
      icon: 'sun',
      condition: 'CHECK_IN_COUNT',
      threshold: 7,
      xpReward: 50,
    },
    {
      id: 'achievement-quest',
      slug: 'quest-finish',
      title: 'Mission accomplished',
      titleAr: 'المهمة تمت',
      description: 'Finish your first weekly quest.',
      icon: 'flag',
      condition: 'QUEST_COUNT',
      threshold: 1,
      xpReward: 50,
    },
    {
      id: 'achievement-together',
      slug: 'better-together',
      title: 'Better together',
      titleAr: 'معاً أفضل',
      description: 'Complete a challenge with a friend.',
      icon: 'users',
      condition: 'CHALLENGE_COUNT',
      threshold: 1,
      xpReward: 75,
    },
  ];
  for (const achievement of achievements)
    await database.achievement.upsert({
      where: { id: achievement.id },
      create: achievement,
      update: {},
    });
  const rewards = [
    {
      id: 'reward-coffee',
      title: 'A slow coffee morning',
      description: 'Your favorite café. A good book. No rush.',
      cost: 150,
      icon: 'coffee',
      category: 'Little joys',
    },
    {
      id: 'reward-movie',
      title: 'Movie night, guilt free',
      description: 'Pick something you love and settle in.',
      cost: 300,
      icon: 'clapperboard',
      category: 'Recharge',
    },
    {
      id: 'reward-book',
      title: 'That book on your list',
      description: 'A new world, waiting on your bookshelf.',
      cost: 500,
      icon: 'book-open',
      category: 'Growth',
    },
    {
      id: 'reward-day',
      title: 'A day just for you',
      description: 'Clear your calendar. Follow your curiosity.',
      cost: 1000,
      icon: 'sun',
      category: 'Experiences',
    },
  ];
  for (const reward of rewards)
    await database.reward.upsert({ where: { id: reward.id }, create: reward, update: {} });
  const season = await database.season.upsert({
    where: { year_title: { year: 2026, title: 'Your season of growth' } },
    create: {
      title: 'Your season of growth',
      year: 2026,
      startDate: dateOnly('2026-08-01'),
      endDate: dateOnly('2026-12-31'),
    },
    update: {},
  });
  const phases = [
    {
      month: 8,
      title: 'Launch',
      titleAr: 'الانطلاق',
      description: 'Make room for a new beginning.',
    },
    {
      month: 9,
      title: 'Consistency',
      titleAr: 'الاستمرارية',
      description: 'Find a rhythm that feels like you.',
    },
    {
      month: 10,
      title: 'Development',
      titleAr: 'التطوير',
      description: 'Go a little deeper. Learn something new.',
    },
    {
      month: 11,
      title: 'Challenge',
      titleAr: 'التحدي',
      description: 'Discover what you can do together.',
    },
    {
      month: 12,
      title: 'Harvest',
      titleAr: 'الحصاد',
      description: 'Look back, celebrate, and carry the learning forward.',
    },
  ];
  for (const phase of phases)
    await database.seasonPhase.upsert({
      where: { seasonId_year_month: { seasonId: season.id, year: 2026, month: phase.month } },
      create: { ...phase, seasonId: season.id, year: 2026 },
      update: {},
    });
  await database.helpArticle.upsert({
    where: { slug: 'never-miss-twice' },
    create: {
      slug: 'never-miss-twice',
      title: 'What if I miss a day?',
      titleAr: 'ماذا لو فاتني يوم؟',
      body: 'A missed day is information. Notice what got in the way, choose a smaller action, and begin again. You can use Habit Lab to try a different time, a lighter target, or a pause.',
      bodyAr:
        'اليوم الفائت معلومة تساعدك على التعلم. لاحظ ما أعاقك، واختر خطوة أصغر، ثم ابدأ من جديد. جرّب وقتاً مختلفاً أو هدفاً أخف في مختبر العادات.',
    },
    update: {},
  });
  await database.helpArticle.upsert({
    where: { slug: 'xp-and-scores' },
    create: {
      slug: 'xp-and-scores',
      title: 'Are XP and challenge scores the same?',
      titleAr: 'هل نقاط الخبرة هي نقاط التحدي؟',
      body: 'XP celebrates personal progress and can be spent on rewards. Challenge scores follow the rules you agreed to before the challenge began. Spending XP never changes your challenge result or level.',
      bodyAr:
        'نقاط الخبرة تحتفي بتقدمك ويمكنك استخدامها للمكافآت. نقاط التحدي تتبع القواعد المتفق عليها مسبقاً. إنفاق نقاط الخبرة لا يغير نتيجة التحدي أو مستواك.',
    },
    update: {},
  });
  const makeUser = async (
    email: string,
    password: string,
    displayName: string,
    role: Role = 'USER',
  ) =>
    database.user.upsert({
      where: { email },
      create: {
        email,
        passwordHash: await argon2.hash(password),
        role,
        emailVerifiedAt: new Date(),
        profile: {
          create: { displayName, onboardingCompletedAt: new Date(), timezone: 'Africa/Cairo' },
        },
      },
      update: {},
    });
  if (process.env['DEMO_ADMIN_EMAIL'] && process.env['DEMO_ADMIN_PASSWORD'])
    await makeUser(
      process.env['DEMO_ADMIN_EMAIL'],
      process.env['DEMO_ADMIN_PASSWORD'],
      'LifeQuest Admin',
      'SUPER_ADMIN',
    );
  if (!process.env['DEMO_EMAIL'] || !process.env['DEMO_PASSWORD']) return;
  const user = await makeUser(
    process.env['DEMO_EMAIL'],
    process.env['DEMO_PASSWORD'],
    'Alex Morgan',
  );
  if (await database.goal.count({ where: { userId: user.id } })) return;
  const friend = await makeUser(
    'maya.demo@lifequest.local',
    randomBytes(24).toString('hex'),
    'Maya Hassan',
  );
  for (const area of areas)
    await database.userLifeArea.create({ data: { userId: user.id, areaId: area.id } });
  await database.userProgress.create({ data: { userId: user.id, seasonId: season.id } });
  const growthGoal = await database.goal.create({
    data: {
      userId: user.id,
      areaId: 'area-growth',
      title: 'Build a career I am proud of',
      description: 'Develop the skills and confidence to take the next meaningful step.',
      strategy: 'PROJECT',
      priority: 'HIGH',
      targetDate: addDays(today, 65),
    },
  });
  await database.goal.create({
    data: {
      userId: user.id,
      areaId: 'area-body',
      title: 'Feel stronger, every day',
      description: 'More energy for the things and people I love.',
      strategy: 'MANUAL',
      manualProgress: 64,
      targetDate: addDays(today, 35),
    },
  });
  const project = await database.project.create({
    data: {
      userId: user.id,
      goalId: growthGoal.id,
      title: 'Create my portfolio',
      description: 'A thoughtful showcase of work that matters.',
      status: 'ACTIVE',
      deadline: addDays(today, 21),
    },
  });
  for (const [i, title] of [
    'Sketch the portfolio homepage',
    'Write the first case study',
    'Choose three projects to feature',
    'Review inspiration and references',
  ].entries())
    await database.task.create({
      data: {
        userId: user.id,
        projectId: project.id,
        goalId: growthGoal.id,
        title,
        priority: i === 0 ? 'HIGH' : 'MEDIUM',
        dueDate: today,
        estimatedMinutes: [30, 45, 15, 20][i],
        labels: ['portfolio'],
        status: i >= 2 ? 'COMPLETED' : 'ACTIVE',
        completedAt: i >= 2 ? addDays(today, -1) : null,
      },
    });
  const habitInputs = [
    {
      name: 'A moment of gratitude',
      areaId: 'area-faith',
      preferredTime: 'morning',
      target: 1,
      unit: 'moment',
      minimumAction: 'Name one thing I am grateful for',
      whyItMatters: 'Begin the day with perspective.',
    },
    {
      name: 'Move my body',
      areaId: 'area-body',
      preferredTime: 'morning',
      target: 30,
      unit: 'minutes',
      minimumAction: 'A five-minute walk',
      whyItMatters: 'Energy, strength, and a clearer head.',
    },
    {
      name: 'Read something meaningful',
      areaId: 'area-growth',
      preferredTime: 'afternoon',
      target: 15,
      unit: 'pages',
      minimumAction: 'Read one page',
      whyItMatters: 'Stay curious and keep growing.',
    },
    {
      name: 'Unplug before bed',
      areaId: 'area-mind',
      preferredTime: 'evening',
      target: 20,
      unit: 'minutes',
      minimumAction: 'Put my phone away for two minutes',
      whyItMatters: 'Give my mind a softer landing.',
    },
  ];
  const habits = [];
  for (const [index, input] of habitInputs.entries()) {
    const habit = await database.habit.create({
      data: {
        ...input,
        userId: user.id,
        startDate: addDays(today, -28),
        scheduleDays: [],
        difficulty: index === 1 ? 'MEDIUM' : 'EASY',
        xpReward: index === 1 ? 30 : 20,
        ...(index === 3
          ? {
              failureReason: 'My phone stays beside the bed',
              nextExperiment: 'Charge it across the room',
            }
          : {}),
      },
    });
    habits.push(habit);
    for (let day = 1; day <= 21; day++) {
      if ((day + index) % (index === 3 ? 3 : 7) === 0) continue;
      const date = addDays(today, -day);
      await database.habitLog.create({
        data: {
          habitId: habit.id,
          userId: user.id,
          date,
          value: input.target,
          targetSnapshot: input.target,
          createdAt: date,
        },
      });
      await database.xPTransaction.create({
        data: {
          userId: user.id,
          type: 'HABIT',
          source: habit.id,
          amount: habit.xpReward,
          idempotencyKey: `habit:${habit.id}:${date.toISOString().slice(0, 10)}`,
          createdAt: date,
        },
      });
    }
  }
  for (let day = 1; day <= 12; day++)
    await database.dailyCheckIn.create({
      data: {
        userId: user.id,
        date: addDays(today, -day),
        mood: (day % 4) + 2 > 5 ? 4 : (day % 4) + 2,
        energy: 3 + (day % 3),
        majorWin:
          day % 2 ? 'Made space for a little progress.' : 'Took a walk and came back clearer.',
        recoveryIntention: day % 3 === 0 ? 'Start with the smallest version tomorrow.' : '',
      },
    });
  await database.weeklyQuest.create({
    data: {
      userId: user.id,
      areaId: 'area-growth',
      goalId: growthGoal.id,
      title: 'Make room for deep work',
      description: 'Protect a little space for the work that moves you forward.',
      deadline: addDays(today, 5),
      xpReward: 100,
      encouragement: 'One focused session is a win.',
      items: {
        create: [
          { title: 'Plan three focus sessions', completedAt: addDays(today, -2), sortOrder: 0 },
          { title: 'Finish one portfolio section', completedAt: addDays(today, -1), sortOrder: 1 },
          { title: 'Reflect on what helped me focus', sortOrder: 2 },
        ],
      },
    },
  });
  await database.friendship.create({
    data: {
      senderId: user.id,
      receiverId: friend.id,
      pairKey: [user.id, friend.id].sort().join(':'),
      status: 'ACCEPTED',
    },
  });
  const challenge = await database.challenge.create({
    data: {
      ownerId: user.id,
      title: 'A little better, together',
      description: 'Seven days of showing up. Small steps count.',
      mode: 'CONSISTENCY',
      status: 'SCHEDULED',
      startDate: addDays(today, -3),
      endDate: addDays(today, 4),
      rules: { create: { target: 7, frozenAt: addDays(today, -3) } },
      metric: { create: { name: 'Daily consistency', unit: '%' } },
      participants: {
        create: [
          { userId: user.id, status: 'ACCEPTED', acceptedAt: addDays(today, -4) },
          { userId: friend.id, status: 'ACCEPTED', acceptedAt: addDays(today, -4) },
        ],
      },
    },
  });
  const completed = await database.challenge.create({
    data: {
      ownerId: user.id,
      title: 'Seven days of fresh air',
      description: 'A shared reminder to get outside.',
      mode: 'STREAK',
      status: 'SCHEDULED',
      startDate: addDays(today, -14),
      endDate: addDays(today, -7),
      completedAt: addDays(today, -7),
      rules: { create: { target: 7, frozenAt: addDays(today, -14) } },
      metric: { create: { name: 'Daily streak', unit: 'days' } },
      participants: {
        create: [
          { userId: user.id, status: 'ACCEPTED' },
          { userId: friend.id, status: 'ACCEPTED' },
        ],
      },
    },
    include: { participants: true },
  });
  // Seed the same immutable eligibility records as the activation workflow.
  for (const item of [challenge, completed]) {
    const participants = await database.challengeParticipant.findMany({
      where: { challengeId: item.id },
    });
    for (const participant of participants) {
      const habits = await database.habit.findMany({
        where: { userId: participant.userId, status: 'ACTIVE' },
      });
      await database.challengeHabitSnapshot.createMany({
        data: habits.map((habit) => ({
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
      await database.challengeParticipant.update({
        where: { id: participant.id },
        data: { timezoneSnapshot: 'Africa/Cairo' },
      });
    }
    await database.challenge.update({
      where: { id: item.id },
      data: {
        status: item.id === completed.id ? 'COMPLETED' : 'ACTIVE',
        activatedAt: item.startDate,
      },
    });
  }
  for (const participant of completed.participants)
    await database.challengeScore.create({
      data: {
        challengeId: completed.id,
        participantId: participant.id,
        score: participant.userId === user.id ? 6 : 5,
        progress: participant.userId === user.id ? 86 : 71,
        streak: participant.userId === user.id ? 6 : 5,
        evidenceHash: 'deterministic-demo-fixture',
        algorithmVersion: 1,
        final: true,
      },
    });
  for (const achievementId of ['achievement-first', 'achievement-rhythm', 'achievement-reflect'])
    await database.userAchievement.create({ data: { userId: user.id, achievementId } });
  await database.notification.create({
    data: {
      userId: user.id,
      type: 'CHALLENGE',
      title: 'Your next chapter is shared',
      body: 'Maya joined your consistency challenge.',
      href: '/challenges',
    },
  });
  await database.feedback.create({
    data: {
      userId: user.id,
      title: 'A softer reminder for evening habits',
      description:
        'I would love a gentle reminder that suggests my minimum action when the evening is busy.',
      category: 'SUGGESTION',
      status: 'REVIEWING',
      replies: {
        create: {
          body: 'Thank you for this thoughtful suggestion. We are exploring calmer reminders.',
          authorRole: 'SUPPORT',
        },
      },
    },
  });
  await database.analyticsEvent.createMany({
    data: [
      { userId: user.id, name: 'signup' },
      { userId: user.id, name: 'onboarding_completed' },
      { userId: user.id, name: 'challenge_created', metadata: { challengeId: challenge.id } },
    ],
  });
  await database.monthJourney.create({
    data: {
      userId: user.id,
      year: today.getUTCFullYear(),
      month: today.getUTCMonth() + 1,
      biggestWin: 'I am learning to trust small steps.',
      adjustment: 'Make the evening routine a little easier.',
    },
  });
}
if (process.env['VITEST'] !== 'true')
  seed()
    .then(() =>
      console.log(
        'LifeQuest reference and demo data are ready. Account credentials remain in .env.',
      ),
    )
    .catch(() => {
      console.error('Seed failed. Check database connectivity and migration status.');
      process.exitCode = 1;
    })
    .finally(() => db.$disconnect());
