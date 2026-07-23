import { Module } from '@nestjs/common';
import { AgreementsModule } from '../agreements/agreements.module';
import { LicencesModule } from '../licences/licences.module';
import { PushModule } from '../push/push.module';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';

@Module({
  imports: [AgreementsModule, LicencesModule, PushModule],
  controllers: [RemindersController],
  providers: [RemindersService],
})
export class RemindersModule {}
