import BaseService from '../base.service';
import { PaginatedResponse, QueryRequestsParams, RequestItem } from '@/types/api/request.types';

export class RequestsService extends BaseService {
  public async getRequests(
    params?: QueryRequestsParams
  ): Promise<PaginatedResponse<RequestItem>> {
    const queryParams: Record<string, string | number> = {};

    if (params) {
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;
      if (params.status && params.status !== 'ALL') queryParams.status = params.status;
      if (params.supplier_name?.trim()) queryParams.supplier_name = params.supplier_name.trim();
      if (params.due_date_from) queryParams.due_date_from = params.due_date_from;
      if (params.due_date_to) queryParams.due_date_to = params.due_date_to;
    }

    const { data } = await this.api.get<PaginatedResponse<RequestItem>>('/requests', {
      params: queryParams,
    });
    return data;
  }

  public async getRequest(id: string): Promise<RequestItem> {
    const { data } = await this.api.get<RequestItem>(`/requests/${id}`);
    return data;
  }
}

export default RequestsService;
