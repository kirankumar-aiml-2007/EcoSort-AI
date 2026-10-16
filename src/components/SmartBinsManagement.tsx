import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Truck, 
  Battery, 
  Thermometer, 
  Sparkles,
  Layers,
  Filter,
  Zap,
  ArrowRight,
  ShieldCheck,
  Clock,
  Radio,
  Check
} from 'lucide-react';
import type { SmartBin, BinColor } from '../types/ecosort.ts';
import { fetchSmartBins, emptySmartBin, dispatchAllCriticalBinsApi, type DispatchBatchResult } from '../services/apiClient.ts';

interface SmartBinsManagementProps {
  onRefreshData?: () => void;
}

export const SmartBinsManagement: React.FC<SmartBinsManagementProps> = ({ onRefreshData }) => {
  const [bins, setBins] = useState<SmartBin[]>([]);
  const [emptyingId, setEmptyingId] = useState<string | null>(null);
  const [isAutoDispatching, setIsAutoDispatching] = useState<boolean>(false);
  const [dispatchResult, setDispatchResult] = useState<{
    batchId: string;
    binId: string;
    station: string;
    collectedCount: number;
    category: string;
  } | null>(null);
  const [filterStation, setFilterStation] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'critical' | 'normal'>('all');

  const loadBins = async () => {
    try {
      const data = await fetchSmartBins();
      setBins(data);
    } catch (err) {
      console.warn('Failed to fetch bins:', err);
    }
  };

  useEffect(() => {
    loadBins();
  }, []);

  // 1-Click Dispatch Collection Batch for a single bin
  const handleDispatchBatch = async (bin: SmartBin) => {
    try {
      setEmptyingId(bin.id);
      const res: DispatchBatchResult = await emptySmartBin(bin.id, 'Ops Lead (Elena Rostova)');
      
      setDispatchResult({
        batchId: res.batchId || `BATCH-${bin.binColor.toUpperCase()}-${Date.now().toString().slice(-4)}`,
        binId: bin.id,
        station: bin.station,
        collectedCount: res.collectedCount || Math.max(bin.itemCount, 1),
        category: bin.category
      });

      await loadBins();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert('Error dispatching collection batch: ' + err.message);
    } finally {
      setEmptyingId(null);
    }
  };

  // Master 1-Click: Auto-Dispatch All Critical Bins (>75% full)
  const handleAutoDispatchAllCritical = async () => {
    try {
      setIsAutoDispatching(true);
      const res = await dispatchAllCriticalBinsApi('Elena Rostova (Lead Ops)');
      
      setDispatchResult({
        batchId: res.batches?.[0] || 'BATCH-FLEET-SWEEP',
        binId: `${res.dispatchedCount} Bins`,
        station: 'Campus Wide Critical Sweep',
        collectedCount: res.totalItemsCollected,
        category: 'Multi-Stream'
      });

      await loadBins();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert('Error during fleet dispatch: ' + err.message);
    } finally {
      setIsAutoDispatching(false);
    }
  };

  // Derived statistics
  const criticalBins = bins.filter(b => b.fillPercentage >= 75);
  const totalWaitingItems = bins.reduce((sum, b) => sum + b.itemCount, 0);

  const filtered = bins.filter(b => {
    if (filterStation !== 'all' && !b.station.includes(filterStation)) return false;
    if (filterStatus === 'critical' && b.fillPercentage < 75) return false;
    if (filterStatus === 'normal' && b.fillPercentage >= 75) return false;
    return true;
  });

  const getBinBadgeClass = (color: BinColor) => {
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
      
      {/* Header Banner */}
      <div className="relative rounded-3xl p-8 overflow-hidden border border-emerald-500/30 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Smart Bins IoT · Closed-Loop Autonomous Dispatcher
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              Facility Bins & Autonomous Batch Dispatch
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Real-time ultrasonic capacity telemetry. When receptacles approach 80% threshold, trigger automated collection batches that advance deposited items, schedule volunteer tasks, and reset sensor gauges.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            {criticalBins.length > 0 && (
              <button
                disabled={isAutoDispatching}
                onClick={handleAutoDispatchAllCritical}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                {isAutoDispatching ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <Zap className="w-4 h-4 text-slate-950 fill-current" />
                )}
                <span>Auto-Dispatch All Critical ({criticalBins.length} Bins)</span>
              </button>
            )}

            <button
              onClick={loadBins}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Refresh Telemetry</span>
            </button>
          </div>
        </div>

        {/* Live Operational Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Monitored IoT Bins</span>
            <div className="text-2xl font-mono font-bold text-white flex items-center gap-2">
              {bins.length}
              <span className="text-xs font-normal text-emerald-400">Online</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Critical Overfill Alert</span>
            <div className="text-2xl font-mono font-bold text-amber-400 flex items-center gap-2">
              {criticalBins.length}
              {criticalBins.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                  Needs Pickup
                </span>
              )}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Items Staged in Bins</span>
            <div className="text-2xl font-mono font-bold text-blue-400">
              {totalWaitingItems}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Telemetry Mesh</span>
            <div className="text-2xl font-mono font-bold text-emerald-400 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              99.8%
            </div>
          </div>
        </div>
      </div>

      {/* Dispatched Batch Notification Banner */}
      {dispatchResult && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Collection Batch Dispatched Successfully</span>
                <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {dispatchResult.batchId}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Advanced <span className="font-bold text-emerald-400">{dispatchResult.collectedCount} deposited items</span> from <span className="text-white font-mono">{dispatchResult.station}</span> into status <span className="text-emerald-400 font-mono">'collected'</span>. Ultrasonic bin gauge reset to 0% and volunteer transport task scheduled.
              </p>
            </div>
          </div>

          <button
            onClick={() => setDispatchResult(null)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white shrink-0 self-end md:self-auto cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'Station A', 'Station B', 'Station C'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStation(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterStation === st
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st === 'all' ? 'All Stations' : st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Capacity Filter:</span>
          <div className="inline-flex rounded-lg border border-slate-800 bg-slate-950 p-0.5">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterStatus === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('critical')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterStatus === 'critical' ? 'bg-red-500/30 text-red-300 font-semibold border border-red-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overfill (&gt;75%)
            </button>
            <button
              onClick={() => setFilterStatus('normal')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterStatus === 'normal' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Normal
            </button>
          </div>
        </div>
      </div>

      {/* Bins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(bin => {
          const isNearFull = bin.fillPercentage >= 75;
          const isCritical = bin.fillPercentage >= 85;
          const isProcessing = emptyingId === bin.id;

          return (
            <div
              key={bin.id}
              className={`rounded-3xl border bg-slate-900/60 p-6 flex flex-col justify-between transition-all ${
                isCritical 
                  ? 'border-red-500/60 bg-gradient-to-b from-red-950/20 to-slate-900/80 shadow-xl shadow-red-950/30 ring-1 ring-red-500/40' 
                  : isNearFull 
                  ? 'border-amber-500/50 bg-gradient-to-b from-amber-950/15 to-slate-900/80' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Stream Badge & Critical Tag */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className={`px-2.5 py-1 rounded-lg border font-mono uppercase text-[10px] font-bold ${getBinBadgeClass(bin.binColor)}`}>
                    {bin.binColor} Stream · {bin.category}
                  </span>
                  
                  {isCritical ? (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1 font-bold animate-pulse">
                      <AlertTriangle className="w-3 h-3" />
                      Critical Overfill
                    </span>
                  ) : isNearFull ? (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Approaching Cap
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Normal Capacity
                    </span>
                  )}
                </div>

                {/* ID & Station */}
                <h3 className="font-display font-bold text-xl text-white tracking-tight flex items-center justify-between">
                  <span>{bin.id}</span>
                  <span className="text-xs font-mono text-slate-400 font-normal">
                    {bin.capacityLiters}L Cap
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{bin.station}</span>
                </p>

                {/* Ultrasonic Fill Level Gauge */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Radio className={`w-3 h-3 ${isCritical ? 'text-red-400 animate-ping' : 'text-emerald-400'}`} />
                      Ultrasonic Sensor Fill:
                    </span>
                    <span className={`font-mono font-bold text-sm ${
                      isCritical ? 'text-red-400' : isNearFull ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {bin.fillPercentage}%
                    </span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCritical 
                          ? 'bg-gradient-to-r from-amber-500 to-red-500' 
                          : isNearFull 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(bin.fillPercentage, 3)}%` }}
                    />
                  </div>
                </div>

                {/* Sensor telemetry row */}
                <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{bin.itemCount} deposits waiting</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Battery: 98% (Solar)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Core: 21.4°C</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Cycle: OK</span>
                  </div>
                </div>
              </div>

              {/* Action Button: Dispatch Collection Batch */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500 font-mono">
                  Emptied: {new Date(bin.lastEmptied).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleDispatchBatch(bin)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isCritical
                      ? 'bg-red-500 hover:bg-red-400 text-slate-950 shadow-lg shadow-red-500/25'
                      : isNearFull
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                  title="Advances items in this bin from 'disposed' to 'collected' and assigns volunteer pickup"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <Truck className="w-3.5 h-3.5" />
                      <span>Dispatch Batch</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
