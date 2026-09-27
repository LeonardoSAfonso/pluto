'use client';

import React, { useState, useEffect } from 'react';
import { FilterBarProps } from './types';
import { RequestStatus } from '@/components/ui/StatusBadge/types';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalResults,
  loading = false,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.supplier_name || '');

  // Debounce de 300ms para busca por fornecedor
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (filters.supplier_name || '')) {
        onFilterChange({ supplier_name: searchTerm });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, filters.supplier_name, onFilterChange]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as RequestStatus | 'ALL';
    onFilterChange({ status: value });
  };

  const handleDateChange = (
    field: 'due_date_from' | 'due_date_to',
    value: string
  ) => {
    onFilterChange({ [field]: value || undefined });
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(filters.status && filters.status !== 'ALL') ||
    Boolean(filters.due_date_from) ||
    Boolean(filters.due_date_to);

  return (
    <div
      className={`p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 ${className}`}
    >
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Busca por Fornecedor (com Debounce) */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <SearchIcon fontSize="small" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome do fornecedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="filter-supplier-input"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 bg-white text-slate-900 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filtros em Linha: Status e Período */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          {/* Select de Status */}
          <div className="relative min-w-[170px] w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <FilterListIcon fontSize="small" />
            </div>
            <select
              value={filters.status || 'ALL'}
              onChange={handleStatusChange}
              data-testid="filter-status-select"
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 appearance-none cursor-pointer transition-all"
            >
              <option value="ALL">Todos os status</option>
              <option value="PENDING">Pendente (PENDING)</option>
              <option value="APPROVED">Aprovado (APPROVED)</option>
              <option value="PAID">Pago (PAID)</option>
              <option value="REJECTED">Rejeitado (REJECTED)</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <span className="text-xs">▼</span>
            </div>
          </div>

          {/* Vencimento De */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-medium shrink-0">De:</span>
            <input
              type="date"
              value={filters.due_date_from || ''}
              onChange={(e) => handleDateChange('due_date_from', e.target.value)}
              data-testid="filter-date-from"
              title="Vencimento a partir de"
              className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500"
            />
          </div>

          {/* Vencimento Até */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-medium shrink-0">Até:</span>
            <input
              type="date"
              value={filters.due_date_to || ''}
              onChange={(e) => handleDateChange('due_date_to', e.target.value)}
              data-testid="filter-date-to"
              title="Vencimento até"
              className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500"
            />
          </div>

          {/* Botão Limpar Filtros */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                onReset();
              }}
              data-testid="filter-reset-button"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors shrink-0"
            >
              <RestartAltIcon fontSize="small" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Indicador de Resultados */}
      {totalResults !== undefined && (
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            {loading ? (
              <span className="animate-pulse">Atualizando resultados...</span>
            ) : (
              <>
                Total encontrado:{' '}
                <strong className="text-slate-800 font-semibold">{totalResults}</strong>{' '}
                {totalResults === 1 ? 'solicitação' : 'solicitações'}
              </>
            )}
          </span>

          {hasActiveFilters && (
            <span className="text-amber-700 font-medium text-[11px]">
              * Filtros ativos aplicados
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
