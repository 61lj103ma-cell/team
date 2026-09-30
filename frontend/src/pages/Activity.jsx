import React, { useState, useEffect } from 'react';
import { Activity as ActivityIcon, RefreshCw, Filter, Clock } from 'lucide-react';
import api from '../services/api';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const Activity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/dashboard');
      setActivities(res.data.recentActivities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            Operational Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Chronological audit log recording incident creation, AI analysis verification, task handoffs, and status changes.
          </p>
        </div>

        <button
          onClick={fetchActivities}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Refresh audit activity"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="rounded-3xl bg-[#111827]/90 border border-slate-800 p-6 sm:p-8 shadow-card">
        {loading ? (
          <LoadingSkeleton count={5} />
        ) : (
          <ActivityTimeline activities={activities} />
        )}
      </div>
    </div>
  );
};
