import React from 'react';

export default function Skeleton({ width = '100%', height = 16, className = '', style = {} }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, ...style }}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton width={48} height={48} style={{ borderRadius: '50%' }} />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton height={16} width="60%" />
          <Skeleton height={12} width="40%" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 6 }) {
  return (
    <div className="table-container">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-border">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} height={14} width={`${100 / cols}%`} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, ri) => (
        <div key={ri} className="flex gap-4 p-4 border-b border-surface2 items-center">
          {Array.from({ length: cols }).map((_, ci) => (
            <Skeleton
              key={ci}
              height={14}
              width={ci === 0 ? '15%' : `${85 / (cols - 1)}%`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonKPI() {
  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col gap-2">
          <Skeleton height={12} width={80} />
          <Skeleton height={32} width={60} />
          <Skeleton height={12} width={100} />
        </div>
        <Skeleton width={48} height={48} style={{ borderRadius: '12px' }} />
      </div>
    </div>
  );
}
