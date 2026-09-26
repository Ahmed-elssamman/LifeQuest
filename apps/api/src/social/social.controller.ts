import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import {
  challengeAcceptSchema,
  challengeSchema,
  emailSchema,
  InputOf,
  paginationSchema,
} from '@lifequest/contracts';
import { CurrentUser, Identity, Validate } from '../common/http';
import { FriendsService } from './friends.service';
import { ChallengesService } from './challenges.service';
@ApiTags('Friends and challenges')
@Controller()
export class SocialController {
  constructor(
    @Inject(FriendsService) private readonly friends: FriendsService,
    @Inject(ChallengesService) private readonly challenges: ChallengesService,
  ) {}
  @Get('friends') listFriends(
    @CurrentUser() user: Identity,
    @Query(new Validate(paginationSchema)) query: InputOf<typeof paginationSchema>,
  ) {
    return this.friends.list(user.id, query);
  }
  @Post('friends') requestFriend(
    @CurrentUser() user: Identity,
    @Body(new Validate(emailSchema)) input: InputOf<typeof emailSchema>,
  ) {
    return this.friends.request(user.id, input.email);
  }
  @Post('friends/:id/actions') friendAction(
    @CurrentUser() user: Identity,
    @Param('id') id: string,
    @Body(
      new Validate(
        z.object({ action: z.enum(['accept', 'reject', 'cancel', 'remove', 'block']) }).strict(),
      ),
    )
    input: { action: string },
  ) {
    return this.friends.action(user.id, id, input.action);
  }
  @Get('challenges') listChallenges(
    @CurrentUser() user: Identity,
    @Query(new Validate(paginationSchema)) query: InputOf<typeof paginationSchema>,
  ) {
    return this.challenges.list(user.id, query);
  }
  @Post('challenges') createChallenge(
    @CurrentUser() user: Identity,
    @Body(new Validate(challengeSchema)) input: InputOf<typeof challengeSchema>,
  ) {
    return this.challenges.create(user.id, input);
  }
  @Post('challenges/:id/accept') acceptChallenge(
    @CurrentUser() user: Identity,
    @Param('id') id: string,
    @Body(new Validate(challengeAcceptSchema)) input: InputOf<typeof challengeAcceptSchema>,
  ) {
    return this.challenges.accept(user.id, id, input);
  }
  @Post('challenges/:id/actions') challengeAction(
    @CurrentUser() user: Identity,
    @Param('id') id: string,
    @Body(new Validate(z.object({ action: z.enum(['cancel', 'decline', 'refresh']) }).strict()))
    input: { action: 'cancel' | 'decline' | 'refresh' },
  ) {
    return this.challenges.action(user.id, id, input.action);
  }
}
