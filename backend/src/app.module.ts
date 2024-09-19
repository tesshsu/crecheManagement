import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'user/user.module';
import { User } from 'user/user.entity';
import { Creche } from 'creche/creche.entity';
import { CrecheModule } from 'creche/creche.module';
import { ChildModule } from 'child/child.module';
import { Child } from 'child/child.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'app_user',
      password: 'app_pass',
      database: 'app_db',
      entities: [User, Creche, Child],
      synchronize: false,
    }),
    UserModule,
    CrecheModule,
    ChildModule,
  ],
})
export class AppModule {}