import React, { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    icon: Icon,
    className = '',
    containerClassName = '',
    type = 'text',
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
        {Icon && (
          <Icon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint"
          />
        )}
        <input
          ref={ref}
          type={type}
          className={`input-field ${Icon ? 'pl-9' : ''} ${
            error ? 'input-field-error' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">{error}</p>
      )}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, error, className = '', containerClassName = '', required, rows = 4, ...props },
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
      <textarea
        ref={ref}
        rows={rows}
        className={`input-field resize-none ${error ? 'input-field-error' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
});

export default Input;
