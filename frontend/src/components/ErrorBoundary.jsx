import React from 'react';
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('FlowPilot UI Runtime Error:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4 shadow-lg shadow-rose-950/40">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-slate-400 text-sm max-w-md mb-4">
            An unexpected error occurred while rendering the application interface.
          </p>
          {this.state.error && (
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-mono text-rose-300 max-w-lg overflow-x-auto mb-6 text-left">
              {this.state.error.message || String(this.state.error)}
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-200 flex items-center gap-2 transition-colors border border-slate-700"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Application
            </button>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 text-sm font-semibold flex items-center gap-2 transition-all shadow-glow-cyan"
            >
              <LogIn className="w-4 h-4" />
              Reset Cache & Login
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
