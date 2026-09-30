import React from 'react';

export const LoadingSkeleton = ({ count = 4, type = 'card' }) => {
  if (type === 'table') {
    return (
      <div className="w-full bg-[#111827]/60 rounded-2xl border border-slate-800 p-4 space-y-4 animate-pulse">
        <div className="h-8 bg-slate-800 rounded-lg w-1/3 mb-4"></div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-slate-800/60">
            <div className="h-4 bg-slate-800 rounded w-16"></div>
            <div className="h-4 bg-slate-800 rounded flex-1 max-w-sm"></div>
            <div className="h-5 bg-slate-800 rounded w-20"></div>
            <div className="h-5 bg-slate-800 rounded w-14"></div>
            <div className="h-4 bg-slate-800 rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-32 rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div className="h-3 bg-slate-800 rounded w-24"></div>
            <div className="h-8 w-8 bg-slate-800 rounded-lg"></div>
          </div>
          <div className="h-8 bg-slate-800 rounded w-16"></div>
          <div className="h-2.5 bg-slate-800 rounded w-32"></div>
        </div>
      ))}
    </div>
  );
};
