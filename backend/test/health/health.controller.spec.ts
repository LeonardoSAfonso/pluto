import { HealthController } from 'src/health/health.controller';
import { PrismaService } from 'src/orm/prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('HealthController (Unitário)', () => {
  let controller: HealthController;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      $queryRaw: jest.fn(),
    };
    controller = new HealthController(mockPrisma);
  });

  it('deve retornar status ok e banco conectado quando query tiver sucesso', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([1]);

    const result = await controller.check();

    expect(result.status).toBe('ok');
    expect(result.database).toBe('connected');
    expect(typeof result.uptime).toBe('number');
    expect(result.timestamp).toBeDefined();
    expect(mockPrisma.$queryRaw).toHaveBeenCalled();
  });

  it('deve lançar HttpException 503 quando o banco falhar', async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection timeout'));

    await expect(controller.check()).rejects.toThrow(HttpException);

    try {
      await controller.check();
    } catch (err: any) {
      expect(err.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      expect(err.getResponse()).toEqual({
        status: 'error',
        database: 'disconnected',
        message: 'Connection timeout',
      });
    }
  });
});
