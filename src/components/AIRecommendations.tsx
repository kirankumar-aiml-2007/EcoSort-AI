import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Lightbulb, 
  Leaf, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw,
  ShoppingBag,
  TrendingDown,
  Recycle,
  HelpCircle
} from 'lucide-react';
import type { AIInsight, WasteItem, UserAccount } from '../types/ecosort.ts';
import { fetchAIInsights, askGeminiAssistant } from '../services/apiClient.ts';

interface AIRecommendationsProps {
  currentUser: UserAccount;
  items: WasteItem[];
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({ currentUser, items }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [activeTab, setActiveTab] = useState<'tips' | 'custom_ask'>('tips');
  const [customQuestion, setCustomQuestion] = useState('');
  const [customAnswer, setCustomAnswer] = useState<string | null>(null);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);

  useEffect(() => {
    fetchAIInsights().then(setInsights).catch(() => {});
  }, []);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || isLoadingAnswer) return;

    try {
      setIsLoadingAnswer(true);
      const answer = await askGeminiAssistant(
        customQuestion, 
        `User scanned ${items.length} items. Frequent materials: PET, Aluminum, Cardboard.`
      );
      setCustomAnswer(answer);
    } catch (err: any) {
      setCustomAnswer('Failed to get recommendation. Please try again.');
    } finally {
      setIsLoadingAnswer(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="relative rounded-3xl p-8 overflow-hidden border border-emerald-500/30 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-lime-400" />
            Gemini 3.8 Flash Circular Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Personalized AI Recommendations
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            AI-driven circularity strategies analyzed from your recent scans, single-use packaging consumption, and local campus drop-off rules.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('tips')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'tips'
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Tailored Reduction Strategies</span>
        </button>
        <button
          onClick={() => setActiveTab('custom_ask')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'custom_ask'
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Custom Circularity Query</span>
        </button>
      </div>

      {activeTab === 'tips' && (
        <div className="space-y-6">
          {/* Quick summary stats banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs text-slate-400">Primary Stream Scanned</div>
              <div className="text-xl font-mono font-bold text-blue-400 mt-1">Blue (Recyclables 68%)</div>
              <div className="text-[11px] text-slate-500 mt-0.5">High plastic bottle volume</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs text-slate-400">Avoidance Potential</div>
              <div className="text-xl font-mono font-bold text-emerald-400 mt-1">-3.4 kg CO2 / week</div>
              <div className="text-[11px] text-slate-500 mt-0.5">By switching to reusable canteen tumbler</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs text-slate-400">Contamination Risk Score</div>
              <div className="text-xl font-mono font-bold text-amber-400 mt-1">Low (94% Match)</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Occasional coffee lid confusion</div>
            </div>
          </div>

          {/* AI Insights List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map(insight => (
              <div
                key={insight.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                      {insight.category}
                    </span>
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${getSeverityBadge(insight.severity)}`}>
                      Impact: {insight.severity}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-white">
                    {insight.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {insight.description}
                  </p>
                </div>

                <div className="mt-5 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
                  <div className="text-[11px] font-mono uppercase text-emerald-400 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    AI Action Plan
                  </div>
                  <p className="text-xs text-emerald-200/90 leading-relaxed">
                    {insight.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'custom_ask' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-xl font-display font-bold text-white">
              Consult the Circular Economy AI Engine
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Ask about obscure packaging symbols, multi-material pouches, compostability tests, or local zero-waste alternatives.
            </p>
          </div>

          <form onSubmit={handleAskAI} className="space-y-4">
            <div>
              <textarea
                rows={3}
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="e.g., How do I clean and recycle peanut butter glass jars with metal lids? What bin does the inner plastic liner go into?"
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                Grounded in 4-Stream Sorting Rules (Blue, Green, Brown, Red)
              </div>
              <button
                type="submit"
                disabled={isLoadingAnswer || !customQuestion.trim()}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoadingAnswer ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Query...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Get AI Recommendation</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {customAnswer && (
            <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
              <div className="text-xs font-mono uppercase text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-lime-400" />
                Gemini Circular Recommendation
              </div>
              <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {customAnswer}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
