import React, { useState, useEffect } from 'react';
import { Shield, User, RefreshCw, Trash2, Edit } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      showToast('User role updated', 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            Admin: User Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage enterprise personnel access and role authorizations (Admin, Manager, Engineer, Employee).
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="rounded-3xl bg-[#111827]/90 border border-slate-800 p-6 shadow-card overflow-x-auto">
        {loading ? (
          <LoadingSkeleton count={4} type="table" />
        ) : (
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Role Authorization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-800/40">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.name}`}
                        alt={u.name}
                        className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                      />
                      <span className="font-semibold text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{u.email}</td>
                  <td className="py-3.5 px-4 text-slate-300">{u.department}</td>
                  <td className="py-3.5 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-cyan-300 outline-none cursor-pointer"
                    >
                      <option value="EMPLOYEE">EMPLOYEE</option>
                      <option value="ENGINEER">ENGINEER</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
