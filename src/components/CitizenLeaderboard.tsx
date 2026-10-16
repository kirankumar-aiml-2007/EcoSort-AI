import React, { useState } from 'react';
import { 
  Award, 
  Trophy, 
  Medal, 
  Flame, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Users,
  Search
} from 'lucide-react';
import type { UserAccount } from '../types/ecosort.ts';

interface CitizenLeaderboardProps {
  currentUser: UserAccount;
}

const MOCK_LEADERBOARD = [
  {
    rank: 1,
    name: 'Maya Lin',
    campusZone: 'West Campus · Quad 3',
    credits: 480,
    itemsRecycled: 42,
    co2Kg: 52.4,
    streak: 24,
    badge: 'Zero-Waste Champion'
  },
  {
    rank: 2,
    name: 'Julian Chen',
    campusZone: 'Engineering Wing · Sector B',
    credits: 395,
    itemsRecycled: 36,
    co2Kg: 44.1,
    streak: 18,
    badge: 'E-Waste Safeguard'
  },
  {
    rank: 3,
    name: 'Elena Rostova (Volunteer)',
    campusZone: 'Central Ops · Sector Alpha',
    credits: 320,
    itemsRecycled: 29,
    co2Kg: 38.6,
    streak: 14,
    badge: 'Compost Master'
  },
  {
    rank: 4,
    name: 'Alex Rivera (You)',
    campusZone: 'West Campus Hub · Station A',
    credits: 195,
    itemsRecycled: 14,
    co2Kg: 18.4,
    streak: 7,
    badge: 'Eco Guardian'
  },
  {
    rank: 5,
    name: 'David Kim',
    campusZone: 'Science Hub · Hall 2',
    credits: 160,
    itemsRecycled: 12,
    co2Kg: 15.2,
    streak: 5,
    badge: 'Glass Sorter'
  },
  {
    rank: 6,
    name: 'Sarah Connor',
    campusZone: 'Dormitory North · Block A',
    credits: 140,
    itemsRecycled: 10,
    co2Kg: 12.8,
    streak: 4,
    badge: 'Paper Baler'
  }
];

export const CitizenLeaderboard: React.FC<CitizenLeaderboardProps> = ({ currentUser }) => {
  const [filterType, setFilterType] = useState<'individual' | 'dorms'>('individual');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="relative rounded-3xl p-8 overflow-hidden border border-emerald-500/30 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Community Circularity Standings
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              Campus Leaderboard & Impact Rankings
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Celebrate the top recyclers, compare departmental performance, and climb the tiers by properly verifying waste deposits.
            </p>
          </div>

          {/* Current user tier card */}
          <div className="p-5 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Medal className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Your Current Rank</div>
              <div className="text-lg font-display font-bold text-white">#4 Campus Wide</div>
              <div className="text-xs text-emerald-400 font-mono">{currentUser.rank}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterType('individual')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'individual'
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Individual Citizens
        </button>
        <button
          onClick={() => setFilterType('dorms')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'dorms'
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Dormitories & Facilities
        </button>
      </div>

      {filterType === 'individual' ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 text-slate-400 font-mono uppercase border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Rank</th>
                  <th className="py-4 px-6">Citizen Recycler</th>
                  <th className="py-4 px-6">Campus Zone</th>
                  <th className="py-4 px-6 text-right">Items Verified</th>
                  <th className="py-4 px-6 text-right">CO2 Diverted</th>
                  <th className="py-4 px-6 text-right">Eco-Credits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {MOCK_LEADERBOARD.map(entry => {
                  const isCurrent = entry.name.includes('You');

                  return (
                    <tr
                      key={entry.rank}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isCurrent ? 'bg-emerald-950/30 border-l-4 border-l-emerald-500' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {entry.rank === 1 && <Trophy className="w-4 h-4 text-amber-400" />}
                          {entry.rank === 2 && <Medal className="w-4 h-4 text-slate-300" />}
                          {entry.rank === 3 && <Medal className="w-4 h-4 text-amber-600" />}
                          <span className="font-mono font-bold text-white text-sm">#{entry.rank}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{entry.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400">
                            {entry.badge}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {entry.campusZone}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-slate-300">
                        {entry.itemsRecycled} items
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-emerald-400">
                        {entry.co2Kg} kg
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="font-mono font-bold text-emerald-300 text-sm">
                          {entry.credits}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1">pts</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'West Campus Quad', rate: '89.4%', score: 1420, lead: 'Maya Lin' },
            { name: 'Engineering Sector B', rate: '84.1%', score: 1180, lead: 'Julian Chen' },
            { name: 'BioTech Sciences Quad', rate: '81.7%', score: 960, lead: 'Alex Rivera' }
          ].map((dorm, idx) => (
            <div key={dorm.name} className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-emerald-400">#{idx + 1} Dorm Division</span>
                <span className="text-slate-400">{dorm.rate} Recycling Rate</span>
              </div>
              <h3 className="text-xl font-display font-bold text-white">{dorm.name}</h3>
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-500">Cumulative Credits</div>
                  <div className="text-xl font-mono font-bold text-white">{dorm.score} pts</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono uppercase text-slate-500">Quad Lead</div>
                  <div className="text-xs text-emerald-300 font-semibold">{dorm.lead}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
