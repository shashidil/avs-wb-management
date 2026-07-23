import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CronGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const provided = request.headers['x-cron-secret'];
    const expected = this.config.getOrThrow<string>('CRON_SECRET');

    if (!provided || provided !== expected) {
      throw new UnauthorizedException('Invalid cron secret');
    }

    return true;
  }
}
