import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SeverityBadge, PriorityBadge, StatusBadge, DepartmentBadge } from './Badges';
import { timeAgo } from '../utils/formatters';
import { ArrowRight, User } from 'lucide-react';

export const IncidentTable = ({ incidents }) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            <th className="py-3 px-4">ID</th>
            <th className="py-3 px-4">Title & Service</th>
            <th className="py-3 px-4">Severity</th>
            <th className="py-3 px-4">Priority</th>
            <th className="py-3 px-4">Department</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Assignee</th>
            <th className="py-3 px-4 text-right">Reported</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {incidents.map((inc) => (
            <tr
              key={inc._id}
              onClick={() => navigate(`/incidents/${inc.incidentId}`)}
              className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
            >
              <td className="py-3.5 px-4 font-mono font-bold text-cyan-400 whitespace-nowrap">
                {inc.incidentId}
              </td>
              <td className="py-3.5 px-4">
                <div className="font-semibold text-white group-hover:text-cyan-200 transition-colors line-clamp-1">
                  {inc.title}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {inc.service || 'Internal System'} &bull; {inc.environment}
                </div>
              </td>
              <td className="py-3.5 px-4 whitespace-nowrap">
                <SeverityBadge severity={inc.severity} />
              </td>
              <td className="py-3.5 px-4 whitespace-nowrap">
                <PriorityBadge priority={inc.priority} />
              </td>
              <td className="py-3.5 px-4 whitespace-nowrap">
                <DepartmentBadge department={inc.department} />
              </td>
              <td className="py-3.5 px-4 whitespace-nowrap">
                <StatusBadge status={inc.status} />
              </td>
              <td className="py-3.5 px-4 whitespace-nowrap">
                {inc.assignedUser ? (
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <img
                      src={inc.assignedUser.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${inc.assignedUser.name}`}
                      alt={inc.assignedUser.name}
                      className="w-5 h-5 rounded-full object-cover border border-slate-700"
                    />
                    <span className="truncate max-w-[100px]">{inc.assignedUser.name.split(' ')[0]}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic text-xs">Unassigned</span>
                )}
              </td>
              <td className="py-3.5 px-4 text-right text-slate-400 whitespace-nowrap font-mono text-xs">
                {timeAgo(inc.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
