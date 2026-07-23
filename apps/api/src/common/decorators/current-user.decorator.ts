import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AppUser } from '@weighbridge/shared';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AppUser => ctx.switchToHttp().getRequest().user,
);
