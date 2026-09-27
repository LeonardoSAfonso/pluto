'use client';

import React, { useState } from 'react';
import PlutoLogo from '@/components/ui/PlutoLogo';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import { toast } from 'react-toastify';

export default function DesignSystemPreviewPage() {
  const [btnLoading, setBtnLoading] = useState(false);

  const handleSimulateAction = () => {
    setBtnLoading(true);
    setTimeout(() => {
      setBtnLoading(false);
      toast.success('Ação financeira simulada com sucesso!');
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-slate-100/70 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header do Showcase */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <PlutoLogo size="md" />
          <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
              Etapa 1 — Design System Showcase
            </span>
          </div>
        </header>

        {/* 1. Logos e Identidade */}
        <section className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            1. Identidade Institucional (Ploutos / Pluto)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Tamanho Pequeno (sm)</span>
              <PlutoLogo size="sm" />
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Tamanho Médio (md)</span>
              <PlutoLogo size="md" />
            </div>
            <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 flex flex-col items-center justify-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Dark Surface (lg)</span>
              <PlutoLogo size="lg" className="[&_span]:text-white" />
            </div>
          </div>
        </section>

        {/* 2. Badges de Status Financeiro */}
        <section className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900">
              2. Status Financeiros (Regras de Negócio GEX)
            </h2>
            <span className="text-xs text-slate-500">PENDING • APPROVED • PAID • REJECTED</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Pendente</span>
              <StatusBadge status="PENDING" />
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Aprovado</span>
              <StatusBadge status="APPROVED" />
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Pago</span>
              <StatusBadge status="PAID" />
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Rejeitado</span>
              <StatusBadge status="REJECTED" />
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-amber-50/50 border border-amber-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Indicador de Vencimento (Overdue)</p>
              <p className="text-xs text-slate-500">Exibido quando due_date &lt; referência em status PENDING ou APPROVED</p>
            </div>
            <StatusBadge status="PENDING" isOverdue={true} />
          </div>
        </section>

        {/* 3. Componentes de Botão e Ação */}
        <section className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900">
              3. Botões e Estados Operacionais
            </h2>
            <span className="text-xs text-slate-500">Proteção contra múltiplos envios</span>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary" onClick={handleSimulateAction} loading={btnLoading}>
              Primary (Pluto Gold)
            </Button>
            <Button variant="secondary" onClick={() => toast.info('Ação secundária disparada')}>
              Secondary (Navy)
            </Button>
            <Button variant="outline" onClick={() => toast.warn('Atenção: Ação de rascunho')}>
              Outline
            </Button>
            <Button variant="danger" onClick={() => toast.error('Ação destrutiva acionada')}>
              Danger (Rejeição)
            </Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="primary" disabled>
              Desabilitado
            </Button>
          </div>
        </section>

        {/* 4. Tipografia e Precisão Monetária */}
        <section className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            4. Precisão Monetária &amp; Alinhamento Tabular
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-xs uppercase font-bold text-amber-800 tracking-wider">
                Total Pendente (Gabarito)
              </span>
              <p className="mt-2 text-2xl font-extrabold text-amber-950 font-mono tracking-tight">
                R$ 8.750,49
              </p>
              <span className="text-[11px] text-amber-700">875049 centavos</span>
            </div>
            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">
                Total Aprovado (Gabarito)
              </span>
              <p className="mt-2 text-2xl font-extrabold text-emerald-950 font-mono tracking-tight">
                R$ 6.585,99
              </p>
              <span className="text-[11px] text-emerald-700">658599 centavos</span>
            </div>
            <div className="p-5 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-xs uppercase font-bold text-blue-800 tracking-wider">
                Pago no Mês (Gabarito)
              </span>
              <p className="mt-2 text-2xl font-extrabold text-blue-950 font-mono tracking-tight">
                R$ 8.415,49
              </p>
              <span className="text-[11px] text-blue-700">841549 centavos</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
