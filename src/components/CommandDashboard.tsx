import React from 'react';
import { 
  Sparkles, 
  ScanLine, 
  Layers, 
  AlertTriangle, 
  TrendingUp, 
  Recycle, 
  Leaf, 
  Award, 
  ArrowRight, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck,
  Zap,
  BarChart3
} from 'lucide-react';
import type { 
  UserAccount, 
  AnalyticsSummary, 
  WasteItem, 
  BinColor 
} from '../types/ecosort.ts';
import type { NavigationTab } from './Navbar.tsx';

interface CommandDashboardProps {
  currentUser: UserAccount;
  analytics: AnalyticsSummary;
  recentItems: WasteItem[];
  onNavigate: (tab: NavigationTab) => void;
  onInspectItem: (item: WasteItem) => void;
  onOpenAssistant: () => void;
}

export const CommandDashboard: React.FC<CommandDashboardProps> = ({
  currentUser,
  analytics,
  recentItems,
  onNavigate,
  onInspectItem,
  onOpenAssistant
}) => {
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'volunteer';

  const getBinBadgeColor = (color: BinColor) => {
    switch (color) {
      case 'blue': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'green': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'brown': return 'bg-amber-600/20 text-amber-300 border-amber-600/30';
      case 'red': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-slate-700/30 text-slate-300 border-slate-600/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl p-8 overflow-hidden border border-emerald-500/30 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-950 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            EcoFlux Intelligence Platform · {isAdmin ? 'Admin Command View' : 'Citizen Portal'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            {isAdmin 
              ? 'Real-time circular economy command center: 4 waste streams active, 3D facility simulation running, and automated contamination verification live.' 
              : 'Scan your packaging, verify your bin drops to earn verified eco-credits, and track your materials as they are recycled into new products.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('scanner')}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <ScanLine className="w-4 h-4" />
              Launch Vision Scanner
            </button>
            <button
              onClick={() => onNavigate(isAdmin ? 'digital_twin_admin' : 'digital_twin')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-xs flex items-center gap-2 transition-colors"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              View 3D Digital Twin
            </button>
            <button
              onClick={onOpenAssistant}
              className="px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Ask AI Assistant
            </button>
          </div>
        </div>
      </div>

      {/* 4 Live KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Recycling Yield</span>
            <Recycle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-mono tabular-nums font-bold text-white">
            {analytics.overallRecyclingRate}%
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Target: &gt;80% · Based on processed items</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Contamination Rate</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-mono tabular-nums font-bold text-white">
            {analytics.contaminationRate}%
          </div>
          <div className="text-[11px] text-amber-400 mt-1">
            {analytics.disputedCount} items flagged for volunteer review
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Carbon Avoided</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-mono tabular-nums font-bold text-white">
            {analytics.co2AvoidedTotalKg} <span className="text-lg font-normal text-slate-400">kg</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            Equivalent to ~148 km car drive avoided
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">{isAdmin ? 'Pending Bins' : 'Your Eco-Credits'}</span>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-mono tabular-nums font-bold text-white">
            {isAdmin ? analytics.disposedCount : currentUser.credits}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isAdmin ? 'Items in physical bins awaiting collection' : `${currentUser.streakDays}-day active sorting streak`}
          </div>
        </div>

      </div>

      {/* Grid: Left is Recent Scans Stream; Right is Quick Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Recent Activity Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Live Waste Stream Activity
            </h3>
            <button
              onClick={() => onNavigate('journey_tracker')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              Full Journey Tracker
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {recentItems.slice(0, 5).map(item => (
              <div
                key={item.id}
                onClick={() => onInspectItem(item)}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-800 shrink-0 bg-slate-950"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="font-semibold text-xs text-slate-200 line-clamp-1">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {item.material} · <span className="text-slate-500">{item.station}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${getBinBadgeColor(item.binColor)}`}>
                    {item.binColor} · {item.status}
                  </span>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Operational Shortcuts & Status (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-display font-bold text-base text-white">
            Operational Feature Navigation
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate(isAdmin ? 'smart_bins' : 'station_finder')}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/80 hover:border-slate-700 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2.5">
                <Recycle className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-slate-200">Smart Bins</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Live fill levels & pickups</div>
            </button>

            <button
              onClick={() => onNavigate('rewards_store')}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/80 hover:border-slate-700 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2.5">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-slate-200">Rewards Catalog</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Coffee vouchers & gear</div>
            </button>

            <button
              onClick={() => onNavigate('reuse_market')}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/80 hover:border-slate-700 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-slate-200">Reuse Hub</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Campus locker listings</div>
            </button>

            <button
              onClick={() => onNavigate('sustainability_quiz')}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/80 hover:border-slate-700 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2.5">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-slate-200">Learning Lab</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Interactive sorting quizzes</div>
            </button>

            <button
              onClick={() => onNavigate(isAdmin ? 'volunteer_tasks' : 'rewards_store')}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/80 hover:border-slate-700 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center mb-2.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-slate-200">{isAdmin ? 'Field Ops' : 'Rewards Store'}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{isAdmin ? 'Shift queues & tasks' : 'Redeem eco-credits'}</div>
            </button>

            <button
              onClick={() => onNavigate(isAdmin ? 'audit_logs' : 'profile_settings')}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/80 hover:border-slate-700 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-700/30 text-slate-300 flex items-center justify-center mb-2.5">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-slate-200">{isAdmin ? 'System Health' : 'Eco Profile'}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{isAdmin ? 'Audit logs & status' : 'Preferences & passport'}</div>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
