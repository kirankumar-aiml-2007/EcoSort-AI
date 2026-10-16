import React from 'react';
import { 
  Award, 
  Leaf, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import type { UserAccount, WasteItem, BinColor } from '../types/ecosort.ts';

interface CitizenHistoryProps {
  currentUser: UserAccount;
  items: WasteItem[];
  onScanNew: () => void;
  onInspectItem: (item: WasteItem) => void;
}

export const CitizenHistory: React.FC<CitizenHistoryProps> = ({
  currentUser,
  items,
  onScanNew,
  onInspectItem
}) => {
  // Items scanned by this user
  const userItems = items.filter(i => i.userId === currentUser.id);

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
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Profile Overview Card */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl font-bold font-display text-emerald-400 shrink-0">
            {currentUser.name.charAt(0)}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-bold text-white">
                {currentUser.name}
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
                {currentUser.rank}
              </span>
            </div>

            <div className="text-xs text-slate-400 mt-1">
              {currentUser.email} · <span className="text-slate-500">{currentUser.stationOrZone}</span>
            </div>
          </div>
        </div>

        {/* User Stats Trio */}
        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
          <div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              Eco-Credits
            </div>
            <div className="text-2xl font-mono tabular-nums font-bold text-emerald-400">
              {currentUser.credits}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5 text-blue-400" />
              Items Sorted
            </div>
            <div className="text-2xl font-mono tabular-nums font-bold text-white">
              {currentUser.itemsRecycled}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              CO₂ Offset
            </div>
            <div className="text-2xl font-mono tabular-nums font-bold text-white">
              {currentUser.co2DivertedKg} <span className="text-xs font-normal text-slate-400">kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Citizen Action Trigger */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-display font-bold text-white">
            Personal Recycling Ledger
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Your verified contributions and closed-loop deposit confirmations
          </p>
        </div>

        <button
          onClick={onScanNew}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Scan New Item
        </button>
      </div>

      {/* Timeline List of Items */}
      <div className="space-y-3">
        {userItems.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/30 text-slate-500 text-xs">
            No items recorded yet for this profile. Click "Scan New Item" to test vision classification!
          </div>
        ) : (
          userItems.map(item => {
            return (
              <div
                key={item.id}
                onClick={() => onInspectItem(item)}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-800 shrink-0 bg-slate-900"
                    referrerPolicy="no-referrer"
                  />

                  <div>
                    <div className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                      {item.name}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${getBinBadgeColor(item.binColor)}`}>
                        {item.binColor} Bin
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mt-0.5">
                      {item.material} · <span className="text-slate-500">{item.station}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <div className="text-xs font-mono uppercase tracking-wider text-slate-300">
                      Status: <span className="text-emerald-400 font-semibold">{item.status}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 font-mono text-xs font-semibold tabular-nums">
                      +{item.creditsAwarded} pts
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
