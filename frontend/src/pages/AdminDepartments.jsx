import React, { useState, useEffect } from 'react';
import { Building, PlusCircle, RefreshCw, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/Modal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const { showToast } = useToast();

  const fetchDepts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    try {
      await api.post('/departments', form);
      showToast('Department registered', 'success');
      setShowModal(false);
      setForm({ name: '', description: '' });
      fetchDepts();
    } catch (err) {
      showToast(err.message || 'Creation failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            Admin: Department Units
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure enterprise divisions and incident routing targets.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 py-2 px-4 rounded-xl font-semibold text-xs text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-glow-cyan"
        >
          <PlusCircle className="w-4 h-4" />
          Add Department
        </button>
      </div>

      <div className="rounded-3xl bg-[#111827]/90 border border-slate-800 p-6 shadow-card">
        {loading ? (
          <LoadingSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept) => (
              <div
                key={dept._id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">{dept.name}</h3>
                  <p className="text-xs text-slate-400">{dept.description || 'No description provided.'}</p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Assigned Members: {dept.memberCount || 4}</span>
                  <span className="text-cyan-400">{dept.incidentCount || 0} Incidents</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Department Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Enterprise Department">
        <form onSubmit={handleCreate} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Department Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Legal & Compliance"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Operational responsibilities and scope..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300"
            >
              Save Department
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
