import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import type { UserAccount, UserRole } from '../types/ecosort.ts';
import { loginUser } from '../services/apiClient.ts';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  if (!isOpen) return null;

  const [email, setEmail] = useState('citizen@ecosort.ai');
  const [password, setPassword] = useState('recycle2026');
  const [role, setRole] = useState<UserRole>('citizen');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const user = await loginUser(email, role);
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemoCitizen = () => {
    setEmail('citizen@ecosort.ai');
    setPassword('recycle2026');
    setRole('citizen');
  };

  const handleFillDemoVolunteer = () => {
    setEmail('volunteer@ecosort.ai');
    setPassword('greenops2026');
    setRole('volunteer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand & Heading */}
        <div className="mb-6">
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1">
            Standard Authentication & Role Access
          </div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">
            Sign In to EcoSort AI
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your personalized sorting profile or the volunteer operations command console.
          </p>
        </div>

        {/* Quick Demo Credentials Fill Buttons */}
        <div className="mb-5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            1-Click Hackathon Presenter Credentials
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleFillDemoCitizen}
              className="py-1.5 px-2.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-300 text-xs font-medium text-left transition-colors flex items-center justify-between"
            >
              <span>Citizen Recycler</span>
              <span className="text-[10px] text-emerald-400/80">Alex</span>
            </button>

            <button
              type="button"
              onClick={handleFillDemoVolunteer}
              className="py-1.5 px-2.5 rounded-lg border border-blue-500/30 bg-blue-950/20 hover:bg-blue-900/30 text-blue-300 text-xs font-medium text-left transition-colors flex items-center justify-between"
            >
              <span>Ops Volunteer</span>
              <span className="text-[10px] text-blue-400/80">Elena</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800/60 text-red-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                placeholder="name@ecosort.ai"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Role selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Role Access Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('citizen')}
                className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  role === 'citizen'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Citizen Recycler
              </button>

              <button
                type="button"
                onClick={() => setRole('volunteer')}
                className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  role === 'volunteer'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Operations Volunteer
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-2 mt-5 shadow-sm"
          >
            {isLoading ? 'Signing In...' : 'Authenticate & Enter Console'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
};
