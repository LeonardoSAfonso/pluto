import { Module } from '@nestjs/common';
import { OrmModule } from 'src/orm/orm.module';
import UserRepository from './repository';

@Module({
  imports: [OrmModule],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class UsersModule {}
