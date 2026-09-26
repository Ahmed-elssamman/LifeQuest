import {
  ForbiddenException,
  UnauthorizedException,
  Global,
  Injectable,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient, Role } from '@prisma/client';
@Injectable()
export class Database extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({ log: [] });
  }
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
  async lockActive(tx: Prisma.TransactionClient, userId: string, roles?: readonly Role[]) {
    const rows = await tx.$queryRaw<
      { id: string; role: Role; status: string }[]
    >`SELECT id, role, status FROM "User" WHERE id = ${userId} FOR UPDATE`;
    const user = rows[0];
    if (!user || user.status !== 'ACTIVE')
      throw new UnauthorizedException('Your account is no longer active.');
    if (roles && !roles.includes(user.role))
      throw new ForbiddenException('Your permissions have changed.');
    return user;
  }
  async staffAtomic<T>(
    actorId: string,
    roles: readonly Role[],
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
    relatedUsers: string[] = [],
  ): Promise<T> {
    return this.$transaction(
      async (tx) => {
        for (const id of [...new Set([actorId, ...relatedUsers])].sort())
          await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${id} FOR UPDATE`;
        await this.lockActive(tx, actorId, roles);
        return operation(tx);
      },
      { maxWait: 10000, timeout: 15000 },
    );
  }
  async atomic<T>(
    userId: string,
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(
      async (tx) => {
        await this.lockActive(tx, userId);
        return operation(tx);
      },
      { maxWait: 10000, timeout: 15000 },
    );
  }
}
@Global()
@Module({ providers: [Database], exports: [Database] })
export class DatabaseModule {}
