import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  PlusCircle,
  Filter,
  Search,
  LayoutGrid,
  List,
  RefreshCw,
  X,
  Clock,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import { TaskTable } from '../components/TaskTable';
import { TaskCard } from '../components/TaskCard';
import { Pagination } from '../components/Pagination';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import { useLanguage } from '../context/LanguageContext';

export const Tasks = () => {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'P2',
    department: 'IT',
    assignedTeam: 'Backend Team',
  });

  const debouncedSearch = useDebounce(searchTerm, 350);
  const { showToast } = useToast();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 18 });
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (departmentFilter !== 'all') params.append('department', departmentFilter);

      const res = await api.get(`/tasks?${params.toString()}`);
      setTasks(res.data);
      setTotalPages(res.pages);
      setTotalCount(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, debouncedSearch, statusFilter, priorityFilter, departmentFilter]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      showToast('Task updated', 'success');
      fetchTasks();
    } catch (err) {
      showToast(err.message || 'Failed to update task', 'error');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      await api.post('/tasks', newTask);
      showToast('Operational task created', 'success');
      setShowCreateModal(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'P2',
        department: 'IT',
        assignedTeam: 'Backend Team',
      });
      fetchTasks();
    } catch (err) {
      showToast(err.message || 'Creation failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            {t('tasks.title')}
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
              {totalCount} {t('tasks.activeCount')}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('tasks.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
              title={t('tasks.cardGrid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
              title={t('tasks.tableView')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={fetchTasks}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title={t('tasks.refresh')}
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 shadow-glow-cyan transition-all"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            {t('tasks.createTask')}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#111827]/80 border border-slate-800 shadow-card flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('tasks.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-400 outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-36 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 outline-none cursor-pointer"
        >
          <option value="all">{t('tasks.allStatuses')}</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="w-full md:w-32 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 outline-none cursor-pointer"
        >
          <option value="all">{t('tasks.allPriorities')}</option>
          <option value="P1">P1 - Immediate</option>
          <option value="P2">P2 - Urgent</option>
          <option value="P3">P3 - Normal</option>
          <option value="P4">P4 - Low</option>
        </select>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="w-full md:w-36 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 outline-none cursor-pointer"
        >
          <option value="all">{t('tasks.allDepartments')}</option>
          <option value="IT">IT</option>
          <option value="Finance">Finance</option>
          <option value="Operations">Operations</option>
          <option value="HR">HR</option>
          <option value="Security">Security</option>
        </select>
      </div>

      {/* Task Content */}
      <div className="rounded-2xl bg-[#111827]/80 border border-slate-800 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton count={6} />
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No tasks found"
            description="All operational tasks have either been completed or none match your filters."
            actionLabel="Create New Task"
            onAction={() => setShowCreateModal(true)}
          />
        ) : viewMode === 'table' ? (
          <div>
            <TaskTable tasks={tasks} onStatusChange={handleStatusChange} />
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        ) : (
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <TaskCard key={task._id} task={task} onStatusChange={handleStatusChange} />
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Operational Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Inspect connection pool saturation"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Provide context, debug URLs, or instructions..."
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
              >
                <option value="P1">P1 - Immediate</option>
                <option value="P2">P2 - Urgent</option>
                <option value="P3">P3 - Standard</option>
                <option value="P4">P4 - Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
              <select
                value={newTask.department}
                onChange={(e) => setNewTask({ ...newTask, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none"
              >
                <option value="IT">IT</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="HR">HR</option>
                <option value="Security">Security</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
            >
              Create Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
