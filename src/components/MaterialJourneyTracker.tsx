import React, { useState } from 'react';
import { 
  Clock, 
  Search, 
  MapPin, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight,
  Filter,
  Check,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import type { WasteItem, LifecycleStatus, BinColor } from '../types/ecosort.ts';

interface MaterialJourneyTrackerProps {
  items: WasteItem[];
  onInspectItem: (item: WasteItem) => void;
}

const STAGES: { key: LifecycleStatus; label: string }[] = [
  { key: 'scanned', label: '1. Scanned' },
  { key: 'disposed', label: '2. In Physical Bin' },
  { key: 'collected', label: '3. Collected' },
  { key: 'processing', label: '4. Facility Processing' },
  { key: 'recycled', label: '5. Circularity Closed' },
];

export const MaterialJourneyTracker: React.FC<MaterialJourneyTrackerProps> = ({ items, onInspectItem }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<WasteItem>(items[0] || null);

  const filtered = items.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.station.toLowerCase().includes(q) ||
        item.userName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getBinBadgeColor = (color: BinColor) => {
    switch (color) {
      case 'blue': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'green': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'brown': return 'bg-amber-600/20 text-amber-300 border-amber-600/30';
      case 'red': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-slate-700/30 text-slate-300 border-slate-600/30';
    }
  };

  const getStageIndex = (status: LifecycleStatus) => {
    switch (status) {
      case 'scanned': return 0;
      case 'disposed': return 1;
      case 'collected': return 2;
      case 'processing': return 3;
      case 'recycled':
      case 'rejected': return 4;
      default: return 0;
    }
  };

  const activeItem = selectedItem || filtered[0] || items[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Immutable Audit Trail & Chain of Custody
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Material Journey Tracker
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Track individual packaging units and material batches from point of deposit through final recycling verification.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by ID (e.g. FLUX-101)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Stages</option>
            <option value="scanned">Scanned</option>
            <option value="disposed">In Physical Bin</option>
            <option value="collected">Collected</option>
            <option value="processing">At Processing</option>
            <option value="recycled">Recycled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Left is Item List; Right is Journey Timeline Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Trackable Items List (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
          {filtered.map(item => {
            const isSelected = activeItem?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/20 shadow-md'
                    : 'border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0 bg-slate-950"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="text-xs font-bold text-white line-clamp-1">{item.name}</div>
                    <div className="text-[11px] font-mono text-slate-400">
                      #{item.id} · <span className="uppercase text-emerald-400">{item.status}</span>
                    </div>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${getBinBadgeColor(item.binColor)}`}>
                  {item.binColor} Bin
                </span>
              </div>
            );
          })}
        </div>

        {/* Right: Active Item Journey & Milestone Visualizer (7 cols) */}
        <div className="lg:col-span-7">
          {activeItem ? (
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-6">
              
              {/* Top Banner */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="text-xs font-mono text-emerald-400">
                    ID: #{activeItem.id} · Registered at {activeItem.station}
                  </div>
                  <h2 className="text-xl font-display font-bold text-white mt-1">
                    {activeItem.name}
                  </h2>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {activeItem.material} · <span className="text-slate-300">Confidence: {Math.round(activeItem.confidence * 100)}%</span>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-lg text-xs font-mono uppercase font-bold border ${getBinBadgeColor(activeItem.binColor)}`}>
                  {activeItem.binColor} Bin
                </span>
              </div>

              {/* Progress Milestones Bar */}
              <div>
                <div className="text-xs font-semibold text-slate-300 mb-3">
                  Lifecycle State Progress
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {STAGES.map((s, idx) => {
                    const activeIdx = getStageIndex(activeItem.status);
                    const isCompleted = idx <= activeIdx;
                    const isCurrent = idx === activeIdx;

                    return (
                      <div key={s.key} className="text-center">
                        <div className={`h-2 rounded-full mb-1.5 transition-colors ${
                          isCompleted ? 'bg-emerald-500' : 'bg-slate-800'
                        }`} />
                        <div className={`text-[10px] font-mono ${
                          isCurrent ? 'text-emerald-400 font-bold' : isCompleted ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          {s.label.split('.')[1]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Immutable Chain-of-Custody Timeline Log */}
              <div>
                <div className="text-xs font-semibold text-slate-300 mb-3 flex items-center justify-between">
                  <span>Recorded Events ({activeItem.lifecycleHistory.length})</span>
                  <span className="text-[11px] text-slate-500">Chronological Order</span>
                </div>

                <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {activeItem.lifecycleHistory.map((entry, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-emerald-400" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono uppercase font-bold text-emerald-400">{entry.status}</span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {new Date(entry.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5">{entry.actor}</div>
                      {entry.note && (
                        <div className="text-[11px] text-slate-400 mt-0.5 italic">"{entry.note}"</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              Select an item to view its material journey.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
