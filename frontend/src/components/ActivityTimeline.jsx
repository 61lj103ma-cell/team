import React from 'react';
import { Activity as ActivityIcon, CheckCircle2, AlertCircle, Clock, User, ArrowRight } from 'lucide-react';
import { timeAgo } from '../utils/formatters';
import { Link } from 'react-router-dom';

export const ActivityTimeline = ({ activities = [] }) => {
  if (activities.length === 0) {
    return <div className="text-center py-6 text-xs text-slate-400">No activity recorded yet</div>;
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
      {activities.map((act, index) => {
        let dotColor = 'bg-cyan-500 ring-cyan-500/20';
        if (act.action?.toLowerCase().includes('resolved')) {
          dotColor = 'bg-emerald-500 ring-emerald-500/20';
        } else if (act.action?.toLowerCase().includes('critical')) {
          dotColor = 'bg-rose-500 ring-rose-500/20';
        } else if (act.action?.toLowerCase().includes('created')) {
          dotColor = 'bg-indigo-500 ring-indigo-500/20';
        }

        return (
          <div key={act._id || index} className="relative group">
            {/* Timeline node */}
            <span
              className={`absolute -left-[23px] top-1.5 w-3 h-3 rounded-full ring-4 ${dotColor} transition-transform group-hover:scale-125`}
            />

            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-200">
                  {act.userName || act.user?.name || 'System'}
                </span>
                <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                  {timeAgo(act.createdAt)}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {act.action}
              </p>

              {act.incidentCode && (
                <div className="mt-1.5">
                  <Link
                    to={`/incidents/${act.incidentCode}`}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300"
                  >
                    <span>{act.incidentCode}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
