import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const { currentLang, languages, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      showToast(t('auth.welcomeBack'), 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Top right language switch */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-[#111827]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800">
        <Globe className="w-3.5 h-3.5 text-cyan-400" />
        <select
          value={currentLang}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-transparent text-xs text-slate-300 font-medium outline-none cursor-pointer pr-1"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code} className="bg-slate-900 text-white">
              {l.flag} {l.name}
            </option>
          ))}
        </select>
      </div>

      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-cyan-400 p-[1px] mb-4 shadow-glow-cyan">
            <div className="w-full h-full bg-[#0B0F19] rounded-[15px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            FLOWPILOT <span className="text-cyan-400">AI</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">
            Enterprise Incident Management Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl bg-[#111827]/90 border border-slate-800/80 p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="text-lg font-bold text-white mb-2">{t('auth.signInTitle')}</h2>
          <p className="text-xs text-slate-400 mb-6">
            {t('auth.signInSubtitle')}
          </p>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('auth.emailAddress')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@enterprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-white placeholder-slate-400 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  {t('auth.password')}
                </label>
                <span className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer">
                  {t('auth.forgotPassword')}
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-white placeholder-slate-400 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 shadow-glow-cyan transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>{t('auth.authenticating')}</span>
                </>
              ) : (
                <>
                  <span>{t('auth.signInButton')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              {t('auth.demoAccounts')}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@example.com')}
                className="py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-purple-300 transition-colors text-left"
              >
                <div className="font-semibold text-white">Admin</div>
                <div className="text-[10px] text-slate-400 truncate">admin@example.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('manager@example.com')}
                className="py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors text-left"
              >
                <div className="font-semibold text-white">Manager</div>
                <div className="text-[10px] text-slate-400 truncate">manager@example.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('engineer@example.com')}
                className="py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition-colors text-left"
              >
                <div className="font-semibold text-white">Engineer</div>
                <div className="text-[10px] text-slate-400 truncate">engineer@example.com</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('employee@example.com')}
                className="py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 transition-colors text-left"
              >
                <div className="font-semibold text-white">Employee</div>
                <div className="text-[10px] text-slate-400 truncate">employee@example.com</div>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-slate-400">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="font-semibold text-cyan-400 hover:underline">
              {t('auth.requestAccess')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
