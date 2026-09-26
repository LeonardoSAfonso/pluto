import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthenticatedUserPayload } from 'src/auth/domain/auth-response.dto';
import GetDashboardSummaryService from './services/getSummary';
import { DashboardSummaryDTO } from './domain/dashboard-summary.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly summaryService: GetDashboardSummaryService) {}

  @Get('summary')
  @HttpCode(HttpStatus.OK)
  public async getSummary(
    @CurrentUser() user: AuthenticatedUserPayload,
  ): Promise<DashboardSummaryDTO> {
    return this.summaryService.execute(user);
  }
}
