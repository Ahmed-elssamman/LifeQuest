import { Prisma } from '@prisma/client';
type NotificationInput = Prisma.NotificationCreateManyInput & {
  arabic?: { title: string; body: string };
};

export async function notify(
  tx: Prisma.TransactionClient,
  input: { data: NotificationInput | NotificationInput[] },
) {
  const data = Array.isArray(input.data) ? input.data : [input.data];
  const profiles = await tx.profile.findMany({
    where: {
      userId: { in: data.map((item) => item.userId) },
      notificationsEnabled: true,
      user: { status: 'ACTIVE' },
    },
    select: { userId: true, language: true },
  });
  const enabled = new Map(profiles.map((profile) => [profile.userId, profile.language]));
  return tx.notification.createMany({
    data: data
      .filter((item) => enabled.has(item.userId))
      .map(({ arabic, ...item }) => ({
        ...item,
        ...(enabled.get(item.userId) === 'ar' && arabic ? arabic : {}),
      })),
  });
}
