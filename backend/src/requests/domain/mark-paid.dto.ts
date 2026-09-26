import { IsNotEmpty, IsString } from 'class-validator';

export class MarkPaidDTO {
  @IsString({ message: 'Data de pagamento é obrigatória' })
  @IsNotEmpty({ message: 'Data de pagamento não pode estar vazia' })
  paid_at: string;

  @IsString({ message: 'Referência do pagamento é obrigatória' })
  @IsNotEmpty({ message: 'Referência do pagamento não pode estar vazia' })
  payment_reference: string;
}
