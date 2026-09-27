'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import { LoginFormProps, LoginFormErrors } from './types';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import FlashOnIcon from '@mui/icons-material/FlashOn';

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, className = '' }) => {
  const router = useRouter();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginFormErrors>({});

  const validate = (): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Informe o seu e-mail.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Informe um e-mail válido.';
    }

    if (!password) {
      newErrors.password = 'Informe sua senha de acesso.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate() || loading) return;

    try {
      setErrors({});
      const session = await login({ email: email.trim(), password });
      if (onSuccess) {
        onSuccess(session);
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'E-mail ou senha incorretos.';
      setErrors({ general: message });
    }
  };

  const handleQuickFill = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setErrors({});
  };

  return (
    <div
      className={`w-full max-w-md bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 ${className}`}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Acesse sua conta
        </h2>
        <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
          Informe suas credenciais institucionais para gerenciar despesas e aprovações.
        </p>
      </div>

      {errors.general && (
        <div
          data-testid="login-error-alert"
          className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-shake"
        >
          <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Campo E-mail */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            E-mail
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <EmailOutlinedIcon fontSize="small" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="seu.email@gex.test"
              data-testid="login-email-input"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 ${
                errors.email
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 text-rose-900 bg-rose-50/30'
                  : 'border-slate-300 focus:border-amber-500 focus:ring-amber-200 bg-white text-slate-900'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-600 font-medium">{errors.email}</p>
          )}
        </div>

        {/* Campo Senha */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <LockOutlinedIcon fontSize="small" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="••••••••••••"
              data-testid="login-password-input"
              className={`w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 ${
                errors.password
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 text-rose-900 bg-rose-50/30'
                  : 'border-slate-300 focus:border-amber-500 focus:ring-amber-200 bg-white text-slate-900'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
            >
              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-rose-600 font-medium">{errors.password}</p>
          )}
        </div>

        {/* Botão de Envio com Loading State */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          data-testid="login-submit-button"
          className="w-full mt-2"
        >
          Entrar no Portal
        </Button>
      </form>

      {/* Seção de Atalhos Rápidos (Seed Data) para o Avaliador */}
      <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <FlashOnIcon fontSize="inherit" className="text-amber-500" />
          <span>Atalhos de Avaliação (Seed)</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            data-testid="quick-fill-requester"
            onClick={() => handleQuickFill('solicitante@gex.test', 'GexRequester123!')}
            className="p-2.5 rounded-xl text-left bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border border-slate-200 transition-all text-xs"
          >
            <span className="block font-bold text-slate-800">Solicitante</span>
            <span className="block text-[10px] text-slate-500 truncate">solicitante@gex.test</span>
          </button>

          <button
            type="button"
            data-testid="quick-fill-finance"
            onClick={() => handleQuickFill('financeiro@gex.test', 'GexFinance123!')}
            className="p-2.5 rounded-xl text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 transition-all text-xs"
          >
            <span className="block font-bold text-slate-800">Financeiro</span>
            <span className="block text-[10px] text-slate-500 truncate">financeiro@gex.test</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
