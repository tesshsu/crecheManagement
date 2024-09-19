import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildController } from './child.controller';
import { ChildService } from './child.service';
import { Child } from './child.entity';
import { User } from '../user/user.entity';
import { Creche } from '../creche/creche.entity';
import { ChildrenExportController } from './children-export.controller';
import { ChildrenExportService } from './children-export.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Child, User, Creche]),
  ],
  controllers: [ChildController, ChildrenExportController],
  providers: [ChildService, ChildrenExportService],
  exports: [ChildService],
})
export class ChildModule {}
