import { Controller, Post, UseGuards } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CronGuard } from '../../common/guards/cron.guard';
import { RemindersService, ReminderRunSummary } from './reminders.service';

@Controller('internal')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Public()
  @UseGuards(CronGuard)
  @Post('run-reminders')
  run(): Promise<ReminderRunSummary> {
    return this.remindersService.runDaily();
  }
}
