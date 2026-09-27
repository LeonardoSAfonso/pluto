'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import PlutoLogo from '@/components/ui/PlutoLogo';
import { useAuth } from '@/hooks/useAuth';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-100">
      {/* Lado Esquerdo: Branding Institucional Pluto (Ouro & Marinho Nobre) */}
      <div className="lg:w-1/2 bg-slate-950 p-8 sm:p-12 lg:p-16 flex flex-col justify-between text-white relative overflow-hidden">
        {/* Glow e Gradiente de Fundo */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        {/* Topo: Logo */}
        <div className="relative z-10">
          <PlutoLogo size="md" className="[&_span]:text-white" />
        </div>

        {/* Centro: Mensagem Institucional Mitológica */}
        <div className="relative z-10 my-12 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>Portal de Governança Financeira</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Abundância ordenada, precisão contábil e solidez.
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Inspirado em Ploutos, deus grego da riqueza gerada pela fertilidade da terra.
            Uma infraestrutura segura para requisição, aprovação e quitação de despesas empresariais.
          </p>

          <div className="pt-4 space-y-3.5">
            <div className="flex items-center gap-3 text-slate-300 text-xs sm:text-sm">
              <CheckCircleOutlinedIcon className="text-amber-400 shrink-0" fontSize="small" />
              <span>Validação estrita de valores em centavos e dígitos verificadores de CNPJ</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 text-xs sm:text-sm">
              <VerifiedUserOutlinedIcon className="text-amber-400 shrink-0" fontSize="small" />
              <span>Linha do tempo de auditoria imutável em fuso horário de São Paulo</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 text-xs sm:text-sm">
              <AccountBalanceOutlinedIcon className="text-amber-400 shrink-0" fontSize="small" />
              <span>Transições de status atômicas e controle por perfil (Solicitante &amp; Financeiro)</span>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="relative z-10 text-xs text-slate-500 font-medium">
          Pluto Finance Portal • GEX Challenge 2026
        </div>
      </div>

      {/* Lado Direito: Formulário de Autenticação */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-slate-50/80">
        <LoginForm />
      </div>
    </main>
  );
}
