import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthenticatedUserPayload } from 'src/auth/domain/auth-response.dto';
import { CreateRequestDTO } from './domain/create-request.dto';
import { QueryRequestsDTO } from './domain/query-requests.dto';
import { DecisionDTO } from './domain/decision.dto';
import { MarkPaidDTO } from './domain/mark-paid.dto';
import CreateRequestService from './services/create';
import FindRequestsService from './services/find';
import FindOneRequestService from './services/findOne';
import DecideRequestService from './services/decision';
import MarkPaidRequestService from './services/markPaid';

@Controller('requests')
export class RequestsController {
  constructor(
    private readonly createService: CreateRequestService,
    private readonly findService: FindRequestsService,
    private readonly findOneService: FindOneRequestService,
    private readonly decideService: DecideRequestService,
    private readonly markPaidService: MarkPaidRequestService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Body() dto: CreateRequestDTO,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.createService.execute(dto, user.id);
  }

  @Get()
  public async find(
    @Query() query: QueryRequestsDTO,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.findService.execute(query, user);
  }

  @Get(':id')
  public async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.findOneService.execute(id, user);
  }

  @Roles(Role.FINANCE)
  @Post(':id/decision')
  @HttpCode(HttpStatus.OK)
  public async decide(
    @Param('id') id: string,
    @Body() dto: DecisionDTO,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.decideService.execute(id, dto, user);
  }

  @Roles(Role.FINANCE)
  @Post(':id/mark-paid')
  @HttpCode(HttpStatus.OK)
  public async markPaid(
    @Param('id') id: string,
    @Body() dto: MarkPaidDTO,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.markPaidService.execute(id, dto, user);
  }
}
