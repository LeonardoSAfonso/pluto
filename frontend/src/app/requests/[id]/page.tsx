'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import BaseLayout from '@/components/layout/BaseLayout';
import RouteGuard from '@/utils/RouteGuard';
import { useAuth } from '@/hooks/useAuth';
import RequestsService from '@/services/requests/requests.service';
import { RequestDetailItem } from '@/types/api/request.types';
import {
  RequestHeader,
  RequestInfoGrid,
  AuditTimeline,
  ActionPanel,
} from '@/components/features/requests/RequestDetail';
import Button from '@/components/ui/Button';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RequestDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const requestId = resolvedParams.id;

  const { role } = useAuth();
  const requestsService = React.useMemo(() => new RequestsService(), []);

  const [request, setRequest] = useState<RequestDetailItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setErrorStatus(null);
    setErrorMessage(null);

    try {
      const data = await requestsService.getRequest(requestId);
      setRequest(data);
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 403) {
        setErrorStatus(403);
        setErrorMessage(
          typeof message === 'string'
            ? message
            : 'Você não tem permissão para visualizar esta solicitação.'
        );
      } else if (status === 404) {
        setErrorStatus(404);
        setErrorMessage('Solicitação de pagamento não encontrada.');
      } else {
        setErrorStatus(status || 500);
        setErrorMessage(
          typeof message === 'string'
            ? message
            : 'Erro ao carregar detalhes da solicitação. Verifique sua conexão.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [requestsService, requestId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Handler: Aprovação (FINANCE)
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await requestsService.decideRequest(requestId, { action: 'APPROVE' });
      toast.success('Solicitação aprovada com sucesso!');
      await fetchDetail();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao aprovar a solicitação.';
      toast.error(typeof msg === 'string' ? msg : 'Erro ao aprovar solicitação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Rejeição com motivo obrigatório (FINANCE)
  const handleReject = async (reason: string) => {
    setIsSubmitting(true);
    try {
      await requestsService.decideRequest(requestId, { action: 'REJECT', reason });
      toast.success('Solicitação rejeitada com sucesso!');
      await fetchDetail();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao rejeitar a solicitação.';
      toast.error(typeof msg === 'string' ? msg : 'Erro ao rejeitar solicitação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Marcar como Pago com data e referência (FINANCE)
  const handleMarkPaid = async (data: { paid_at: string; payment_reference: string }) => {
    setIsSubmitting(true);
    try {
      await requestsService.markPaid(requestId, data);
      toast.success('Pagamento liquidado e registrado com sucesso!');
      await fetchDetail();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao registrar pagamento.';
      toast.error(typeof msg === 'string' ? msg : 'Erro ao registrar pagamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RouteGuard>
      <BaseLayout>
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
          {/* Breadcrumb */}
          <nav className="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-1.5 font-medium">
            <Link
              href="/requests"
              className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <ArrowBackIcon className="text-xs" fontSize="inherit" />
              Solicitações
            </Link>
            <ChevronRightIcon className="text-xs text-slate-400" fontSize="inherit" />
            <span className="text-slate-900 dark:text-slate-200 font-semibold truncate max-w-xs sm:max-w-md">
              {request ? `${request.supplier_name} (${request.invoice_number})` : 'Detalhe'}
            </span>
          </nav>

          {/* Estado de Carregamento (Skeleton) */}
          {loading && (
            <div className="space-y-6 animate-pulse">
              <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
              <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
              <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            </div>
          )}

          {/* Estado de Erro de Permissão (403 Forbidden) */}
          {!loading && errorStatus === 403 && (
            <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <SecurityIcon fontSize="large" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Acesso Não Autorizado (403)
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {errorMessage ||
                  'Como Solicitante, você tem permissão para visualizar somente as solicitações criadas por você.'}
              </p>
              <div className="pt-2">
                <Link href="/requests">
                  <Button variant="primary" size="md">
                    Voltar para Minhas Solicitações
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Estado de Erro Não Encontrado (404) ou Outro */}
          {!loading && errorStatus && errorStatus !== 403 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <ErrorOutlineIcon fontSize="large" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Solicitação Não Encontrada
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {errorMessage || 'O identificador solicitado não existe ou foi removido.'}
              </p>
              <div className="pt-2">
                <Link href="/requests">
                  <Button variant="outline" size="md">
                    Retornar à Lista
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Conteúdo Principal do Detalhe */}
          {!loading && request && (
            <>
              {/* Cabeçalho */}
              <RequestHeader request={request} />

              {/* Painel de Ações Decisórias Contextual */}
              <ActionPanel
                request={request}
                userRole={role ?? undefined}
                onApprove={handleApprove}
                onReject={handleReject}
                onMarkPaid={handleMarkPaid}
                isSubmitting={isSubmitting}
              />

              {/* Grid com Atributos Financeiros */}
              <RequestInfoGrid request={request} />

              {/* Linha do Tempo de Auditoria */}
              <AuditTimeline events={request.auditEvents || []} />
            </>
          )}
        </div>
      </BaseLayout>
    </RouteGuard>
  );
}
