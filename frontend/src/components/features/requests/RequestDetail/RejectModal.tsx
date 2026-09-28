'use client';

import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import Button from '@/components/ui/Button';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  supplierName: string;
  invoiceNumber: string;
}

export const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  supplierName,
  invoiceNumber,
}) => {
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('O motivo da rejeição é obrigatório (mínimo 3 caracteres).');
      return;
    }
    if (reason.trim().length < 3) {
      setError('Descreva o motivo com pelo menos 3 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim());
      setReason('');
      setError(null);
      onClose();
    } catch {
      // Erro já tratado no callback pai
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
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
              <CancelOutlinedIcon fontSize="medium" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Rejeitar Solicitação
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {supplierName} • NF {invoiceNumber}
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
          <div>
            <label
              htmlFor="rejection_reason"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Motivo da Rejeição <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="rejection_reason"
              rows={4}
              placeholder="Descreva detalhadamente o motivo da reprovação (ex: Nota fiscal com divergência de CNPJ, valor incorreto, etc.)..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              disabled={isSubmitting}
              className={`w-full px-4 py-3 rounded-2xl border text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                error
                  ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-rose-500/20 focus:border-rose-500'
              }`}
            />
            {error && (
              <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {error}
              </p>
            )}
            <p className="mt-1.5 text-[11px] text-slate-400">
              Este motivo será registrado permanentemente no histórico de auditoria.
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
              variant="danger"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Confirmar Rejeição
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectModal;
