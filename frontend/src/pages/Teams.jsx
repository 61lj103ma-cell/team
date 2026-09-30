import React, { useState, useEffect } from 'react';
import { Users, Building, Shield, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const Teams = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        setLoading(true);
        const res = await api.get('/departments');
        setDepartments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepts();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          Enterprise Departments & Teams
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Workload allocation, active queue saturation, and operational team roster.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="p-5 rounded-2xl bg-[#111827]/90 border border-slate-800 shadow-card flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-800 text-cyan-400 border border-slate-700">
                      <Building className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {dept.name}
                    </h3>
                  </div>

                  {dept.criticalCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      <AlertTriangle className="w-3 h-3" />
                      {dept.criticalCount} Critical
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {dept.description || 'Enterprise operational business division.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Active Incidents: <span className="text-white font-mono font-bold">{dept.incidentCount || 0}</span>
                </span>
                <span className="text-slate-400">
                  Members: <span className="text-cyan-300 font-mono font-bold">{dept.memberCount || 4}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
