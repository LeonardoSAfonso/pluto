import { AxiosInstance } from 'axios';
import { ApiService } from '@/config/api';

export abstract class BaseService {
  protected readonly api: AxiosInstance;

  constructor(token?: string) {
    this.api = ApiService.getInstance(token);
  }
}

export default BaseService;
