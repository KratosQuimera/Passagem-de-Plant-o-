import React from 'react';

interface PriorityBadgeProps {
  priority: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md', className = '' }) => {
  const getStyles = (p: string) => {
    switch (p.toUpperCase()) {
      case 'P1':
        return 'bg-red-950/50 text-red-400 border-red-800/60 font-bold';
      case 'P2':
        return 'bg-orange-950/40 text-orange-400 border-orange-800/60 font-bold';
      case 'P3':
        return 'bg-amber-950/40 text-amber-400 border-amber-800/60 font-bold';
      case 'P4':
        return 'bg-slate-800 text-slate-400 border-slate-700 font-bold';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700 font-bold';
    }
  };

  const getSizeClasses = (s?: string) => {
    switch (s) {
      case 'sm':
        return 'text-[10px] px-2 py-0.5';
      case 'lg':
        return 'text-xs px-3 py-1';
      case 'md':
      default:
        return 'text-[11px] px-2.5 py-0.5';
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded border tracking-wider uppercase ${getStyles(
        priority
      )} ${getSizeClasses(size)} ${className}`}
    >
      {priority}
    </span>
  );
};

