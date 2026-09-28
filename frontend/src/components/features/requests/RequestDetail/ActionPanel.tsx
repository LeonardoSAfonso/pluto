'use client';

import React, { useState } from 'react';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PaymentIcon from '@mui/icons-material/Payment';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Button from '@/components/ui/Button';
import { UserRole } from '@/types/api/auth.types';
import { RequestDetailItem } from '@/types/api/request.types';
import RejectModal from './RejectModal';
import MarkPaidModal from './MarkPaidModal';

interface ActionPanelProps {
  request: RequestDetailItem;
  userRole?: UserRole;
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  onMarkPaid: (data: { paid_at: string; payment_reference: string }) => Promise<void>;
  isSubmitting?: boolean;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  request,
  userRole,
  onApprove,
  onReject,
  onMarkPaid,
  isSubmitting = false,
}) => {
  const [isRejectOpen, setIsRejectOpen] = useState<boolean>(false);
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState<boolean>(false);
  const [isConfirmApproveOpen, setIsConfirmApproveOpen] = useState<boolean>(false);

  const isFinance = userRole === 'FINANCE';

  // 1. Cenário: Usuário Financeiro + Status PENDING
  if (isFinance && request.status === 'PENDING') {
    return (
      <>
        <div className="bg-white dark:bg-slate-900 border-2 border-amber-200/80 dark:border-amber-800/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Decisão de Aprovação Financeira
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Avalie os dados e a nota fiscal fornecida para autorizar ou recusar a despesa.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="danger"
                size="md"
                onClick={() => setIsRejectOpen(true)}
                disabled={isSubmitting}
                leftIcon={<CancelOutlinedIcon fontSize="small" />}
                data-testid="request-reject-button"
              >
                Rejeitar
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={() => setIsConfirmApproveOpen(true)}
                disabled={isSubmitting}
                loading={isSubmitting}
                leftIcon={<CheckCircleOutlinedIcon fontSize="small" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                data-testid="request-approve-button"
              >
                Aprovar Solicitação
              </Button>
            </div>
          </div>
        </div>

        {/* Modal de Rejeição */}
        <RejectModal
          isOpen={isRejectOpen}
          onClose={() => setIsRejectOpen(false)}
          onConfirm={onReject}
          supplierName={request.supplier_name}
          invoiceNumber={request.invoice_number}
        />

        {/* Modal de Confirmação Rápida de Aprovação */}
        {isConfirmApproveOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-6 space-y-4 animate-scale-up">
              <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50">
                  <CheckCircleOutlinedIcon fontSize="medium" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Confirmar Aprovação?
                  </h3>
                  <p className="text-xs text-slate-500">
                    A solicitação passará para o status APROVADA.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                Deseja autorizar o pagamento de{' '}
                <strong>{request.invoice_number}</strong> para{' '}
                <strong>{request.supplier_name}</strong>?
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsConfirmApproveOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={async () => {
                    await onApprove();
                    setIsConfirmApproveOpen(false);
                  }}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Sim, Aprovar
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // 2. Cenário: Usuário Financeiro + Status APPROVED (Pronto para pagar)
  if (isFinance && request.status === 'APPROVED') {
    return (
      <>
        <div className="bg-white dark:bg-slate-900 border-2 border-emerald-200/80 dark:border-emerald-800/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Liquidação Financeira Pendente
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Esta despesa foi aprovada e aguarda a confirmação da transação bancária e comprovante.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => setIsMarkPaidOpen(true)}
              disabled={isSubmitting}
              leftIcon={<PaymentIcon fontSize="small" />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
              data-testid="request-mark-paid-button"
            >
              Registrar Pagamento
            </Button>
          </div>
        </div>

        {/* Modal de Pagamento */}
        <MarkPaidModal
          isOpen={isMarkPaidOpen}
          onClose={() => setIsMarkPaidOpen(false)}
          onConfirm={onMarkPaid}
          supplierName={request.supplier_name}
          invoiceNumber={request.invoice_number}
          amountCents={request.amount_cents}
        />
      </>
    );
  }

  // 3. Cenário: Estados Terminais (PAID ou REJECTED)
  if (request.status === 'PAID') {
    return (
      <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs">
        <LockOutlinedIcon fontSize="small" />
        <span>
          <strong>Fluxo Finalizado:</strong> Solicitação paga e comprovada no sistema. Nenhuma ação pendente.
        </span>
      </div>
    );
  }

  if (request.status === 'REJECTED') {
    return (
      <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 flex items-center gap-3 text-rose-800 dark:text-rose-300 text-xs">
        <LockOutlinedIcon fontSize="small" />
        <span>
          <strong>Fluxo Encerrado:</strong> Solicitação reprovada pelo setor financeiro.
        </span>
      </div>
    );
  }

  // 4. Cenário: Solicitante aguardando análise
  return (
    <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-3 text-amber-800 dark:text-amber-300 text-xs">
      <InfoOutlinedIcon fontSize="small" />
      <span>
        <strong>Em Análise:</strong> Sua solicitação foi recebida e está aguardando revisão da equipe financeira.
      </span>
    </div>
  );
};

export default ActionPanel;
