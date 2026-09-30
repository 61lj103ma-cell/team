import React from 'react';
import { Link } from 'react-router-dom';
import { PriorityBadge } from './Badges';
import { User, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export const TaskTable = ({ tasks, onStatusChange }) => {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            <th className="py-3 px-4">Task Details</th>
            <th className="py-3 px-4">Priority</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Incident</th>
            <th className="py-3 px-4">Team / Dept</th>
            <th className="py-3 px-4">Assignee</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {tasks.map((task) => (
            <tr key={task._id} className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3.5 px-4">
                <div className={`font-semibold ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-white'}`}>
                  {task.title}
                </div>
                {task.description && (
                  <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">{task.description}</div>
                )}
              </td>
              <td className="py-3.5 px-4 whitespace-nowrap">
                <PriorityBadge priority={task.priority} />
              </td>
              <td className="py-3.5 px-4 whitespace-nowrap">
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
              </td>
              <td className="py-3.5 px-4 whitespace-nowrap">
                {task.incidentCode ? (
                  <Link
                    to={`/incidents/${task.incidentCode}`}
                    className="font-mono text-cyan-400 hover:text-cyan-300 hover:underline font-bold text-xs"
                  >
                    {task.incidentCode}
                  </Link>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className="py-3.5 px-4 whitespace-nowrap text-slate-300 text-xs">
                {task.assignedTeam || task.department}
              </td>
              <td className="py-3.5 px-4 whitespace-nowrap">
                {task.assignedUser ? (
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <img
                      src={task.assignedUser.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${task.assignedUser.name}`}
                      alt={task.assignedUser.name}
                      className="w-5 h-5 rounded-full object-cover border border-slate-700"
                    />
                    <span>{task.assignedUser.name.split(' ')[0]}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic text-xs">Unassigned</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
