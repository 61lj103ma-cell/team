export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const timeAgo = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString);
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(dateString);
};

export const getSeverityClass = (severity) => {
  switch (severity) {
    case 'Critical':
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    case 'High':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    case 'Medium':
      return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
    case 'Low':
    default:
      return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  }
};

export const getPriorityClass = (priority) => {
  switch (priority) {
    case 'P1':
      return 'bg-rose-950/60 text-rose-300 border border-rose-500/30';
    case 'P2':
      return 'bg-amber-950/60 text-amber-300 border border-amber-500/30';
    case 'P3':
      return 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30';
    case 'P4':
    default:
      return 'bg-slate-800/80 text-slate-400 border border-slate-700';
  }
};

export const getStatusClass = (status) => {
  switch (status) {
    case 'Open':
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    case 'Investigating':
      return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
    case 'In Progress':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    case 'Monitoring':
      return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
    case 'Resolved':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'Closed':
      return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  }
};
