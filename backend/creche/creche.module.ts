import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrecheController } from './creche.controller';
import { CrecheService } from './creche.service';
import { Creche } from './creche.entity';
import { Child } from '../child/child.entity';
import { User } from '../user/user.entity';
import { EmailNotificationService } from '../src/services/email-notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([Creche, Child, User])],
  controllers: [CrecheController],
  providers: [CrecheService, EmailNotificationService],
  exports: [CrecheService],
})
export class CrecheModule {}