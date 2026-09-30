import React from 'react';
import { PriorityBadge } from './Badges';
import { CheckCircle2, Clock, AlertCircle, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TaskCard = ({ task, onStatusChange }) => {
  const isCompleted = task.status === 'Completed';

  return (
    <div className={`p-4 rounded-2xl bg-slate-900/90 border transition-all duration-200 shadow-sm ${
      isCompleted ? 'border-emerald-500/20 bg-slate-950/40 opacity-75' : 'border-slate-800 hover:border-slate-700'
    }`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={task.priority} />
          {task.incidentCode && (
            <Link
              to={`/incidents/${task.incidentCode}`}
              className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-0.5"
            >
              {task.incidentCode}
            </Link>
          )}
        </div>
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          className={`text-xs font-semibold px-2 py-1 rounded-lg border outline-none bg-slate-950 cursor-pointer ${
            task.status === 'Completed'
              ? 'text-emerald-400 border-emerald-500/30'
              : task.status === 'In Progress'
              ? 'text-amber-400 border-amber-500/30'
              : 'text-slate-300 border-slate-700'
          }`}
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <h4 className={`text-sm font-bold mb-1.5 ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
        {task.title}
      </h4>

      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3">{task.description}</p>
      )}

      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="font-medium text-slate-400">{task.assignedTeam || task.department}</span>
        {task.assignedUser ? (
          <span className="text-slate-300 flex items-center gap-1">
            <User className="w-3 h-3 text-cyan-400" />
            {task.assignedUser.name.split(' ')[0]}
          </span>
        ) : (
          <span className="italic text-slate-400">Unassigned</span>
        )}
      </div>
    </div>
  );
};
