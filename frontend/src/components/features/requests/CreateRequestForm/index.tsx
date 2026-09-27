'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import SendIcon from '@mui/icons-material/Send';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Button from '@/components/ui/Button';
import RequestsService from '@/services/requests/requests.service';
import { applyCnpjMask, stripCnpjMask, isValidCnpj } from '@/utils/formatCnpj';
import { maskCurrencyInput, parseBRLtoCents } from '@/utils/formatMoney';
import { CreateRequestFormData, FormErrors, CreateRequestFormProps } from './types';

const CATEGORY_OPTIONS = [
  { value: 'SOFTWARE', label: 'Software / SaaS' },
  { value: 'SERVIÇOS', label: 'Serviços Especializados' },
  { value: 'MARKETING', label: 'Marketing & Publicidade' },
  { value: 'INFRAESTRUTURA', label: 'Infraestrutura & Nuvem' },
  { value: 'CONSULTORIA', label: 'Consultoria' },
  { value: 'TREINAMENTO', label: 'Treinamento & Capacitação' },
  { value: 'SUPRIMENTOS', label: 'Suprimentos Corporativos' },
  { value: 'LOGÍSTICA', label: 'Logística & Fretes' },
  { value: 'OUTROS', label: 'Outros' },
];

export const CreateRequestForm: React.FC<CreateRequestFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const router = useRouter();
  const requestsService = React.useMemo(() => new RequestsService(), []);

  const [formData, setFormData] = useState<CreateRequestFormData>({
    supplier_name: '',
    supplier_cnpj: '',
    invoice_number: '',
    amount: '',
    competence: '',
    due_date: '',
    category: 'SOFTWARE',
    description: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Manipulação de mudança de texto padrão
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (conflictError) {
      setConflictError(null);
    }
  };

  // Máscara dinâmica de CNPJ
  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyCnpjMask(e.target.value);
    setFormData((prev) => ({ ...prev, supplier_cnpj: masked }));
    if (errors.supplier_cnpj) {
      setErrors((prev) => ({ ...prev, supplier_cnpj: undefined }));
    }
    if (conflictError) {
      setConflictError(null);
    }
  };

  // Máscara dinâmica de Moeda BRL
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCurrencyInput(e.target.value);
    setFormData((prev) => ({ ...prev, amount: masked }));
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: undefined }));
    }
  };

  // Máscara de Competência MM/AAAA
  const handleCompetenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
    let formatted = digits;
    if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 6)}`;
    }
    setFormData((prev) => ({ ...prev, competence: formatted }));
    if (errors.competence) {
      setErrors((prev) => ({ ...prev, competence: undefined }));
    }
  };

  // Preenchimento de dados de teste para facilitar validação
  const fillSampleData = (duplicate: boolean = false) => {
    if (duplicate) {
      // Dados já existentes na seed oficial (NF-2026-1001 e CNPJ 10.000.000/0001-45)
      setFormData({
        supplier_name: 'Aurora Serviços Digitais',
        supplier_cnpj: applyCnpjMask('10000000000145'),
        invoice_number: 'NF-2026-1001',
        amount: '1.250,00',
        competence: '09/2026',
        due_date: '2026-09-30',
        category: 'SOFTWARE',
        description: 'Teste de duplicidade com nota e CNPJ já cadastrados na base',
      });
    } else {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      setFormData({
        supplier_name: `Tecnologia Pluto Inovações ${randomSuffix}`,
        supplier_cnpj: applyCnpjMask('10000000000145'), // CNPJ matematicamente válido
        invoice_number: `NF-2026-${randomSuffix}`,
        amount: '3.450,80',
        competence: '09/2026',
        due_date: '2026-10-15',
        category: 'SOFTWARE',
        description: 'Serviços de consultoria em infraestrutura e nuvem de alta disponibilidade.',
      });
    }
    setErrors({});
    setConflictError(null);
  };

  // Validação dos campos antes da submissão
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.supplier_name.trim()) {
      newErrors.supplier_name = 'O nome do fornecedor é obrigatório.';
    }

    const rawCnpj = stripCnpjMask(formData.supplier_cnpj);
    if (!rawCnpj) {
      newErrors.supplier_cnpj = 'O CNPJ do fornecedor é obrigatório.';
    } else if (!isValidCnpj(rawCnpj)) {
      newErrors.supplier_cnpj = 'CNPJ inválido (dígitos verificadores incorretos).';
    }

    if (!formData.invoice_number.trim()) {
      newErrors.invoice_number = 'O número da nota fiscal é obrigatório.';
    }

    const cents = parseBRLtoCents(formData.amount);
    if (cents <= 0) {
      newErrors.amount = 'O valor deve ser maior que R$ 0,00 (mínimo 1 centavo).';
    }

    if (!formData.competence.trim()) {
      newErrors.competence = 'A competência é obrigatória.';
    } else if (!/^(0[1-9]|1[0-2])\/\d{4}$/.test(formData.competence.trim())) {
      newErrors.competence = 'Formato inválido. Use MM/AAAA (ex: 09/2026).';
    }

    if (!formData.due_date) {
      newErrors.due_date = 'A data de vencimento é obrigatória.';
    }

    if (!formData.category) {
      newErrors.category = 'Selecione uma categoria.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário antes de prosseguir.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Converte competência MM/AAAA para AAAA-MM
      const [month, year] = formData.competence.trim().split('/');
      const isoCompetence = `${year}-${month.padStart(2, '0')}`;

      const payload = {
        supplier_name: formData.supplier_name.trim(),
        supplier_cnpj: stripCnpjMask(formData.supplier_cnpj),
        invoice_number: formData.invoice_number.trim(),
        amount_cents: parseBRLtoCents(formData.amount),
        competence: isoCompetence,
        due_date: formData.due_date,
        category: formData.category,
        description: formData.description.trim() || undefined,
      };

      const created = await requestsService.createRequest(payload);

      toast.success('Solicitação cadastrada com sucesso!');

      if (onSuccess) {
        onSuccess(created);
      } else {
        router.push('/requests');
      }
    } catch (err: any) {
      const status = err.response?.status;
      const apiMessage = err.response?.data?.message;

      if (
        status === 409 ||
        (typeof apiMessage === 'string' &&
          (apiMessage.includes('Já existe') || apiMessage.includes('CNPJ e número de nota fiscal')))
      ) {
        const conflictMsg =
          'Já existe uma solicitação cadastrada com este CNPJ e número de nota fiscal.';
        setConflictError(conflictMsg);
        toast.error(conflictMsg);
      } else if (status === 400 && Array.isArray(apiMessage)) {
        setErrors((prev) => ({
          ...prev,
          general: apiMessage.join(' | '),
        }));
        toast.error('Dados inválidos. Verifique as informações fornecidas.');
      } else {
        const errorMsg =
          typeof apiMessage === 'string'
            ? apiMessage
            : 'Erro ao cadastrar solicitação. Verifique sua conexão e tente novamente.';
        setErrors((prev) => ({ ...prev, general: errorMsg }));
        toast.error(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Barra Superior com Atalhos de Teste */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/70 dark:border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Nova Despesa Financeira
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">
            Atalhos para Teste:
          </span>
          <button
            type="button"
            onClick={() => fillSampleData(false)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
          >
            <AutoAwesomeIcon className="text-xs" fontSize="inherit" />
            Preencher Dados Válidos
          </button>
          <button
            type="button"
            onClick={() => fillSampleData(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
          >
            <ErrorOutlineIcon className="text-xs" fontSize="inherit" />
            Simular Nota Duplicada (409)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {/* Banner de Erro 409 (Duplicidade) */}
        {conflictError && (
          <div
            id="conflict-error-banner"
            className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-sm animate-fade-in"
          >
            <ErrorOutlineIcon className="text-rose-600 dark:text-rose-400 text-lg shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">Conflito de Duplicidade (409)</strong>
              <span>{conflictError}</span>
            </div>
          </div>
        )}

        {/* Banner de Erro Geral */}
        {errors.general && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3 text-amber-800 dark:text-amber-200 text-sm">
            <ErrorOutlineIcon className="text-amber-600 dark:text-amber-400 text-lg shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">Aviso de Validação</strong>
              <span>{errors.general}</span>
            </div>
          </div>
        )}

        {/* Grid de 2 Colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fornecedor */}
          <div>
            <label
              htmlFor="supplier_name"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Fornecedor / Razão Social <span className="text-rose-500">*</span>
            </label>
            <input
              id="supplier_name"
              name="supplier_name"
              type="text"
              placeholder="Ex: Aurora Serviços Digitais Ltda"
              value={formData.supplier_name}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                errors.supplier_name
                  ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-amber-500/20 focus:border-amber-500'
              }`}
            />
            {errors.supplier_name && (
              <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errors.supplier_name}
              </p>
            )}
          </div>

          {/* CNPJ do Fornecedor */}
          <div>
            <label
              htmlFor="supplier_cnpj"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
            >
              CNPJ do Fornecedor <span className="text-rose-500">*</span>
            </label>
            <input
              id="supplier_cnpj"
              name="supplier_cnpj"
              type="text"
              placeholder="00.000.000/0000-00"
              value={formData.supplier_cnpj}
              onChange={handleCnpjChange}
              maxLength={18}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                errors.supplier_cnpj
                  ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-amber-500/20 focus:border-amber-500'
              }`}
            />
            {errors.supplier_cnpj ? (
              <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errors.supplier_cnpj}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Aceita digitação contínua. Dígitos verificadores validados matematicamente.
              </p>
            )}
          </div>

          {/* Número da Nota Fiscal */}
          <div>
            <label
              htmlFor="invoice_number"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Número da Nota Fiscal <span className="text-rose-500">*</span>
            </label>
            <input
              id="invoice_number"
              name="invoice_number"
              type="text"
              placeholder="Ex: NF-2026-9042"
              value={formData.invoice_number}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                errors.invoice_number
                  ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-amber-500/20 focus:border-amber-500'
              }`}
            />
            {errors.invoice_number && (
              <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errors.invoice_number}
              </p>
            )}
          </div>

          {/* Categoria */}
          <div>
            <label
              htmlFor="category"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Categoria da Despesa <span className="text-rose-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                errors.category
                  ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-amber-500/20 focus:border-amber-500'
              }`}
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errors.category}
              </p>
            )}
          </div>

          {/* Valor da Despesa */}
          <div>
            <label
              htmlFor="amount"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Valor da Despesa (R$) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sm font-semibold text-slate-500 dark:text-slate-400 select-none">
                R$
              </span>
              <input
                id="amount"
                name="amount"
                type="text"
                placeholder="0,00"
                value={formData.amount}
                onChange={handleAmountChange}
                disabled={isSubmitting}
                className={`w-full pl-11 pr-3.5 py-2.5 rounded-xl border text-sm font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                  errors.amount
                    ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-amber-500/20 focus:border-amber-500'
                }`}
              />
            </div>
            {errors.amount ? (
              <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errors.amount}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Armazenado estritamente em centavos inteiros (&gt; 0) no banco de dados.
              </p>
            )}
          </div>

          {/* Competência (MM/AAAA) */}
          <div>
            <label
              htmlFor="competence"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Competência (Mês/Ano) <span className="text-rose-500">*</span>
            </label>
            <input
              id="competence"
              name="competence"
              type="text"
              placeholder="09/2026"
              maxLength={7}
              value={formData.competence}
              onChange={handleCompetenceChange}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                errors.competence
                  ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-amber-500/20 focus:border-amber-500'
              }`}
            />
            {errors.competence ? (
              <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errors.competence}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Formato MM/AAAA. Convertido automaticamente para AAAA-MM para a API.
              </p>
            )}
          </div>

          {/* Data de Vencimento */}
          <div>
            <label
              htmlFor="due_date"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Data de Vencimento <span className="text-rose-500">*</span>
            </label>
            <input
              id="due_date"
              name="due_date"
              type="date"
              value={formData.due_date}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                errors.due_date
                  ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-amber-500/20 focus:border-amber-500'
              }`}
            />
            {errors.due_date && (
              <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errors.due_date}
              </p>
            )}
          </div>

          {/* Descrição / Justificativa */}
          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Descrição / Justificativa da Despesa <span className="text-slate-400 font-normal lowercase">(opcional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Descreva detalhes sobre a contratação, escopo ou finalidade da despesa..."
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel || (() => router.push('/requests'))}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            <ArrowBackIcon className="text-sm mr-1.5" />
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 shadow-sm"
          >
            <SendIcon className="text-sm mr-1.5" />
            Cadastrar Solicitação
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateRequestForm;
