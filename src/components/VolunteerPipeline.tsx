import React, { useState } from 'react';
import { 
  Layers, 
  CheckSquare, 
  Square, 
  ChevronRight, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Trash2, 
  Truck, 
  Factory, 
  Recycle, 
  XCircle, 
  Filter, 
  Search, 
  Check, 
  Eye, 
  Plus,
  ArrowUpRight
} from 'lucide-react';
import type { 
  WasteItem, 
  LifecycleStatus, 
  WasteCategory, 
  BinColor 
} from '../types/ecosort.ts';
import { batchAdvanceLifecycle } from '../services/apiClient.ts';

interface VolunteerPipelineProps {
  items: WasteItem[];
  onRefreshData: () => void;
  onInspectItem: (item: WasteItem) => void;
  onOpenDisputeDesk: () => void;
}

const STAGES: { key: LifecycleStatus; label: string; icon: any; color: string; desc: string }[] = [
  { key: 'scanned', label: '1. Scanned', icon: Clock, color: 'text-slate-400', desc: 'Scan recorded, pending deposit' },
  { key: 'disposed', label: '2. In Physical Bin', icon: Trash2, color: 'text-blue-400', desc: 'Deposited at station' },
  { key: 'collected', label: '3. Collected', icon: Truck, color: 'text-amber-400', desc: 'Emptied by volunteers' },
  { key: 'processing', label: '4. At Processing', icon: Factory, color: 'text-indigo-400', desc: 'Sorting / Digester' },
  { key: 'recycled', label: '5. Recycled / Closed', icon: Recycle, color: 'text-emerald-400', desc: 'Diverted from landfill' },
];

export const VolunteerPipeline: React.FC<VolunteerPipelineProps> = ({
  items,
  onRefreshData,
  onInspectItem,
  onOpenDisputeDesk
}) => {
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [isAdvancing, setIsAdvancing] = useState<boolean>(false);
  const [batchNote, setBatchNote] = useState<string>('');
  const [showBatchNoteModal, setShowBatchNoteModal] = useState<LifecycleStatus | null>(null);

  // Filter items
  const filteredItems = items.filter(item => {
    if (selectedStation !== 'all' && !item.station.includes(selectedStation)) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.material.toLowerCase().includes(q) ||
        item.station.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleSelectAllInStage = (stage: LifecycleStatus) => {
    const stageItems = filteredItems.filter(i => i.status === stage).map(i => i.id);
    const allSelected = stageItems.every(id => selectedItemIds.includes(id));

    if (allSelected) {
      setSelectedItemIds(prev => prev.filter(id => !stageItems.includes(id)));
    } else {
      setSelectedItemIds(prev => Array.from(new Set([...prev, ...stageItems])));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleExecuteBatchStatus = async (targetStatus: LifecycleStatus) => {
    if (selectedItemIds.length === 0) return;

    try {
      setIsAdvancing(true);
      await batchAdvanceLifecycle({
        itemIds: selectedItemIds,
        targetStatus,
        volunteerName: 'Elena Rostova (Operations Lead)',
        batchNote: batchNote || `Batch advanced ${selectedItemIds.length} items to ${targetStatus}`
      });

      setSelectedItemIds([]);
      setShowBatchNoteModal(null);
      setBatchNote('');
      onRefreshData();
    } catch (err: any) {
      alert('Error updating batch status: ' + err.message);
    } finally {
      setIsAdvancing(false);
    }
  };

  // Unique stations in items
  const stations = Array.from(new Set(items.map(i => i.station.split('·')[0].trim()))).filter(Boolean);

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Header & Breadcrumb Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1">
            Operations Console · Closed-Loop Waste Traceability
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
            Lifecycle Pipeline & Batch Actions
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Trace every scanned item from physical bin deposit to collection, facility sorting, and final recycling.
          </p>
        </div>

        {/* View Toggle & Audit Shortcut */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenDisputeDesk}
            className="px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Inspect Mismatch Queue
          </button>

          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'board'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Board View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Table View
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          
          {/* Station Filter */}
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Campus Stations</option>
              {stations.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Stream Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Waste Streams</option>
              <option value="recyclable">Recyclable (Blue)</option>
              <option value="reusable">Reusable (Green)</option>
              <option value="biodegradable">Biodegradable (Brown)</option>
              <option value="hazardous">Hazardous (Red)</option>
              <option value="unclassified">Unclassified (Slate)</option>
            </select>
          </div>

          {/* Search box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search items by name, material, station..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

        </div>

        {/* Selected Counter & Deselect */}
        {selectedItemIds.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span>{selectedItemIds.length} items selected</span>
            <button
              onClick={() => setSelectedItemIds([])}
              className="text-slate-400 hover:text-slate-200 text-xs underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* STICKY BATCH ADVANCEMENT BAR (Appears when items are checked)  */}
      {/* ------------------------------------------------------------- */}
      {selectedItemIds.length > 0 && (
        <div className="sticky top-20 z-40 mb-6 p-3.5 bg-slate-900 border border-emerald-500/40 rounded-xl shadow-2xl flex flex-wrap items-center justify-between gap-4 backdrop-blur-md animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs font-mono">
              {selectedItemIds.length}
            </div>
            <div>
              <div className="text-xs font-bold text-white">Batch Lifecycle Action</div>
              <div className="text-[11px] text-slate-400">Select target stage for {selectedItemIds.length} selected items:</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowBatchNoteModal('collected')}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Truck className="w-3.5 h-3.5" />
              Batch Mark: Collected
            </button>

            <button
              onClick={() => setShowBatchNoteModal('processing')}
              className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Factory className="w-3.5 h-3.5" />
              Send to Processing Facility
            </button>

            <button
              onClick={() => setShowBatchNoteModal('recycled')}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Recycle className="w-3.5 h-3.5" />
              Confirm: Recycled
            </button>

            <button
              onClick={() => setShowBatchNoteModal('rejected')}
              className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject Batch (Contaminated)
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. BOARD / KANBAN VIEW                                        */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          {STAGES.map(stage => {
            const stageItems = filteredItems.filter(i => {
              if (stage.key === 'recycled') {
                return i.status === 'recycled' || i.status === 'rejected';
              }
              return i.status === stage.key;
            });

            const allSelected = stageItems.length > 0 && stageItems.every(i => selectedItemIds.includes(i.id));

            return (
              <div 
                key={stage.key}
                className="rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col min-h-[500px]"
              >
                {/* Stage Column Header */}
                <div className="p-3.5 border-b border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <stage.icon className={`w-4 h-4 ${stage.color}`} />
                    <span className="font-display font-semibold text-xs text-white">
                      {stage.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-medium text-slate-400 px-1.5 py-0.5 rounded bg-slate-800/80">
                      {stageItems.length}
                    </span>

                    {stageItems.length > 0 && (
                      <button
                        onClick={() => toggleSelectAllInStage(stage.key)}
                        title="Select all in column"
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        {allSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Square className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Subtitle description */}
                <div className="px-3.5 py-1.5 bg-slate-950/40 border-b border-slate-800/60 text-[10px] text-slate-500 truncate">
                  {stage.desc}
                </div>

                {/* Cards Container */}
                <div className="p-2 space-y-2.5 flex-1 overflow-y-auto max-h-[640px]">
                  {stageItems.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-center text-slate-600 text-xs p-4">
                      No items currently in this lifecycle stage
                    </div>
                  ) : (
                    stageItems.map(item => {
                      const isSelected = selectedItemIds.includes(item.id);
                      const isRejected = item.status === 'rejected';

                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-xl border transition-all text-left relative group ${
                            isSelected 
                              ? 'border-emerald-500 bg-emerald-950/20 shadow-md' 
                              : isRejected
                              ? 'border-red-900/60 bg-red-950/20 hover:border-red-700/80'
                              : item.disputed
                              ? 'border-amber-700/60 bg-amber-950/15 hover:border-amber-600'
                              : 'border-slate-800/90 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/80'
                          }`}
                        >
                          {/* Selection Checkbox & Category */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelectItem(item.id);
                              }}
                              className="text-slate-400 hover:text-white"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Square className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <div className="flex items-center gap-1.5">
                              {/* Recommended Bin badge */}
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase ${getBinBadgeColor(item.binColor)}`}>
                                {item.binColor} Bin
                              </span>

                              {/* Dispute indicator */}
                              {item.disputed && (
                                <span className="text-[10px] text-amber-400 flex items-center gap-0.5" title={item.disputeReason}>
                                  <AlertTriangle className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Item Thumbnail & Name */}
                          <div 
                            onClick={() => onInspectItem(item)}
                            className="cursor-pointer group-hover:text-emerald-300 transition-colors"
                          >
                            <div className="font-medium text-xs text-slate-200 line-clamp-2 leading-tight">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1 truncate">
                              {item.material}
                            </div>
                          </div>

                          {/* Location & Time Footer */}
                          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                            <span className="truncate max-w-[100px]">{item.station.split('·')[0]}</span>
                            <button 
                              onClick={() => onInspectItem(item)}
                              className="hover:text-emerald-400 flex items-center gap-0.5"
                            >
                              Details
                              <ArrowUpRight className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          {/* Rejection notice */}
                          {isRejected && (
                            <div className="mt-1.5 text-[10px] text-red-400 font-semibold flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Rejected / Landfilled
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. TABLE / GRID VIEW                                          */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'table' && (
        <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono uppercase text-[11px]">
                  <th className="py-3 px-4 w-10">
                    <button
                      onClick={() => {
                        if (selectedItemIds.length === filteredItems.length) {
                          setSelectedItemIds([]);
                        } else {
                          setSelectedItemIds(filteredItems.map(i => i.id));
                        }
                      }}
                    >
                      {selectedItemIds.length === filteredItems.length && filteredItems.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Item & Material</th>
                  <th className="py-3 px-4">Target Stream</th>
                  <th className="py-3 px-4">Lifecycle Status</th>
                  <th className="py-3 px-4">Station Location</th>
                  <th className="py-3 px-4">Citizen User</th>
                  <th className="py-3 px-4">Dispute Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredItems.map(item => {
                  const isSelected = selectedItemIds.includes(item.id);
                  return (
                    <tr 
                      key={item.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-emerald-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <button onClick={() => toggleSelectItem(item.id)}>
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{item.name}</div>
                        <div className="text-[11px] text-slate-400">{item.material}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded border text-[11px] font-mono uppercase ${getBinBadgeColor(item.binColor)}`}>
                          {item.binColor} · {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono uppercase text-[11px]">
                        <span className="text-slate-300">{item.status}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {item.station}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {item.userName}
                      </td>
                      <td className="py-3 px-4">
                        {item.disputed ? (
                          <span className="text-amber-400 flex items-center gap-1 text-[11px] font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            Mismatch Flag
                          </span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                            <Check className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onInspectItem(item)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                        >
                          Timeline
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Batch Note Modal */}
      {showBatchNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-display font-bold text-white mb-2">
              Advance {selectedItemIds.length} Items to {showBatchNoteModal.toUpperCase()}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter an optional operational dispatch note for the immutable audit timeline.
            </p>

            <textarea
              rows={3}
              placeholder="e.g., Emptied Station A bins for 07:00 morning transfer to Central Depot"
              value={batchNote}
              onChange={(e) => setBatchNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 mb-5"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowBatchNoteModal(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                disabled={isAdvancing}
                onClick={() => handleExecuteBatchStatus(showBatchNoteModal)}
                className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                {isAdvancing ? 'Updating...' : 'Confirm Batch Transition'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
