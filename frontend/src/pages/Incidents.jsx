import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  PlusCircle,
  Filter,
  Search,
  LayoutGrid,
  List,
  RefreshCw,
  Download,
  X
} from 'lucide-react';
import api from '../services/api';
import { IncidentTable } from '../components/IncidentTable';
import { IncidentCard } from '../components/IncidentCard';
import { Pagination } from '../components/Pagination';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { useDebounce } from '../hooks/useDebounce';
import { useLanguage } from '../context/LanguageContext';

export const Incidents = () => {
  const { t } = useLanguage();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const debouncedSearch = useDebounce(searchTerm, 350);
  const navigate = useNavigate();

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 15,
      });

      if (debouncedSearch) params.append('search', debouncedSearch);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (severityFilter !== 'all') params.append('severity', severityFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (departmentFilter !== 'all') params.append('department', departmentFilter);

      const res = await api.get(`/incidents?${params.toString()}`);
      setIncidents(res.data);
      setTotalPages(res.pages);
      setTotalCount(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [page, debouncedSearch, statusFilter, severityFilter, priorityFilter, departmentFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSeverityFilter('all');
    setPriorityFilter('all');
    setDepartmentFilter('all');
    setPage(1);
  };

  const hasActiveFilters =
    searchTerm || statusFilter !== 'all' || severityFilter !== 'all' || priorityFilter !== 'all' || departmentFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            {t('incidents.title')}
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
              {totalCount} Total
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('incidents.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle View */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={fetchIncidents}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh incident list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/incidents/new')}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 shadow-glow-cyan transition-all"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            {t('incidents.reportNew')}
          </button>
        </div>
      </div>

      {/* Multi-Parameter Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#111827]/80 border border-slate-800 shadow-card space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('incidents.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-xs sm:text-sm text-white placeholder-slate-400 outline-none"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-36 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">{t('incidents.allSeverities')}</option>
            <option value="Critical">{t('common.critical')}</option>
            <option value="High">{t('common.high')}</option>
            <option value="Medium">{t('common.medium')}</option>
            <option value="Low">{t('common.low')}</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-32 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">{t('incidents.allPriorities')}</option>
            <option value="P1">P1 - Immediate</option>
            <option value="P2">P2 - High</option>
            <option value="P3">P3 - Normal</option>
            <option value="P4">P4 - Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-36 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">{t('incidents.allStatuses')}</option>
            <option value="Open">{t('common.open')}</option>
            <option value="Investigating">{t('common.investigating')}</option>
            <option value="In Progress">{t('common.inProgress')}</option>
            <option value="Monitoring">{t('common.monitoring')}</option>
            <option value="Resolved">{t('common.resolved')}</option>
            <option value="Closed">{t('common.closed')}</option>
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-40 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">{t('incidents.allDepartments')}</option>
            <option value="IT">IT</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
            <option value="HR">HR</option>
            <option value="Sales">Sales</option>
            <option value="Customer Support">Customer Support</option>
            <option value="Security">Security</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors whitespace-nowrap"
            >
              <X className="w-3.5 h-3.5" />
              {t('incidents.resetFilters')}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="rounded-2xl bg-[#111827]/80 border border-slate-800 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton count={6} type="table" />
          </div>
        ) : incidents.length === 0 ? (
          <EmptyState
            title="No incidents found"
            description={hasActiveFilters ? "Try relaxing your search terms or filters." : "No incidents reported yet."}
            actionLabel="Report New Incident"
            onAction={() => navigate('/incidents/new')}
          />
        ) : viewMode === 'table' ? (
          <div>
            <IncidentTable incidents={incidents} />
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        ) : (
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {incidents.map((inc) => (
                <IncidentCard key={inc._id} incident={inc} />
              ))}
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
