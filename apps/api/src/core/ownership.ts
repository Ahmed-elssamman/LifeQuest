import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
export async function assertReferences(
  tx: Prisma.TransactionClient,
  userId: string,
  refs: {
    goalId?: string | null;
    projectId?: string | null;
    habitId?: string | null;
    parentId?: string | null;
    areaId?: string;
  },
) {
  const checks = await Promise.all([
    refs.goalId
      ? tx.goal.findFirst({ where: { id: refs.goalId, userId }, select: { id: true } })
      : true,
    refs.projectId
      ? tx.project.findFirst({
          where: { id: refs.projectId, userId },
          select: { id: true, goalId: true },
        })
      : true,
    refs.habitId
      ? tx.habit.findFirst({ where: { id: refs.habitId, userId }, select: { id: true } })
      : true,
    refs.parentId
      ? tx.task.findFirst({ where: { id: refs.parentId, userId }, select: { id: true } })
      : true,
    refs.areaId
      ? tx.lifeArea.findFirst({ where: { id: refs.areaId, active: true }, select: { id: true } })
      : true,
  ]);
  if (checks.some((item) => !item))
    throw new NotFoundException('A linked item could not be found.');
  const project = checks[1];
  if (
    refs.goalId &&
    typeof project === 'object' &&
    project &&
    'goalId' in project &&
    project.goalId &&
    project.goalId !== refs.goalId
  )
    throw new BadRequestException('The project belongs to a different goal.');
}
export function dates<T extends Record<string, unknown>>(input: T, keys: string[]): T {
  const output = { ...input };
  for (const key of keys)
    if (typeof output[key] === 'string')
      (output as Record<string, unknown>)[key] = new Date(`${output[key]}T00:00:00.000Z`);
  return output;
}
export function assertDateOrder(
  start: string | Date | null | undefined,
  end: string | Date | null | undefined,
) {
  if (start && end && new Date(start) > new Date(end))
    throw new BadRequestException('The end date must be on or after the start date.');
}
export const pageArgs = (page: number, limit: number) => ({
  skip: (page - 1) * limit,
  take: limit,
});
export const pageResult = <T>(items: T[], total: number, page: number, limit: number) => ({
  items,
  total,
  page,
  limit,
  pages: Math.ceil(total / limit),
});
