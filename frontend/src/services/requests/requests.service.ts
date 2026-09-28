import BaseService from '../base.service';
import {
  CreateRequestInput,
  DecisionInput,
  MarkPaidInput,
  PaginatedResponse,
  QueryRequestsParams,
  RequestDetailItem,
  RequestItem,
} from '@/types/api/request.types';

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

  public async getRequest(id: string): Promise<RequestDetailItem> {
    const { data } = await this.api.get<RequestDetailItem>(`/requests/${id}`);
    return data;
  }

  public async createRequest(payload: CreateRequestInput): Promise<RequestItem> {
    const { data } = await this.api.post<RequestItem>('/requests', payload);
    return data;
  }

  public async decideRequest(id: string, payload: DecisionInput): Promise<RequestItem> {
    const { data } = await this.api.post<RequestItem>(`/requests/${id}/decision`, payload);
    return data;
  }

  public async markPaid(id: string, payload: MarkPaidInput): Promise<RequestItem> {
    const { data } = await this.api.post<RequestItem>(`/requests/${id}/mark-paid`, payload);
    return data;
  }
}

export default RequestsService;


