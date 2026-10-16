import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Award,
  Leaf,
  Layers,
  ArrowRight,
  QrCode,
  ShieldCheck,
  Cpu,
  Copy,
  ExternalLink
} from 'lucide-react';
import type { WasteItem, BinColor } from '../types/ecosort.ts';

interface ItemDetailModalProps {
  item: WasteItem | null;
  onClose: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const [copied, setCopied] = useState(false);

  const getBinBadgeColor = (color: BinColor) => {
    switch (color) {
      case 'blue': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'green': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'brown': return 'bg-amber-600/20 text-amber-300 border-amber-600/30';
      case 'red': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-slate-700/30 text-slate-300 border-slate-600/30';
    }
  };

  const passportUrl = `${window.location.origin}/api/materials/${item.id}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(passportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Verified Material Passport
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${getBinBadgeColor(item.binColor)}`}>
            {item.binColor} Bin · {item.category}
          </span>
          <span className="text-xs font-mono font-bold text-slate-300">
            {item.id}
          </span>
        </div>

        <h2 className="text-2xl font-display font-bold text-white tracking-tight">
          {item.name}
        </h2>

        {/* Image & Quick Info */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 my-5">
          <div className="sm:col-span-5 relative group">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-48 rounded-2xl object-cover border border-slate-800 bg-slate-950"
              referrerPolicy="no-referrer"
            />
            {item.boundingBox && (
              <div 
                className="absolute border-2 border-emerald-400 rounded bg-emerald-500/10 pointer-events-none"
                style={{
                  top: '15%',
                  left: '18%',
                  width: '64%',
                  height: '70%'
                }}
              >
                <span className="absolute -top-3 left-1 bg-emerald-500 text-slate-950 text-[9px] font-mono font-bold px-1 rounded">
                  {Math.round((item.confidence || 0.94) * 100)}% Match
                </span>
              </div>
            )}
          </div>

          <div className="sm:col-span-7 space-y-2.5 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Material:</span>
                <span className="font-semibold text-slate-200">{item.material}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Vision Engine:</span>
                <span className="font-mono text-emerald-400 font-semibold uppercase flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  {item.engine === 'yolo' ? 'YOLOv8 Edge' : 'Gemini 3.8 Flash'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Decomposition:</span>
                <span className="font-mono text-slate-200">{item.decompositionTime}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Intake Station:</span>
                <span className="text-slate-200">{item.station}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Confirmed Deposit:</span>
                <span className="font-mono font-semibold uppercase text-emerald-400">
                  {item.confirmedBin ? `${item.confirmedBin} Bin` : 'Pending'}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 leading-relaxed px-1">
              <span className="font-semibold text-slate-300">Instructions:</span> {item.recyclingInstructions}
            </div>
          </div>
        </div>

        {/* QR Code Traceability Block (Phase 10.F) */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3.5">
            {/* SVG Procedural QR Code Visual */}
            <div className="w-14 h-14 bg-white p-1 rounded-xl shrink-0 flex items-center justify-center shadow-md">
              <svg viewBox="0 0 29 29" className="w-full h-full text-slate-950 fill-current">
                {/* 3 corner finder patterns */}
                <rect x="0" y="0" width="7" height="7" rx="1"/>
                <rect x="1" y="1" width="5" height="5" fill="white"/>
                <rect x="2" y="2" width="3" height="3"/>
                
                <rect x="22" y="0" width="7" height="7" rx="1"/>
                <rect x="23" y="1" width="5" height="5" fill="white"/>
                <rect x="24" y="2" width="3" height="3"/>
                
                <rect x="0" y="22" width="7" height="7" rx="1"/>
                <rect x="1" y="23" width="5" height="5" fill="white"/>
                <rect x="2" y="24" width="3" height="3"/>

                {/* Data modules */}
                <rect x="9" y="3" width="2" height="2"/>
                <rect x="13" y="1" width="2" height="2"/>
                <rect x="17" y="4" width="2" height="2"/>
                <rect x="3" y="10" width="2" height="2"/>
                <rect x="9" y="9" width="4" height="2"/>
                <rect x="15" y="11" width="3" height="2"/>
                <rect x="10" y="15" width="2" height="4"/>
                <rect x="14" y="18" width="4" height="2"/>
                <rect x="20" y="10" width="2" height="3"/>
                <rect x="24" y="15" width="3" height="2"/>
                <rect x="20" y="22" width="4" height="2"/>
                <rect x="10" y="24" width="3" height="3"/>
              </svg>
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5" />
                Auditable Chain-of-Custody QR
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Scan or copy lookup payload for MRF sorting balers and certified recycling verifiers.
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyLink}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-200 flex items-center gap-1.5 transition-colors shrink-0"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy API Link</span>
              </>
            )}
          </button>
        </div>

        {/* Mismatch Alert Box if Disputed */}
        {item.disputed && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-300">Audit Discrepancy:</div>
              <div>{item.disputeReason}</div>
              {item.volunteerNotes && (
                <div className="mt-1 text-slate-300 italic">Volunteer Note: {item.volunteerNotes}</div>
              )}
            </div>
          </div>
        )}

        {/* Chronological Lifecycle Timeline */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            Immutable Audit Trail & Chain of Custody
          </h4>

          <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {item.lifecycleHistory.map((entry, idx) => {
              return (
                <div key={idx} className="relative">
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-emerald-400 flex items-center justify-center" />
                  
                  <div className="text-xs font-semibold text-slate-200 flex items-center justify-between gap-2">
                    <span className="uppercase font-mono text-emerald-400">{entry.status}</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date(entry.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 mt-0.5">
                    {entry.actor}
                  </div>

                  {entry.note && (
                    <div className="text-[11px] text-slate-400 mt-1 italic">
                      "{entry.note}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
