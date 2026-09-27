'use client';

import React from 'react';
import { PaginationProps } from './types';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  loading = false,
  className = '',
}) => {
  if (totalPages <= 1 && totalItems === 0) {
    return null;
  }

  const startItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  // Gerar páginas a exibir
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2 ${className}`}
    >
      {/* Texto de Intervalo de Registros */}
      <span className="text-xs text-slate-500 font-medium">
        Mostrando <strong className="text-slate-800">{startItem}</strong> a{' '}
        <strong className="text-slate-800">{endItem}</strong> de{' '}
        <strong className="text-slate-800">{totalItems}</strong> registros
      </span>

      {/* Controles de Navegação */}
      <div className="flex items-center gap-1.5">
        {/* Anterior */}
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || loading}
          data-testid="pagination-prev"
          aria-label="Página anterior"
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeftIcon fontSize="small" />
        </button>

        {/* Páginas */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) =>
            typeof p === 'number' ? (
              <button
                key={idx}
                type="button"
                onClick={() => onPageChange(p)}
                disabled={loading}
                data-testid={`pagination-page-${p}`}
                className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition-all ${
                  p === page
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ) : (
              <span key={idx} className="px-1 text-slate-400 text-xs">
                {p}
              </span>
            )
          )}
        </div>

        {/* Próximo */}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || loading}
          data-testid="pagination-next"
          aria-label="Próxima página"
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRightIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
