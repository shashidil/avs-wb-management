import { Body, Controller, Delete, Post } from '@nestjs/common';
import type { AppUser } from '@weighbridge/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SubscribeDto } from './dto/subscribe.dto';
import { UnsubscribeDto } from './dto/unsubscribe.dto';
import { PushService } from './push.service';

@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post('subscribe')
  async subscribe(@CurrentUser() user: AppUser, @Body() dto: SubscribeDto): Promise<{ ok: true }> {
    await this.pushService.subscribe(user.id, dto);
    return { ok: true };
  }

  @Delete('subscribe')
  async unsubscribe(@Body() dto: UnsubscribeDto): Promise<{ ok: true }> {
    await this.pushService.unsubscribe(dto.endpoint);
    return { ok: true };
  }
}
