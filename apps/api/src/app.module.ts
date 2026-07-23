import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { StorageModule } from './storage/storage.module';
import { ClientsModule } from './modules/clients/clients.module';
import { AgreementsModule } from './modules/agreements/agreements.module';
import { LicencesModule } from './modules/licences/licences.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PushModule } from './modules/push/push.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    StorageModule,
    ClientsModule,
    AgreementsModule,
    LicencesModule,
    RemindersModule,
    AuthModule,
    UsersModule,
    PushModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
