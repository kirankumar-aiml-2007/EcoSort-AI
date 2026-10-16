import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ArrowRight, 
  User, 
  ShieldCheck, 
  MessageSquare, 
  Filter, 
  Clock,
  MapPin,
  RefreshCw,
  Award
} from 'lucide-react';
import type { 
  WasteItem, 
  WasteCategory, 
  BinColor 
} from '../types/ecosort.ts';
import { auditItemDispute } from '../services/apiClient.ts';

interface DisputeDeskProps {
  items: WasteItem[];
  onRefreshData: () => void;
  onInspectItem: (item: WasteItem) => void;
}

export const DisputeDesk: React.FC<DisputeDeskProps> = ({
  items,
  onRefreshData,
  onInspectItem
}) => {
  const [selectedItem, setSelectedItem] = useState<WasteItem | null>(null);
  const [auditNotes, setAuditNotes] = useState<string>('');
  const [reclassifyCategory, setReclassifyCategory] = useState<WasteCategory>('recyclable');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<'pending' | 'resolved' | 'all'>('pending');

  // Filter flagged / disputed items
  const disputedItems = items.filter(i => {
    if (filterMode === 'pending') return i.disputed && !i.auditAction;
    if (filterMode === 'resolved') return i.auditAction !== undefined;
    return i.disputed || i.auditAction !== undefined;
  });

  const handleResolveDispute = async (action: 'approved' | 'overruled' | 'reclassified') => {
    if (!selectedItem) return;

    try {
      setIsSubmitting(true);
      await auditItemDispute({
        itemId: selectedItem.id,
        action,
        volunteerName: 'Elena Rostova (Operations Lead)',
        notes: auditNotes || (action === 'approved' ? 'Volunteer approved deposit' : 'Contamination confirmed by volunteer'),
        newCategory: action === 'reclassified' ? reclassifyCategory : undefined
      });

      setSelectedItem(null);
      setAuditNotes('');
      onRefreshData();
    } catch (err: any) {
      alert('Error updating audit decision: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBinBadgeColor = (color?: BinColor) => {
    switch (color) {
      case 'blue': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'green': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'brown': return 'bg-amber-600/20 text-amber-300 border-amber-600/30';
      case 'red': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-slate-700/30 text-slate-300 border-slate-600/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="mb-6 pb-6 border-b border-slate-800 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Human-in-the-Loop Quality Assurance
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Dispute & Contamination Audit Desk
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Audit deposits where citizen confirmations clashed with AI recommendations, or review unclassified items. Overrule false positives to award points, or uphold rejections to prevent facility contamination.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => setFilterMode('pending')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterMode === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending Review ({items.filter(i => i.disputed && !i.auditAction).length})
          </button>
          <button
            onClick={() => setFilterMode('resolved')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterMode === 'resolved'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Resolved Audits
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterMode === 'all'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Flagged
          </button>
        </div>
      </div>

      {/* Main Layout: Left queue table; Right side-by-side inspect panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Disputed Queue (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {disputedItems.length === 0 ? (
            <div className="border border-slate-800 rounded-2xl bg-slate-900/30 p-12 text-center flex flex-col items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400/80 mb-3" />
              <h3 className="font-display font-semibold text-base text-slate-200">
                Zero Pending Mismatches
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                All citizen confirmations match AI guidelines. Any new deposit discrepancies will immediately populate this queue.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {disputedItems.map(item => {
                const isSelected = selectedItem?.id === item.id;
                const isResolved = item.auditAction !== undefined;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item);
                      setAuditNotes(item.volunteerNotes || '');
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'border-amber-500 bg-amber-950/20 shadow-lg ring-1 ring-amber-500/30'
                        : isResolved
                        ? 'border-slate-800 bg-slate-950/40 opacity-75 hover:opacity-100 hover:border-slate-700'
                        : 'border-amber-900/60 bg-slate-950/70 hover:border-amber-600/80 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {/* Thumbnail */}
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover border border-slate-800 shrink-0 bg-slate-900"
                          referrerPolicy="no-referrer"
                        />

                        <div>
                          <div className="font-display font-semibold text-sm text-slate-100 flex items-center gap-2">
                            {item.name}
                            {item.auditAction ? (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                {item.auditAction.toUpperCase()}
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                MISMATCH
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-400 mt-0.5">
                            {item.material} · <span className="text-slate-500">{item.station}</span>
                          </div>

                          {/* Contrast comparison tag */}
                          <div className="mt-2.5 flex items-center gap-2 text-xs">
                            <span className="text-slate-400 text-[11px]">AI suggested:</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${getBinBadgeColor(item.binColor)}`}>
                              {item.binColor} Bin
                            </span>

                            <ArrowRight className="w-3 h-3 text-slate-500" />

                            <span className="text-slate-400 text-[11px]">User confirmed:</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${getBinBadgeColor(item.confirmedBin)}`}>
                              {item.confirmedBin || 'Unknown'} Bin
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[11px] font-mono text-slate-500">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {item.userName}
                        </div>
                      </div>
                    </div>

                    {/* Discrepancy Note */}
                    {item.disputeReason && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-xs text-amber-300/90 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{item.disputeReason}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Column: Inspect & Audit Action Panel (5 cols) */}
        <div className="lg:col-span-5">
          {selectedItem ? (
            <div className="border border-slate-800 rounded-2xl bg-slate-900/60 p-6 shadow-xl sticky top-20">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Item Audit Desk · #{selectedItem.id}
                </span>
                <button
                  onClick={() => onInspectItem(selectedItem)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Full History
                </button>
              </div>

              {/* Photo & Description */}
              <div className="my-4">
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.name}
                  className="w-full h-44 rounded-xl object-cover border border-slate-800 mb-3"
                  referrerPolicy="no-referrer"
                />

                <h3 className="font-display font-bold text-base text-white">
                  {selectedItem.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Reported by <span className="text-slate-200 font-medium">{selectedItem.userName}</span> at {selectedItem.station}
                </p>
              </div>

              {/* Side-by-Side Evaluation */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2.5 text-xs mb-5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">AI Vision Recommendation:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase font-semibold ${getBinBadgeColor(selectedItem.binColor)}`}>
                    {selectedItem.binColor} Bin ({selectedItem.category})
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Citizen Deposited Into:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase font-semibold ${getBinBadgeColor(selectedItem.confirmedBin)}`}>
                    {selectedItem.confirmedBin || 'N/A'} Bin
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                  <span className="font-medium text-slate-300">Material Analysis:</span> {selectedItem.material}. {selectedItem.recyclingInstructions}
                </div>
              </div>

              {/* Volunteer Decision Controls */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-200">
                  Volunteer Decision
                </div>

                {/* Audit notes textarea */}
                <textarea
                  rows={2}
                  placeholder="Reason for decision (e.g. Clean paper top separated, citizen deposit accepted)"
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  
                  {/* Option 1: Overrule & Approve */}
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleResolveDispute('approved')}
                    className="py-2.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve (+{selectedItem.suggestedPoints} pts)
                  </button>

                  {/* Option 2: Confirm Contamination */}
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleResolveDispute('overruled')}
                    className="py-2.5 px-3 rounded-lg bg-red-950/70 hover:bg-red-900/70 border border-red-500/40 text-red-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Uphold Mismatch
                  </button>

                </div>

                {/* Option 3: Reclassify Stream */}
                <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  <select
                    value={reclassifyCategory}
                    onChange={(e) => setReclassifyCategory(e.target.value as WasteCategory)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="recyclable">Reclassify: Recyclable (Blue)</option>
                    <option value="reusable">Reclassify: Reusable (Green)</option>
                    <option value="biodegradable">Reclassify: Biodegradable (Brown)</option>
                    <option value="hazardous">Reclassify: Hazardous (Red)</option>
                  </select>

                  <button
                    disabled={isSubmitting}
                    onClick={() => handleResolveDispute('reclassified')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shrink-0"
                  >
                    Apply
                  </button>
                </div>

              </div>

            </div>
          ) : (
            <div className="border border-slate-800 rounded-2xl bg-slate-900/30 p-8 text-center text-slate-500 text-xs flex flex-col items-center justify-center h-72">
              <ShieldCheck className="w-10 h-10 text-slate-600 mb-2" />
              Select an item from the queue to inspect and resolve.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
