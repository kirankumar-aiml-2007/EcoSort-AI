import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  MapPin, 
  Award, 
  Bell, 
  Download, 
  LogOut, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2,
  FileText
} from 'lucide-react';
import type { UserAccount, WasteItem } from '../types/ecosort.ts';

interface UserProfileSettingsProps {
  currentUser: UserAccount;
  items: WasteItem[];
  onLogout: () => void;
  onUpdateStation?: (station: string) => void;
}

export const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({
  currentUser,
  items,
  onLogout,
  onUpdateStation
}) => {
  const [station, setStation] = useState(currentUser.stationOrZone || 'Station A · Main Campus Hub');
  const [notifyDaily, setNotifyDaily] = useState(true);
  const [notifyDispute, setNotifyDispute] = useState(true);
  const [notifyRewards, setNotifyRewards] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateStation) onUpdateStation(station);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportJSON = () => {
    const reportData = {
      user: currentUser,
      exportTimestamp: new Date().toISOString(),
      verifiedScansCount: items.length,
      items: items.map(i => ({
        id: i.id,
        name: i.name,
        category: i.category,
        binColor: i.binColor,
        material: i.material,
        status: i.status,
        timestamp: i.timestamp,
        creditsAwarded: i.creditsAwarded
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecosort-passport-${currentUser.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Profile Hero */}
      <div className="relative rounded-3xl p-8 overflow-hidden border border-emerald-500/30 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-lime-400 p-0.5 shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400 font-display font-bold text-2xl">
                {currentUser.name.charAt(0)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                  {currentUser.name}
                </h1>
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                <span>{currentUser.email}</span>
                <span>·</span>
                <MapPin className="w-3.5 h-3.5" />
                <span>{station}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-center"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Profile and campus preferences successfully updated!</span>
        </div>
      )}

      {/* Badges Earned Showcase */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            Verified Eco Badges & Credentials
          </h3>
          <span className="text-xs font-mono text-emerald-400">{currentUser.badges?.length || 4} Unlocked</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { title: 'Zero Contamination', desc: '10 consecutive matching deposits', icon: '🛡️' },
            { title: 'E-Waste Guardian', desc: 'Safe hazardous drop confirmed', icon: '🔋' },
            { title: '7-Day Streak', desc: 'Active sorting routine maintained', icon: '🔥' },
            { title: 'Campus Upcycler', desc: 'Completed DIY project guide', icon: '🌿' }
          ].map(b => (
            <div key={b.title} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-2xl mb-1">{b.icon}</div>
              <div className="text-xs font-bold text-white">{b.title}</div>
              <div className="text-[11px] text-slate-400 leading-snug">{b.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Form */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-display font-bold text-white">
          Preferences & Station Routing
        </h3>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Default Campus Drop-Off Station
            </label>
            <select
              value={station}
              onChange={(e) => setStation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="Station A · Main Campus Plaza">Station A · Main Campus Plaza (North Union)</option>
              <option value="Station B · Engineering Cafeteria">Station B · Engineering Cafeteria</option>
              <option value="Station C · Science Innovation Hub">Station C · Science Innovation Hub</option>
              <option value="Station D · West Residence Halls">Station D · West Residence Halls</option>
            </select>
          </div>

          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold text-slate-300">Notification Alerts</div>
            
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 cursor-pointer">
              <span>Daily circularity tip and sorting streak reminders</span>
              <input
                type="checkbox"
                checked={notifyDaily}
                onChange={(e) => setNotifyDaily(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-400/20"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 cursor-pointer">
              <span>Dispute desk resolution updates and bonus credit awards</span>
              <input
                type="checkbox"
                checked={notifyDispute}
                onChange={(e) => setNotifyDispute(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-400/20"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 cursor-pointer">
              <span>Campus rewards store restocks and locker item drops</span>
              <input
                type="checkbox"
                checked={notifyRewards}
                onChange={(e) => setNotifyRewards(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-400/20"
              />
            </label>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-800">
            <button
              type="button"
              onClick={handleExportJSON}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Material Passport (.JSON)</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
