import { Module } from '@nestjs/common';
import { OrmModule } from 'src/orm/orm.module';
import { RequestsController } from './requests.controller';
import RequestsRepository from './repository';
import CreateRequestService from './services/create';
import FindRequestsService from './services/find';
import FindOneRequestService from './services/findOne';
import DecideRequestService from './services/decision';
import MarkPaidRequestService from './services/markPaid';

@Module({
  imports: [OrmModule],
  controllers: [RequestsController],
  providers: [
    RequestsRepository,
    CreateRequestService,
    FindRequestsService,
    FindOneRequestService,
    DecideRequestService,
    MarkPaidRequestService,
  ],
  exports: [RequestsRepository],
})
export class RequestsModule {}
