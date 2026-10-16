import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Trash2, 
  Navigation, 
  Layers, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import type { SmartBin, BinColor } from '../types/ecosort.ts';
import { fetchSmartBins } from '../services/apiClient.ts';

const STATIONS_METADATA = [
  {
    id: 'station-a',
    name: 'Station A · Main Campus Plaza',
    building: 'Student Union North',
    distance: '85m away',
    walkingTime: '1 min walk',
    hours: '24/7 Accessible',
    coordinates: '37.7749° N, 122.4194° W',
    features: ['Solar Powered Compactor', 'E-Waste Smart Locker', 'AI Optical Verify', 'Free Hand Sanitizer']
  },
  {
    id: 'station-b',
    name: 'Station B · Engineering Cafeteria',
    building: 'Hall of Engineering - Level 1',
    distance: '210m away',
    walkingTime: '3 min walk',
    hours: '06:00 AM - 11:00 PM',
    coordinates: '37.7758° N, 122.4180° W',
    features: ['High-Capacity Compost Bin', 'Thermal Food Box Washer', 'Live Contamination Cam']
  },
  {
    id: 'station-c',
    name: 'Station C · Science Innovation Hub',
    building: 'BioTech Quad - East Wing',
    distance: '340m away',
    walkingTime: '4 min walk',
    hours: '24/7 Accessible',
    coordinates: '37.7735° N, 122.4210° W',
    features: ['Battery Safe-Deposit Slot', 'Chemical Reagent Locker', 'Certified E-Waste Quarantine']
  },
  {
    id: 'station-d',
    name: 'Station D · West Residence Halls',
    building: 'Dormitory Quadrangle Courtyard',
    distance: '520m away',
    walkingTime: '6 min walk',
    hours: '24/7 Accessible',
    features: ['Cardboard Baler', 'Glass Bottle Sorter', 'Peer Reuse Swap Box']
  }
];

export const SmartBinStationFinder: React.FC = () => {
  const [bins, setBins] = useState<SmartBin[]>([]);
  const [selectedStationId, setSelectedStationId] = useState('station-a');
  const [copiedCoords, setCopiedCoords] = useState(false);

  useEffect(() => {
    fetchSmartBins().then(setBins).catch(() => {});
  }, []);

  const activeStation = STATIONS_METADATA.find(s => s.id === selectedStationId) || STATIONS_METADATA[0];

  const getBinColorClass = (color: BinColor) => {
    switch (color) {
      case 'blue': return 'bg-blue-500 text-blue-400 border-blue-500/30';
      case 'green': return 'bg-emerald-500 text-emerald-400 border-emerald-500/30';
      case 'brown': return 'bg-amber-600 text-amber-500 border-amber-600/30';
      case 'red': return 'bg-red-500 text-red-400 border-red-500/30';
      default: return 'bg-slate-500 text-slate-400 border-slate-500/30';
    }
  };

  const stationBins = bins.filter(b => b.station.includes(activeStation.name.split('·')[0].trim()));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="relative rounded-3xl p-8 overflow-hidden border border-emerald-500/30 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Smart Drop-Off Telemetry
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Smart Bin Station Finder & Map
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Locate 4-stream drop-off points, check real-time bin capacity before heading out, and find designated e-waste hazardous safe-lockers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Station Directory */}
        <div className="space-y-4">
          <div className="text-xs font-mono uppercase text-slate-400 font-semibold">
            Campus Drop-Off Stations
          </div>

          <div className="space-y-3">
            {STATIONS_METADATA.map(station => {
              const isSelected = station.id === selectedStationId;

              return (
                <div
                  key={station.id}
                  onClick={() => setSelectedStationId(station.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/30 shadow-lg'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-emerald-400">{station.distance}</span>
                    <span className="text-slate-500 text-[11px]">{station.walkingTime}</span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-white">
                    {station.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {station.building}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Station Telemetry & Interactive Map Mockup */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="text-xs font-mono uppercase text-emerald-400 mb-1 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5" />
                Active Station Telemetry
              </div>
              <h2 className="text-2xl font-display font-bold text-white">
                {activeStation.name}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {activeStation.building} · {activeStation.hours}
              </p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard?.writeText(activeStation.coordinates || 'Campus Station');
                setCopiedCoords(true);
                setTimeout(() => setCopiedCoords(false), 2000);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white flex items-center gap-2 transition-colors shrink-0"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>{copiedCoords ? 'Coordinates Copied!' : 'Navigate (GPS)'}</span>
            </button>
          </div>

          {/* Interactive Campus Map Visualizer */}
          <div className="relative h-64 rounded-2xl bg-[#071318] border border-slate-800 overflow-hidden flex items-center justify-center">
            {/* Grid background */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />

            {/* Stylized road & quadrant lines */}
            <div className="absolute inset-x-0 top-1/2 h-1 bg-slate-800/80 -translate-y-1/2" />
            <div className="absolute inset-y-0 left-1/3 w-1 bg-slate-800/80" />
            <div className="absolute inset-y-0 right-1/4 w-1 bg-slate-800/80" />

            {/* Station Pins */}
            {STATIONS_METADATA.map((s, idx) => {
              const isCurrent = s.id === selectedStationId;
              const posClasses = [
                'left-1/3 top-1/2 -translate-x-1/2 -translate-y-1/2',
                'left-2/3 top-1/3 -translate-x-1/2 -translate-y-1/2',
                'left-1/4 top-2/3 -translate-x-1/2 -translate-y-1/2',
                'right-1/4 top-3/4 -translate-x-1/2 -translate-y-1/2'
              ][idx % 4];

              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedStationId(s.id)}
                  className={`absolute ${posClasses} cursor-pointer group flex flex-col items-center z-10`}
                >
                  <div className={`p-2 rounded-full transition-all ${
                    isCurrent
                      ? 'bg-emerald-500 text-slate-950 scale-125 shadow-lg shadow-emerald-500/50'
                      : 'bg-slate-900 border border-slate-700 text-slate-300 group-hover:border-emerald-400'
                  }`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="mt-1 px-2 py-0.5 rounded-md bg-slate-950/90 border border-slate-800 text-[10px] font-mono whitespace-nowrap text-white">
                    {s.name.split('·')[0]}
                  </div>
                </div>
              );
            })}

            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 font-mono">
              GPS: {activeStation.coordinates}
            </div>
          </div>

          {/* 4 Stream Bins Telemetry at this station */}
          <div>
            <h4 className="text-xs font-mono uppercase text-slate-400 mb-3 font-semibold">
              Live Bin Fill Levels & Ultrasonic Sensor Telemetry
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'Blue (Recyclable)', color: 'blue' as BinColor, fill: 42, count: 28 },
                { name: 'Green (Reusable)', color: 'green' as BinColor, fill: 18, count: 6 },
                { name: 'Brown (Compost)', color: 'brown' as BinColor, fill: 68, count: 34 },
                { name: 'Red (E-Waste)', color: 'red' as BinColor, fill: 85, count: 12, alert: true }
              ].map(b => (
                <div key={b.name} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{b.name.split(' ')[0]}</span>
                    <span className="font-mono text-xs">{b.fill}%</span>
                  </div>

                  {/* Fill progress bar */}
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${b.fill > 80 ? 'bg-red-500' : b.fill > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${b.fill}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{b.count} items inside</span>
                    {b.alert && <span className="text-red-400 font-mono">Near Full</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Station Features */}
          <div>
            <h4 className="text-xs font-mono uppercase text-slate-400 mb-2 font-semibold">
              Available Station Amenities
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeStation.features.map((feat, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
