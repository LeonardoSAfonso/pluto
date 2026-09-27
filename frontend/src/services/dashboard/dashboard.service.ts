import BaseService from '../base.service';
import { DashboardSummaryDTO } from '@/types/api/dashboard.types';

export class DashboardService extends BaseService {
  public async getSummary(): Promise<DashboardSummaryDTO> {
    const { data } = await this.api.get<DashboardSummaryDTO>('/dashboard/summary');
    return data;
  }
}

export default DashboardService;
