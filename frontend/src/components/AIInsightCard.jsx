import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

export const AIInsightCard = ({ insight, onActionClick }) => {
  const isCritical = insight.type === 'critical';
  const isWarning = insight.type === 'warning';

  let borderGlow = 'border-cyan-500/30 hover:border-cyan-500/50';
  let badgeColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
  let Icon = Sparkles;

  if (isCritical) {
    borderGlow = 'border-rose-500/30 hover:border-rose-500/60';
    badgeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    Icon = AlertTriangle;
  } else if (isWarning) {
    borderGlow = 'border-amber-500/30 hover:border-amber-500/60';
    badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    Icon = TrendingUp;
  }

  return (
    <div className={`relative p-5 rounded-2xl bg-[#111827]/90 backdrop-blur-md border ${borderGlow} transition-all duration-300 shadow-card flex flex-col justify-between group`}>
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
            <Icon className="w-3.5 h-3.5" />
            AI INSIGHT
          </span>
          {insight.trend && (
            <span className="text-xs font-medium text-slate-400 font-mono">
              {insight.trend}
            </span>
          )}
        </div>

        <h4 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
          {insight.title}
        </h4>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          {insight.description}
        </p>
      </div>

      {insight.recommendedFocus && (
        <div className="pt-3 border-t border-slate-800 flex items-start gap-2 text-xs text-slate-400">
          <span className="font-semibold text-cyan-400 shrink-0">Recommendation:</span>
          <span>{insight.recommendedFocus}</span>
        </div>
      )}
    </div>
  );
};
