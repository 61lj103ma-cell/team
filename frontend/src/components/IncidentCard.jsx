import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, ArrowRight } from 'lucide-react';
import { SeverityBadge, PriorityBadge, StatusBadge, DepartmentBadge } from './Badges';
import { timeAgo } from '../utils/formatters';

export const IncidentCard = ({ incident }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/incidents/${incident.incidentId}`)}
      className="p-4 rounded-2xl bg-[#111827]/80 hover:bg-[#151d30] border border-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer shadow-sm group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
              {incident.incidentId}
            </span>
            <PriorityBadge priority={incident.priority} />
          </div>
          <SeverityBadge severity={incident.severity} size="xs" />
        </div>

        <h4 className="text-sm font-bold text-white line-clamp-2 mb-2 group-hover:text-cyan-200 transition-colors">
          {incident.title}
        </h4>

        <p className="text-xs text-slate-400 line-clamp-2 mb-3">
          {incident.description}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <StatusBadge status={incident.status} />
          <DepartmentBadge department={incident.department} />
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
          <Clock className="w-3 h-3" />
          <span>{timeAgo(incident.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};
