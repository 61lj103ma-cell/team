import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Cpu,
  Save,
  CheckCircle2,
  Key,
  Database,
  Globe,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export const Settings = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const { language, setLanguage, t, availableLanguages, currentLanguageInfo } = useLanguage();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || 'IT',
    avatar: user?.avatar || '',
  });

  const [saving, setSaving] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.get('/health', { baseURL: 'http://localhost:5000' });
        setHealthStatus(res);
      } catch (e) {
        setHealthStatus({ status: 'online', geminiKeyConfigured: false });
      }
    };
    checkHealth();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(formData);
      showToast('Profile configuration updated', 'success');
    } catch (err) {
      showToast(err.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          {t('settings.title')}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Language & Localization Card */}
      <div className="rounded-3xl bg-[#111827]/90 border border-slate-800 p-6 shadow-card space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-slate-800 text-cyan-400 border border-slate-700">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{t('settings.languageSection')}</h3>
            <p className="text-xs text-slate-400">{t('settings.languageDesc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
          {availableLanguages.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  showToast(`Language set to ${lang.native} (${lang.name})`, 'success');
                }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500/50 shadow-glow-cyan text-white'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <span className="text-2xl leading-none">{lang.flag}</span>
                <span className="text-xs font-bold">{lang.native}</span>
                <span className="text-[10px] text-slate-400 font-mono">({lang.name})</span>
                {isSelected && (
                  <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Form Card */}
      <form onSubmit={handleSave} className="rounded-3xl bg-[#111827]/90 border border-slate-800 p-6 shadow-card space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-slate-800 text-cyan-400 border border-slate-700">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{t('settings.profile')}</h3>
            <p className="text-xs text-slate-400">{t('settings.profileDesc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t('settings.fullName')}</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t('settings.email')}</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-400 outline-none cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t('settings.role')}</label>
            <input
              type="text"
              disabled
              value={user?.role || 'EMPLOYEE'}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono font-bold text-cyan-400 outline-none cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t('settings.department')}</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white outline-none"
            >
              <option value="IT">IT</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="HR">HR</option>
              <option value="Sales">Sales</option>
              <option value="Customer Support">Customer Support</option>
              <option value="Security">Security</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">{t('settings.avatar')}</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-glow-cyan"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : t('settings.saveChanges')}
          </button>
        </div>
      </form>

      {/* AI Telemetry & Security Diagnostics Card */}
      <div className="rounded-3xl bg-[#111827]/90 border border-slate-800 p-6 shadow-card space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400 border border-slate-700">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{t('settings.aiArchitecture')}</h3>
            <p className="text-xs text-slate-400">FlowPilot AI generative triage service status</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="font-semibold text-white block">AI Provider Engine</span>
            <p className="text-slate-400">
              Google Gemini API with multi-tiered fallback diagnostic engine.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${healthStatus?.geminiKeyConfigured ? 'bg-emerald-400' : 'bg-cyan-400'}`}></span>
              <span className="text-slate-200 font-mono">
                {healthStatus?.geminiKeyConfigured ? 'Gemini 1.5 Flash Connected' : 'Enterprise Heuristic Diagnostic Active'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="font-semibold text-white block">API Key Protection</span>
            <p className="text-slate-400">
              All LLM API tokens remain strictly confined to the backend server environment. Zero client-side leakage.
            </p>
            <span className="text-emerald-400 font-mono font-bold flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Server-Side Isolated
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
