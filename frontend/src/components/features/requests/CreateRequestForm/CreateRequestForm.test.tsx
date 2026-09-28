import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateRequestForm from './index';
import RequestsService from '@/services/requests/requests.service';

// Mock do RequestsService
jest.mock('@/services/requests/requests.service');

describe('CreateRequestForm Component', () => {
  let createRequestMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    createRequestMock = jest.fn().mockResolvedValue({
      id: '20000000-0000-4000-8000-000000000099',
      supplier_name: 'Fornecedor Teste',
      supplier_cnpj: '10000000000145',
      invoice_number: 'NF-2026-9999',
      amount_cents: 155313,
      competence: '2026-09',
      due_date: '2026-09-30',
      category: 'SOFTWARE',
      status: 'PENDING',
    });

    (RequestsService as jest.MockedClass<typeof RequestsService>).prototype.createRequest =
      createRequestMock;
  });

  it('deve renderizar todos os campos obrigatórios do formulário', () => {
    render(<CreateRequestForm />);

    expect(screen.getByLabelText(/Razão Social/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CNPJ do Fornecedor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Número da Nota Fiscal/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/Valor da Despesa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Competência/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Data de Vencimento/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cadastrar Solicitação/i })).toBeInTheDocument();
  });

  it('deve exibir mensagens de erro ao submeter com campos em branco', async () => {
    render(<CreateRequestForm />);

    const submitBtn = screen.getByRole('button', { name: /Cadastrar Solicitação/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('O nome do fornecedor é obrigatório.')).toBeInTheDocument();
      expect(screen.getByText('O CNPJ do fornecedor é obrigatório.')).toBeInTheDocument();
      expect(screen.getByText('O número da nota fiscal é obrigatório.')).toBeInTheDocument();
      expect(
        screen.getByText('O valor deve ser maior que R$ 0,00 (mínimo 1 centavo).')
      ).toBeInTheDocument();
    });

    expect(createRequestMock).not.toHaveBeenCalled();
  });

  it('deve rejeitar CNPJ inválido utilizando a validação de dígitos verificadores', async () => {
    render(<CreateRequestForm />);

    const cnpjInput = screen.getByLabelText(/CNPJ do Fornecedor/i);
    fireEvent.change(cnpjInput, { target: { value: '11.111.111/1111-11' } });

    const submitBtn = screen.getByRole('button', { name: /Cadastrar Solicitação/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText('CNPJ inválido (dígitos verificadores incorretos).')
      ).toBeInTheDocument();
    });

    expect(createRequestMock).not.toHaveBeenCalled();
  });

  it('deve aplicar máscara de CNPJ e Moeda conforme o usuário digita', () => {
    render(<CreateRequestForm />);

    const cnpjInput = screen.getByLabelText(/CNPJ do Fornecedor/i) as HTMLInputElement;
    fireEvent.change(cnpjInput, { target: { value: '10000000000145' } });
    expect(cnpjInput.value).toBe('10.000.000/0001-45');

    const amountInput = screen.getByLabelText(/Valor da Despesa/i) as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '155313' } });
    expect(amountInput.value.replace(/\u00a0/g, ' ')).toBe('1.553,13');
  });

  it('deve enviar dados convertidos (amount_cents e CNPJ limpo) ao preencher com sucesso', async () => {
    const onSuccessMock = jest.fn();
    render(<CreateRequestForm onSuccess={onSuccessMock} />);

    // Preencher campos válidos
    fireEvent.change(screen.getByLabelText(/Razão Social/i), {
      target: { value: 'Alpha Soluções Digitais' },
    });

    fireEvent.change(screen.getByLabelText(/CNPJ do Fornecedor/i), {
      target: { value: '10.000.000/0001-45' },
    });
    fireEvent.change(screen.getByLabelText(/Número da Nota Fiscal/i), {
      target: { value: 'NF-2026-8888' },
    });
    fireEvent.change(screen.getByLabelText(/Valor da Despesa/i), {
      target: { value: '1.553,13' },
    });
    fireEvent.change(screen.getByLabelText(/Competência/i), {
      target: { value: '09/2026' },
    });
    fireEvent.change(screen.getByLabelText(/Data de Vencimento/i), {
      target: { value: '2026-09-30' },
    });

    const submitBtn = screen.getByRole('button', { name: /Cadastrar Solicitação/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(createRequestMock).toHaveBeenCalledWith({
        supplier_name: 'Alpha Soluções Digitais',
        supplier_cnpj: '10000000000145',
        invoice_number: 'NF-2026-8888',
        amount_cents: 155313,
        competence: '2026-09',
        due_date: '2026-09-30',
        category: 'SOFTWARE',
        description: undefined,
      });
      expect(onSuccessMock).toHaveBeenCalled();
    });
  });
});
