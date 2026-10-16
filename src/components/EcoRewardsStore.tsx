import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Gift, 
  Coffee, 
  ShoppingBag, 
  TreePine, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Tag
} from 'lucide-react';
import type { RewardItem, UserAccount } from '../types/ecosort.ts';
import { fetchRewards, claimRewardItem } from '../services/apiClient.ts';

interface EcoRewardsStoreProps {
  currentUser: UserAccount;
  onUpdateUserCredits: (newCredits: number) => void;
}

export const EcoRewardsStore: React.FC<EcoRewardsStoreProps> = ({
  currentUser,
  onUpdateUserCredits
}) => {
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  useEffect(() => {
    fetchRewards().then(setRewards).catch(() => {});
  }, []);

  const filteredRewards = rewards.filter(r => {
    if (filterCategory === 'all') return true;
    return r.category === filterCategory;
  });

  const handleClaim = async (reward: RewardItem) => {
    if (currentUser.credits < reward.creditCost) {
      setClaimError(`Insufficient credits. You need ${reward.creditCost - currentUser.credits} more eco-credits to claim this.`);
      setTimeout(() => setClaimError(null), 4000);
      return;
    }

    try {
      setClaimingId(reward.id);
      setClaimError(null);
      const res = await claimRewardItem(reward.id, currentUser.id);
      if (res.success && res.user) {
        onUpdateUserCredits(res.user.credits);
        setClaimSuccess(`Successfully claimed "${reward.title}"! Voucher code sent to ${currentUser.email}.`);
        setTimeout(() => setClaimSuccess(null), 5000);
        // Refresh rewards stock
        fetchRewards().then(setRewards);
      } else {
        setClaimError(res.error || 'Failed to claim item');
      }
    } catch (err: any) {
      setClaimError(err.message || 'Error claiming reward');
    } finally {
      setClaimingId(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'voucher': return <Coffee className="w-4 h-4 text-amber-400" />;
      case 'gear': return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
      case 'donation': return <TreePine className="w-4 h-4 text-lime-400" />;
      default: return <Gift className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl p-8 overflow-hidden border border-emerald-500/30 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Verified Circular Economy Marketplace
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              Eco-Credits & Rewards Store
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Redeem your verified eco-credits earned by properly sorting waste and keeping bins contaminant-free.
            </p>
          </div>

          {/* User Credits Card */}
          <div className="p-5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 backdrop-blur-md flex flex-col items-center justify-center shrink-0 min-w-[200px]">
            <div className="text-xs text-emerald-300 font-mono uppercase">Your Available Credits</div>
            <div className="text-4xl font-mono font-extrabold text-white mt-1 flex items-baseline gap-1">
              <span>{currentUser.credits}</span>
              <span className="text-emerald-400 text-lg">pts</span>
            </div>
            <div className="text-[11px] text-emerald-300/80 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-lime-400" />
              <span>{currentUser.rank}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {claimSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium">{claimSuccess}</span>
        </div>
      )}

      {claimError && (
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span className="font-medium">{claimError}</span>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        {['all', 'voucher', 'gear', 'donation', 'workshop'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
              filterCategory === cat
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat === 'all' ? 'All Rewards' : cat}
          </button>
        ))}
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRewards.map(reward => {
          const canAfford = currentUser.credits >= reward.creditCost;
          const isClaiming = claimingId === reward.id;

          return (
            <div
              key={reward.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between hover:border-slate-700 transition-all hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 capitalize">
                    {getCategoryIcon(reward.category)}
                    <span>{reward.category}</span>
                  </div>
                  <div className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{reward.stock} in stock</span>
                  </div>
                </div>

                <h3 className="font-display font-bold text-lg text-white">
                  {reward.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {reward.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-500">Cost</div>
                  <div className="text-xl font-mono font-bold text-white flex items-baseline gap-1">
                    <span>{reward.creditCost}</span>
                    <span className="text-xs text-emerald-400 font-normal">pts</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canAfford || isClaiming || reward.stock <= 0}
                  onClick={() => handleClaim(reward)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    canAfford && reward.stock > 0
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                  }`}
                >
                  {isClaiming ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : reward.stock <= 0 ? (
                    <span>Out of Stock</span>
                  ) : canAfford ? (
                    <>
                      <Gift className="w-3.5 h-3.5" />
                      <span>Claim Reward</span>
                    </>
                  ) : (
                    <span>Need {reward.creditCost - currentUser.credits} pts</span>
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
