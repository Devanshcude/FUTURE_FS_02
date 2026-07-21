import React from 'react';
import { getStatusClass, getPriorityClass } from '../../utils/helpers';

export default function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const baseClass = 'status-badge';

  const variantClass = (() => {
    if (variant === 'status') return getStatusClass(children);
    if (variant === 'priority') return getPriorityClass(children);
    if (variant === 'source')
      return 'bg-surface2 text-text-muted border border-border text-xs font-medium';
    return 'bg-surface2 text-text-muted border border-border';
  })();

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : '';

  return (
    <span className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}>
      {children}
    </span>
  );
}
