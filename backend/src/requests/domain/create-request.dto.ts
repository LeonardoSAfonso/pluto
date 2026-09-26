import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateRequestDTO {
  @IsString({ message: 'Nome do fornecedor deve ser uma string' })
  @IsNotEmpty({ message: 'Nome do fornecedor é obrigatório' })
  supplier_name: string;

  @IsString({ message: 'CNPJ do fornecedor deve ser uma string' })
  @IsNotEmpty({ message: 'CNPJ do fornecedor é obrigatório' })
  supplier_cnpj: string;

  @IsString({ message: 'Número da nota fiscal deve ser uma string' })
  @IsNotEmpty({ message: 'Número da nota fiscal é obrigatório' })
  invoice_number: string;

  @IsInt({ message: 'Valor deve ser um número inteiro em centavos' })
  @Min(1, { message: 'Valor monetário deve ser maior que zero (mínimo 1 centavo)' })
  amount_cents: number;

  @IsString({ message: 'Competência deve ser uma string (ex: 2026-09)' })
  @IsNotEmpty({ message: 'Competência é obrigatória' })
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'Competência deve estar no formato AAAA-MM (ex: 2026-09)',
  })
  competence: string;

  @IsString({ message: 'Data de vencimento deve ser uma string ISO (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Data de vencimento é obrigatória' })
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'Data de vencimento deve estar no formato AAAA-MM-DD',
  })
  due_date: string;

  @IsString({ message: 'Categoria deve ser uma string' })
  @IsNotEmpty({ message: 'Categoria é obrigatória' })
  category: string;

  @IsString({ message: 'Descrição deve ser uma string' })
  @IsOptional()
  description?: string;
}
