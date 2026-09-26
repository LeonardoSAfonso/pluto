import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { OrmModule } from 'src/orm/orm.module';

@Module({
  imports: [OrmModule],
  controllers: [HealthController],
})
export class HealthModule {}
