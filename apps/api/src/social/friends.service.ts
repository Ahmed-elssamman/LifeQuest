import { Prisma } from '@prisma/client';
import { InputOf, paginationSchema } from '@lifequest/contracts';
import { pageArgs, pageResult } from '../core/ownership';
import { notify } from '../common/notifications';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Database } from '../common/database';
const friendProfile = {
  id: true,
  profile: { select: { displayName: true, avatarUrl: true } },
} as const;
@Injectable()
export class FriendsService {
  constructor(@Inject(Database) private readonly db: Database) {}
  async list(userId: string, query: InputOf<typeof paginationSchema>) {
    const where: Prisma.FriendshipWhereInput = {
      AND: [
        { OR: [{ senderId: userId }, { receiverId: userId }] },
        { OR: [{ status: { not: 'BLOCKED' } }, { blockedById: userId }] },
      ],
      ...(query.status === 'ACCEPTED' ? { status: 'ACCEPTED' } : {}),
    };
    const [items, total] = await Promise.all([
      this.db.friendship.findMany({
        where,
        include: { sender: { select: friendProfile }, receiver: { select: friendProfile } },
        orderBy: { createdAt: 'desc' },
        ...pageArgs(query.page, query.limit),
      }),
      this.db.friendship.count({ where }),
    ]);
    return pageResult(
      items
        .filter((item) => item.status !== 'BLOCKED' || item.blockedById === userId)
        .map((item) => ({
          id: item.id,
          status: item.status,
          incoming: item.receiverId === userId,
          friend: item.senderId === userId ? item.receiver : item.sender,
          createdAt: item.createdAt,
        })),
      total,
      query.page,
      query.limit,
    );
  }
  async request(userId: string, email: string) {
    const receiver = await this.db.user.findUnique({
      where: { email },
      select: { id: true, status: true },
    });
    if (!receiver || receiver.status !== 'ACTIVE' || receiver.id === userId)
      throw new BadRequestException('A request could not be sent to this address.');
    const pairKey = [userId, receiver.id].sort().join(':');
    return this.db.atomic(userId, async (tx) => {
      const existing = await tx.friendship.findUnique({ where: { pairKey } });
      if (existing) throw new BadRequestException('A request could not be sent to this address.');
      const friendship = await tx.friendship.create({
        data: { senderId: userId, receiverId: receiver.id, pairKey },
      });
      const sender = await tx.profile.findUnique({
        where: { userId },
        select: { displayName: true },
      });
      await notify(tx, {
        data: {
          userId: receiver.id,
          type: 'FRIEND_REQUEST',
          title: 'A little company on your journey',
          body: `${sender?.displayName ?? 'Someone'} sent you a friend request.`,
          arabic: {
            title: 'رفيق جديد في رحلتك',
            body: `أرسل ${sender?.displayName ?? 'أحد المستخدمين'} إليك طلب صداقة.`,
          },
          href: '/friends',
        },
      });
      return { id: friendship.id, status: friendship.status };
    });
  }
  async action(userId: string, id: string, action: string) {
    return this.db.atomic(userId, async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Friendship" WHERE id = ${id} FOR UPDATE`;
      const friendship = await tx.friendship.findFirst({
        where: { id, OR: [{ senderId: userId }, { receiverId: userId }] },
      });
      if (!friendship) throw new NotFoundException();
      if (action === 'block')
        return tx.friendship.update({
          where: { id },
          data: { status: 'BLOCKED', blockedById: userId },
        });
      if (friendship.status === 'BLOCKED') {
        if (action !== 'remove' || friendship.blockedById !== userId)
          throw new ForbiddenException();
        return tx.friendship.delete({ where: { id } });
      }
      if (action === 'accept' || action === 'reject') {
        if (friendship.receiverId !== userId || friendship.status !== 'PENDING')
          throw new ForbiddenException();
        return tx.friendship.update({
          where: { id },
          data: { status: action === 'accept' ? 'ACCEPTED' : 'REJECTED' },
        });
      }
      if (
        action === 'cancel' &&
        (friendship.senderId !== userId || friendship.status !== 'PENDING')
      )
        throw new ForbiddenException();
      await tx.friendship.delete({ where: { id } });
      return { success: true };
    });
  }
}
