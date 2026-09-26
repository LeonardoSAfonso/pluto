import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from 'src/orm/prisma.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        uptime: process.uptime(),
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw new HttpException(
        {
          status: 'error',
          database: 'disconnected',
          message: error.message || 'Falha de comunicação com o banco de dados',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
