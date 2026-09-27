import React from 'react';
import { PlutoLogoProps } from './types';

export const PlutoLogo: React.FC<PlutoLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: { w: 24, h: 24, title: 'text-lg', subtitle: 'text-[9px]' },
    md: { w: 32, h: 32, title: 'text-xl', subtitle: 'text-[10px]' },
    lg: { w: 44, h: 44, title: 'text-3xl', subtitle: 'text-xs' },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Ícone de Ploutos - Cornucópia de Ouro e Abundância */}
      <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-sm shadow-amber-500/20 text-slate-950">
        <svg
          width={iconDimensions.w}
          height={iconDimensions.h}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-950 drop-shadow-sm"
        >
          {/* Coroa de Louros / Abundância de Ploutos */}
          <path d="M12 2v4" />
          <path d="M12 18v4" />
          <path d="m4.93 4.93 2.83 2.83" />
          <path d="m16.24 16.24 2.83 2.83" />
          <path d="M2 12h4" />
          <path d="M18 12h4" />
          <path d="m4.93 19.07 2.83-2.83" />
          <path d="m16.24 7.76 2.83-2.83" />
          <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.15" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-wider text-slate-900 ${iconDimensions.title}`}>
            PLUTO
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        </div>
        {showSubtitle && (
          <span className={`font-semibold tracking-widest text-slate-500 uppercase ${iconDimensions.subtitle}`}>
            Portal Financeiro
          </span>
        )}
      </div>
    </div>
  );
};

export default PlutoLogo;
