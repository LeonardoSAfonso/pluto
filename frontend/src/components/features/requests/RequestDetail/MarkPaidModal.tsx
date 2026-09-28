'use client';

import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import PaymentIcon from '@mui/icons-material/Payment';
import Button from '@/components/ui/Button';
import { formatCentsToBRL } from '@/utils/formatMoney';

interface MarkPaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { paid_at: string; payment_reference: string }) => Promise<void>;
  supplierName: string;
  invoiceNumber: string;
  amountCents: number;
}

export const MarkPaidModal: React.FC<MarkPaidModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  supplierName,
  invoiceNumber,
  amountCents,
}) => {
  // Data padrão de referência do portal (2026-09-18 ou data atual)
  const [paidAt, setPaidAt] = useState<string>('2026-09-18');
  const [reference, setReference] = useState<string>('');
  const [errors, setErrors] = useState<{ paid_at?: string; reference?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { paid_at?: string; reference?: string } = {};

    if (!paidAt) {
      newErrors.paid_at = 'A data de pagamento é obrigatória.';
    }
    if (!reference.trim()) {
      newErrors.reference = 'A referência/comprovante do pagamento é obrigatória.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm({
        paid_at: paidAt,
        payment_reference: reference.trim(),
      });
      setReference('');
      setErrors({});
      onClose();
    } catch {
      // Erro tratado no componente pai
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
              <PaymentIcon fontSize="medium" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Liquidar e Marcar como Pago
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {supplierName} • NF {invoiceNumber} •{' '}
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatCentsToBRL(amountCents)}
                </strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Fechar modal"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* Corpo do Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Data de Pagamento */}
          <div>
            <label
              htmlFor="paid_at"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Data Efetiva do Pagamento <span className="text-rose-500">*</span>
            </label>
            <input
              id="paid_at"
              type="date"
              value={paidAt}
              onChange={(e) => {
                setPaidAt(e.target.value);
                if (errors.paid_at) setErrors((prev) => ({ ...prev, paid_at: undefined }));
              }}
              disabled={isSubmitting}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                errors.paid_at
                  ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500/20 focus:border-emerald-500'
              }`}
            />
            {errors.paid_at && (
              <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errors.paid_at}
              </p>
            )}
          </div>

          {/* Referência do Pagamento */}
          <div>
            <label
              htmlFor="payment_reference"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Código / Referência Bancária do Comprovante <span className="text-rose-500">*</span>
            </label>
            <input
              id="payment_reference"
              type="text"
              placeholder="Ex: TED-88239102-GEX ou PIX-99420-GEX"
              value={reference}
              onChange={(e) => {
                setReference(e.target.value);
                if (errors.reference) setErrors((prev) => ({ ...prev, reference: undefined }));
              }}
              disabled={isSubmitting}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                errors.reference
                  ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500/20 focus:border-emerald-500'
              }`}
            />
            {errors.reference && (
              <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errors.reference}
              </p>
            )}
            <p className="mt-1.5 text-[11px] text-slate-400">
              Número de autenticação ou identificador gerado pela instituição financeira.
            </p>
          </div>

          {/* Ações */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Confirmar Pagamento
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarkPaidModal;
