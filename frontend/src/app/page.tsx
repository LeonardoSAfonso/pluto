'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PlutoLogo from '@/components/ui/PlutoLogo';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('gex-user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user && user.token) {
          router.replace('/dashboard');
          return;
        }
      }
    } catch {
      // ignore
    }
    router.replace('/auth/login');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6">
      <PlutoLogo size="lg" className="[&_span]:text-white animate-pulse" />
      <p className="mt-4 text-xs tracking-widest text-slate-400 uppercase">
        Carregando portal financeiro...
      </p>
    </div>
  );
}
