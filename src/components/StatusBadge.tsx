import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const getStyles = (st: string) => {
    const s = st.toLowerCase().trim();
    if (s.includes('resolv') || s.includes('conclu')) {
      return 'text-emerald-400 font-medium';
    }
    if (s.includes('andamento') || s.includes('atendimento')) {
      return 'text-sky-400 font-medium';
    }
    if (s.includes('aguard')) {
      return 'text-amber-400 font-medium';
    }
    if (s.includes('pend')) {
      return 'text-red-400 font-medium';
    }
    if (s.includes('cancel')) {
      return 'text-slate-400 font-medium';
    }
    return 'text-slate-300 font-medium';
  };

  const getDotColor = (st: string) => {
    const s = st.toLowerCase().trim();
    if (s.includes('resolv') || s.includes('conclu')) return 'bg-emerald-500 shadow-sm shadow-emerald-500/50';
    if (s.includes('andamento') || s.includes('atendimento')) return 'bg-sky-500 shadow-sm shadow-sky-500/50';
    if (s.includes('aguard')) return 'bg-amber-500 shadow-sm shadow-amber-500/50';
    if (s.includes('pend')) return 'bg-red-500 shadow-sm shadow-red-500/50';
    return 'bg-slate-400';
  };

  const sizeClass = size === 'sm' ? 'text-[11px]' : size === 'lg' ? 'text-sm' : 'text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap ${getStyles(
        status
      )} ${sizeClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getDotColor(status)}`}></span>
      <span>{status}</span>
    </span>
  );
};

