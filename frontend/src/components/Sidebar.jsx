import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  CheckSquare,
  Users,
  Sparkles,
  BarChart3,
  Activity,
  Settings,
  Shield,
  Building,
  PlusCircle,
  LogOut,
  X,
  Bot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const Sidebar = ({ isOpen, onClose, onOpenAssistant }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: t('nav.dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.incidents'), path: '/incidents', icon: AlertTriangle },
    { name: t('nav.tasks'), path: '/tasks', icon: CheckSquare },
    { name: t('nav.teams'), path: '/teams', icon: Users },
    { name: t('nav.insights'), path: '/insights', icon: Sparkles },
    { name: t('nav.analytics'), path: '/analytics', icon: BarChart3 },
    { name: t('nav.activity'), path: '/activity', icon: Activity },
    { name: t('nav.settings'), path: '/settings', icon: Settings },
  ];

  const adminLinks = [
    { name: t('nav.userManagement'), path: '/admin/users', icon: Shield },
    { name: t('nav.departments'), path: '/admin/departments', icon: Building },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#0B0F19] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div>
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800/80">
            <NavLink to="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-cyan-400 p-[1px] flex items-center justify-center shadow-glow-cyan">
                <div className="w-full h-full bg-[#0B0F19] rounded-[11px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  FLOWPILOT <span className="text-cyan-400 text-xs px-1 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40">AI</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Incident Manager</span>
              </div>
            </NavLink>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Button: Report Incident */}
          <div className="px-4 py-4">
            <button
              onClick={() => {
                navigate('/incidents/new');
                if (onClose) onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm text-slate-900 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 shadow-glow-cyan transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              {t('nav.reportIncident')}
            </button>
          </div>

          {/* Main Navigation Items */}
          <div className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-290px)]">
            <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t('nav.workspace')}
            </div>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}

            {/* Admin Links */}
            {user?.role === 'ADMIN' && (
              <>
                <div className="pt-4 px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t('nav.administration')}
                </div>
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.name}</span>
                    </NavLink>
                  );
                })}
              </>
            )}

            {/* AI Assistant Quick Trigger */}
            <div className="pt-2">
              <button
                onClick={() => {
                  if (onOpenAssistant) onOpenAssistant();
                  if (onClose) onClose();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-indigo-500/30 hover:border-indigo-500/60 hover:bg-slate-800/80 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Bot className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <span>{t('nav.aiCopilot')}</span>
                </div>
                <span className="px-1.5 py-0.5 text-[10px] rounded bg-indigo-500/20 text-indigo-300">Live</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer User Info & Logout */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.name || 'User'}`}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-full border border-slate-700 object-cover"
              />
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Anonymous'}</p>
                <p className="text-[10px] text-cyan-400 font-mono tracking-tight">{user?.role || 'EMPLOYEE'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title={t('nav.signOut')}
              aria-label={t('nav.signOut')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
