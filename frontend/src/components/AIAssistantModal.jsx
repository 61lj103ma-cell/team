import React, { useState } from 'react';
import { Sparkles, Bot, Send, X, AlertCircle, ArrowRight, CornerDownLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const AIAssistantModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your FlowPilot Enterprise AI Copilot. Ask me anything about current live incidents, department trends, resolution bottlenecks, or critical risks.',
      relatedIncidents: [],
    },
  ]);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const quickQuestions = [
    'What are the unresolved critical incidents?',
    'Which department has the most incidents?',
    'Show payment-related operational issues',
    'Which incidents took the longest to resolve?',
  ];

  const handleSend = async (questionText) => {
    const textToSend = questionText || query;
    if (!textToSend.trim() || loading) return;

    const userMessage = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.post('/ai/assistant', { question: textToSend });
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.data.answer,
          relatedIncidents: res.data.relatedIncidents || [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Unable to analyze operational data right now. Please verify your connection.',
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center p-[1px] shadow-glow-indigo">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                FlowPilot Enterprise Copilot
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Data Grounded
                </span>
              </h3>
              <p className="text-xs text-slate-400">Grounded strictly on real-time database incidents and telemetry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  m.role === 'user'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-cyan-400 border border-slate-700'
                }`}
              >
                {m.role === 'user' ? 'You' : <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
              </div>

              <div
                className={`max-w-[82%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-cyan-600 text-white rounded-tr-none'
                    : 'bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-tl-none shadow-sm'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>

                {/* Related Incident Links */}
                {m.relatedIncidents?.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-cyan-400">Related:</span>
                    {m.relatedIncidents.map((code) => (
                      <button
                        key={code}
                        onClick={() => {
                          onClose();
                          navigate(`/incidents/${code}`);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950 text-[11px] font-mono transition-colors"
                      >
                        {code}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-slate-400 text-xs pl-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Analyzing live database incidents...</span>
            </div>
          )}
        </div>

        {/* Suggestion Prompts */}
        <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800 flex gap-2 overflow-x-auto no-scrollbar">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask about incidents, resolution times, or team load..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs sm:text-sm text-slate-100 placeholder-slate-400 outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!query.trim() || loading}
            className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold transition-all"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
