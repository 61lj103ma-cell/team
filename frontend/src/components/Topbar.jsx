import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  User as UserIcon,
  LogOut,
  Settings,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Globe,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useDebounce } from '../hooks/useDebounce';
import api from '../services/api';
import { timeAgo } from '../utils/formatters';

export const Topbar = ({ onToggleSidebar, onOpenAssistant }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t, availableLanguages, currentLanguageInfo } = useLanguage();
  const navigate = useNavigate();

  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const searchContainerRef = useRef(null);

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Language Dropdown State
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langMenuRef = useRef(null);

  // User Dropdown State
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      // Ignore background notification fetch errors
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Global Search API call
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearch.trim()) {
        setSearchResults(null);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(debouncedSearch)}`);
        setSearchResults(res.data);
        setShowSearchDropdown(true);
      } catch (err) {
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearch]);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setShowLangMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div ref={searchContainerRef} className="relative w-full">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('topbar.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (searchResults) setShowSearchDropdown(true);
              }}
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 text-sm text-slate-100 placeholder-slate-400 outline-none transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSearchResults(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {showSearchDropdown && searchResults && (
            <div className="absolute left-0 right-0 mt-2 p-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto">
              {searchResults.incidents?.length === 0 && searchResults.tasks?.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">
                  No matching records found for "{searchTerm}"
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.incidents?.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">
                        Incidents
                      </div>
                      {searchResults.incidents.map((inc) => (
                        <div
                          key={inc._id}
                          onClick={() => {
                            navigate(`/incidents/${inc.incidentId}`);
                            setShowSearchDropdown(false);
                            setSearchTerm('');
                          }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-cyan-400">{inc.incidentId}</span>
                            <span className="text-slate-200 font-medium truncate max-w-xs">{inc.title}</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {inc.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.tasks?.length > 0 && (
                    <div className="border-t border-slate-800 pt-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">
                        Tasks
                      </div>
                      {searchResults.tasks.map((task) => (
                        <div
                          key={task._id}
                          onClick={() => {
                            navigate('/tasks');
                            setShowSearchDropdown(false);
                            setSearchTerm('');
                          }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 cursor-pointer text-xs"
                        >
                          <span className="text-slate-200 truncate">{task.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{task.priority}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: AI Copilot Button + Language Selector + Notifications + Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* AI Assistant Quick Pill */}
        <button
          onClick={onOpenAssistant}
          className="hidden sm:flex items-center gap-2 py-1.5 px-3 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 hover:border-indigo-500/60 text-indigo-300 hover:text-white text-xs font-semibold shadow-glow-indigo transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{t('topbar.askAI')}</span>
        </button>

        {/* Multi-Language Dropdown Selector */}
        <div ref={langMenuRef} className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white text-xs font-medium transition-all"
            title="Switch Language"
            aria-label="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-sm leading-none">{currentLanguageInfo.flag}</span>
            <span className="hidden md:inline uppercase text-[11px] font-mono font-bold">{currentLanguageInfo.code}</span>
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 mb-1">
                Select Language
              </div>
              {availableLanguages.map((lang) => {
                const isActive = lang.code === language;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{lang.flag}</span>
                      <span>{lang.native}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({lang.name})</span>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{t('topbar.notifications')}</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                      {unreadCount} {t('topbar.new')}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    {t('topbar.markAllRead')}
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    {t('topbar.noNotifications')}
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => {
                        if (n.link) navigate(n.link);
                        setShowNotifications(false);
                      }}
                      className={`p-3 rounded-xl border transition-colors cursor-pointer text-xs ${
                        n.read
                          ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-semibold text-white truncate">{n.title}</span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className="line-clamp-2 text-slate-300">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-800/80 transition-colors"
            aria-label="User account menu"
          >
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.name || 'User'}`}
              alt={user?.name || 'User avatar'}
              className="w-8 h-8 rounded-full border border-slate-700 object-cover"
            />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {user?.role}
                  </span>
                  <span className="text-[10px] text-slate-400">{user?.department}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  navigate('/settings');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                {t('topbar.accountSettings')}
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors mt-1"
              >
                <LogOut className="w-4 h-4" />
                {t('nav.signOut')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
