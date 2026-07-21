import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(function Select(
  {
    label,
    options = [],
    error,
    className = '',
    containerClassName = '',
    placeholder = 'Select...',
    required,
    ...props
  },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-text-muted">
          {label}
          {required && <span className="text-accent ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`input-field appearance-none pr-9 cursor-pointer ${
            error ? 'input-field-error' : ''
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" className="bg-surface text-text-faint">
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const value = typeof opt === 'string' ? opt : opt.value;
            const label = typeof opt === 'string' ? opt : opt.label;
            return (
              <option key={value} value={value} className="bg-surface text-text-primary">
                {label}
              </option>
            );
          })}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none"
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
});

export default Select;
