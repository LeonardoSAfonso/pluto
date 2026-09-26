import { Module } from '@nestjs/common';
import { OrmModule } from 'src/orm/orm.module';
import { DashboardController } from './dashboard.controller';
import DashboardRepository from './repository';
import GetDashboardSummaryService from './services/getSummary';

@Module({
  imports: [OrmModule],
  controllers: [DashboardController],
  providers: [DashboardRepository, GetDashboardSummaryService],
  exports: [GetDashboardSummaryService],
})
export class DashboardModule {}
