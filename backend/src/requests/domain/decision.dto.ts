import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DecisionDTO {
  @IsIn(['APPROVE', 'REJECT'], {
    message: 'Ação deve ser APPROVE ou REJECT',
  })
  @IsNotEmpty({ message: 'Ação é obrigatória' })
  action: 'APPROVE' | 'REJECT';

  @IsString({ message: 'Motivo deve ser uma string' })
  @IsOptional()
  reason?: string;
}
