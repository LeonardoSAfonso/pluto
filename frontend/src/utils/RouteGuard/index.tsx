'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/api/auth.types';
import PlutoLogo from '@/components/ui/PlutoLogo';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
      router.replace('/dashboard');
      return;
    }

    setIsReady(true);
  }, [isAuthenticated, role, allowedRoles, router]);

  if (!isAuthenticated || !isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6">
        <PlutoLogo size="md" className="[&_span]:text-white animate-pulse" />
        <span className="mt-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Verificando permissões de acesso...
        </span>
      </div>
    );
  }

  return <>{children}</>;
};

export default RouteGuard;
