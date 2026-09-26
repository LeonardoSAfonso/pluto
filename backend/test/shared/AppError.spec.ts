import AppError from 'src/shared/AppError';

describe('AppError', () => {
  it('should instantiate with default status 400', () => {
    const error = new AppError('Erro padrão');
    expect(error.message).toBe('Erro padrão');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('AppError');
  });

  it('should instantiate with custom status code', () => {
    const error = new AppError('Não autorizado', 401);
    expect(error.message).toBe('Não autorizado');
    expect(error.statusCode).toBe(401);
  });
});
