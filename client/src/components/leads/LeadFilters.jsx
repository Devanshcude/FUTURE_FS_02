import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { STATUS_OPTIONS, SOURCE_OPTIONS, PRIORITY_OPTIONS } from '../../utils/helpers';

export default function LeadFilters({ filters, onFilterChange, onReset }) {
  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.source ||
    filters.priority ||
    filters.startDate ||
    filters.endDate;

  return (
    <div className="glass-card p-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal size={15} className="text-accent" />
        <span className="text-sm font-medium text-text-muted">Filters</span>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="ml-auto flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <X size={12} />
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Search */}
        <div className="relative xl:col-span-2">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint"
          />
          <input
            type="text"
            placeholder="Search by name, email, company..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="input-field pl-9 text-sm"
          />
        </div>

        {/* Status */}
        <select
          value={filters.status || ''}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="input-field text-sm appearance-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Source */}
        <select
          value={filters.source || ''}
          onChange={(e) => onFilterChange('source', e.target.value)}
          className="input-field text-sm appearance-none cursor-pointer"
        >
          <option value="">All Sources</option>
          {SOURCE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Priority */}
        <select
          value={filters.priority || ''}
          onChange={(e) => onFilterChange('priority', e.target.value)}
          className="input-field text-sm appearance-none cursor-pointer"
        >
          <option value="">All Priorities</option>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        {/* Date range */}
        <div className="flex gap-2">
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => onFilterChange('startDate', e.target.value)}
            className="input-field text-sm flex-1 min-w-0"
            title="From date"
          />
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => onFilterChange('endDate', e.target.value)}
            className="input-field text-sm flex-1 min-w-0"
            title="To date"
          />
        </div>
      </div>
    </div>
  );
}
