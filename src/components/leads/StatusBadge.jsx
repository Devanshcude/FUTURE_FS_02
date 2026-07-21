import React from 'react';
import { getStatusClass } from '../../utils/helpers';
import { STATUS_OPTIONS } from '../../utils/helpers';

export default function StatusBadge({ status, editable = false, onStatusChange, loading = false }) {
  if (!editable) {
    return (
      <span className={`status-badge ${getStatusClass(status)}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {status}
      </span>
    );
  }

  return (
    <div className="relative">
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        disabled={loading}
        className={`status-badge ${getStatusClass(status)} border-0 cursor-pointer appearance-none pr-1 bg-transparent font-semibold text-xs`}
        style={{ outline: 'none' }}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s} className="bg-surface text-text-primary text-xs">
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
