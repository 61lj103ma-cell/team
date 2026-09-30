import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({ title, value, unit = '', icon: Icon, trend, trendType = 'up', description, accentColor = 'cyan' }) => {
  const colorMap = {
    cyan: 'from-cyan-500/10 to-transparent border-cyan-500/30 text-cyan-400',
    rose: 'from-rose-500/10 to-transparent border-rose-500/30 text-rose-400',
    amber: 'from-amber-500/10 to-transparent border-amber-500/30 text-amber-400',
    emerald: 'from-emerald-500/10 to-transparent border-emerald-500/30 text-emerald-400',
    purple: 'from-purple-500/10 to-transparent border-purple-500/30 text-purple-400',
  };

  const accentClass = colorMap[accentColor] || colorMap.cyan;

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-[#111827]/80 backdrop-blur-md border border-slate-800 p-5 hover:border-slate-700 transition-all duration-300 shadow-card">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${accentClass} opacity-50 blur-2xl pointer-events-none group-hover:opacity-80 transition-opacity`}></div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 ${accentClass.split(' ').pop()}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-white tracking-tight">{value}</span>
        {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        {trend && (
          <span className={`inline-flex items-center gap-1 font-semibold ${trendType === 'down' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trendType === 'down' ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
            {trend}
          </span>
        )}
        {description && <span className="text-slate-400 truncate">{description}</span>}
      </div>
    </div>
  );
};
