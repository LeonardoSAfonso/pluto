'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import BaseLayout from '@/components/layout/BaseLayout';
import RouteGuard from '@/utils/RouteGuard';
import CreateRequestForm from '@/components/features/requests/CreateRequestForm';
import { RequestItem } from '@/types/api/request.types';

export default function NewRequestPage() {
  const router = useRouter();

  const handleSuccess = (created: RequestItem) => {
    // Redireciona para a lista de solicitações
    router.push('/requests');
  };

  return (
    <RouteGuard allowedRoles={['REQUESTER']}>
      <BaseLayout>
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
          {/* Breadcrumb & Cabeçalho */}
          <div className="flex flex-col gap-2">
            <nav className="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-1.5 font-medium">
              <Link
                href="/requests"
                className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1"
              >
                <ArrowBackIcon className="text-xs" fontSize="inherit" />
                Solicitações
              </Link>
              <ChevronRightIcon className="text-xs text-slate-400" fontSize="inherit" />
              <span className="text-slate-900 dark:text-slate-200 font-semibold">
                Nova Solicitação
              </span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <NoteAddIcon fontSize="medium" />
                  </div>
                  Nova Solicitação Financeira
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Cadastre as informações da nota fiscal e despesa para análise da equipe financeira.
                </p>
              </div>
            </div>
          </div>

          {/* Formulário Componentizado */}
          <CreateRequestForm onSuccess={handleSuccess} onCancel={() => router.push('/requests')} />
        </div>
      </BaseLayout>
    </RouteGuard>
  );
}
