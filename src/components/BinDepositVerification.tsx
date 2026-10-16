import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  Flame, 
  ArrowRight,
  RefreshCw,
  Info
} from 'lucide-react';
import type { WasteItem, BinColor, UserAccount } from '../types/ecosort.ts';
import { confirmItemBin } from '../services/apiClient.ts';

interface BinDepositVerificationProps {
  currentUser: UserAccount;
  items: WasteItem[];
  onScanNew: () => void;
  onUpdateItem: (item: WasteItem) => void;
  onUpdateCredits: (credits: number) => void;
}

export const BinDepositVerification: React.FC<BinDepositVerificationProps> = ({
  currentUser,
  items,
  onScanNew,
  onUpdateItem,
  onUpdateCredits
}) => {
  // Find pending or most recent item that can be verified
  const unconfirmedItem = items.find(i => !i.confirmedBin) || items[0];
  const [selectedItem, setSelectedItem] = useState<WasteItem | undefined>(unconfirmedItem);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultStatus, setResultStatus] = useState<{
    confirmed: boolean;
    isMatch?: boolean;
    creditsAwarded?: number;
    confirmedBin?: BinColor;
  }>({ confirmed: false });

  const activeItem = selectedItem || unconfirmedItem;

  const handleDeposit = async (binColor: BinColor) => {
    if (!activeItem) return;

    try {
      setIsSubmitting(true);
      const res = await confirmItemBin(activeItem.id, binColor, currentUser.id);
      setResultStatus({
        confirmed: true,
        isMatch: res.isMatch,
        creditsAwarded: res.creditsAwarded,
        confirmedBin: binColor
      });
      onUpdateItem(res.item);
      if (res.isMatch) {
        onUpdateCredits(currentUser.credits + res.creditsAwarded);
      }
    } catch (err: any) {
      alert('Verification failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="relative rounded-3xl p-8 overflow-hidden border border-emerald-500/30 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-lime-400" />
            Closed-Loop Deposit Trust Protocol
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Bin Deposit Confirmation & Verification
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Eliminate contamination and claim your verified eco-credits by confirming the physical receptacle where you deposited your packaging.
          </p>
        </div>
      </div>

      {activeItem ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
          
          {/* Active Item Details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-4">
              <img
                src={activeItem.imageUrl}
                alt={activeItem.name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
              />
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  {activeItem.id}
                </span>
                <h3 className="font-display font-bold text-lg text-white mt-1">
                  {activeItem.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Material: <span className="text-slate-200">{activeItem.material}</span> · Detected by {activeItem.engine || 'Gemini Vision AI'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-slate-500">AI Prescribed Receptacle</div>
              <div className={`text-base font-bold uppercase font-mono mt-0.5 ${
                activeItem.binColor === 'blue' ? 'text-blue-400' :
                activeItem.binColor === 'green' ? 'text-emerald-400' :
                activeItem.binColor === 'brown' ? 'text-amber-500' : 'text-red-400'
              }`}>
                {activeItem.binColor} Bin ({activeItem.category})
              </div>
            </div>
          </div>

          {/* Result Feedback Banner */}
          {resultStatus.confirmed && (
            <div className={`p-6 rounded-2xl border space-y-2 animate-in fade-in ${
              resultStatus.isMatch
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
            }`}>
              <div className="flex items-center gap-2 text-base font-bold">
                {resultStatus.isMatch ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    <span>Verified Deposit Match! +{resultStatus.creditsAwarded} Eco-Credits Awarded</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                    <span>Bin Mismatch Reported · Routed to Volunteer Dispute Desk</span>
                  </>
                )}
              </div>
              <p className="text-xs opacity-90 leading-relaxed">
                {resultStatus.isMatch
                  ? `Excellent work! Your deposit into the ${resultStatus.confirmedBin} bin matches the AI classification. Your verified sorting streak is active.`
                  : `You indicated deposit into the ${resultStatus.confirmedBin} bin, whereas AI prescribed the ${activeItem.binColor} bin. Our volunteer audit team will verify the station batch.`}
              </p>
            </div>
          )}

          {/* 4 Interactive Bin Buttons */}
          <div>
            <div className="text-xs font-mono uppercase text-slate-400 mb-3 font-semibold">
              Step 2: Tap the physical bin you actually used at the station:
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { color: 'blue' as BinColor, label: 'Blue Bin', stream: 'Recyclables' },
                { color: 'green' as BinColor, label: 'Green Bin', stream: 'Reusable' },
                { color: 'brown' as BinColor, label: 'Brown Bin', stream: 'Compost' },
                { color: 'red' as BinColor, label: 'Red Bin', stream: 'Hazardous' }
              ].map(bin => {
                const isPrescribed = activeItem.binColor === bin.color;

                return (
                  <button
                    key={bin.color}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleDeposit(bin.color)}
                    className={`p-5 rounded-2xl border text-center transition-all relative group hover:scale-[1.02] active:scale-[0.98] ${
                      bin.color === 'blue'
                        ? 'border-blue-500/40 bg-blue-950/30 hover:bg-blue-900/40 text-blue-300'
                        : bin.color === 'green'
                        ? 'border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300'
                        : bin.color === 'brown'
                        ? 'border-amber-600/40 bg-amber-950/30 hover:bg-amber-900/40 text-amber-300'
                        : 'border-red-500/40 bg-red-950/30 hover:bg-red-900/40 text-red-300'
                    }`}
                  >
                    {isPrescribed && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold shadow">
                        Prescribed
                      </span>
                    )}
                    <div className="font-display font-bold text-base text-white">{bin.label}</div>
                    <div className="text-xs opacity-80 mt-1">{bin.stream}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick instructions footnote */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified trust-model without expensive bin hardware sensors
            </span>
            <button
              onClick={onScanNew}
              className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Scan another item</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      ) : (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center space-y-4">
          <p className="text-sm text-slate-400">No recent scans awaiting confirmation.</p>
          <button
            onClick={onScanNew}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
          >
            Launch Waste Scanner
          </button>
        </div>
      )}

    </div>
  );
};
