import React from 'react';
import { AlertCircle, PlusCircle } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = AlertCircle,
  title = 'No records found',
  description = 'There are no active records matching your criteria.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800/80">
      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-400 mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-glow-cyan"
        >
          <PlusCircle className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
