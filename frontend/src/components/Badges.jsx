import React from 'react';
import { Sparkles, AlertCircle, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getSeverityClass, getPriorityClass, getStatusClass } from '../utils/formatters';

export const SeverityBadge = ({ severity, size = 'sm' }) => {
  const baseClass = getSeverityClass(severity);
  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${baseClass} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${severity === 'Critical' ? 'bg-rose-400 animate-ping' : severity === 'High' ? 'bg-amber-400' : severity === 'Medium' ? 'bg-cyan-400' : 'bg-slate-400'}`}></span>
      {severity}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const baseClass = getPriorityClass(priority);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold tracking-wide ${baseClass}`}>
      {priority}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const baseClass = getStatusClass(status);
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${baseClass}`}>
      {status === 'Resolved' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
      {status === 'Investigating' && <Clock className="w-3 h-3 text-purple-400 animate-spin" />}
      {status === 'In Progress' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
      {status}
    </span>
  );
};

export const DepartmentBadge = ({ department }) => {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
      {department || 'Unassigned'}
    </span>
  );
};

export const AISuggestedBadge = ({ text = 'AI Suggested' }) => {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40">
      <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
      {text}
    </span>
  );
};
