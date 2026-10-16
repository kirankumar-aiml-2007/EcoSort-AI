import React, { useState } from 'react';
import { 
  ScanLine, 
  Layers, 
  AlertTriangle, 
  BarChart3, 
  History, 
  UserCheck, 
  ShieldCheck, 
  RotateCcw,
  Sparkles,
  Award,
  ChevronDown,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  Gift,
  Lightbulb,
  Wrench,
  ShoppingBag,
  HelpCircle,
  MapPin,
  Trophy,
  Leaf,
  Settings,
  Trash2,
  Cpu,
  Users,
  LogOut,
  Bot,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import type { UserAccount } from '../types/ecosort.ts';

export type NavigationTab = 
  // 15 User Pages
  | 'dashboard'
  | 'scanner'
  | 'deposit_confirmation'
  | 'history'
  | 'journey_tracker'
  | 'rewards_store'
  | 'ai_recommendations'
  | 'upcycling_hub'
  | 'reuse_market'
  | 'sustainability_quiz'
  | 'station_finder'
  | 'leaderboard'
  | 'digital_twin'
  | 'impact_calculator'
  | 'profile_settings'
  // Admin Pages
  | 'admin_dashboard'
  | 'pipeline'
  | 'disputes'
  | 'analytics'
  | 'digital_twin_admin'
  | 'volunteer_tasks'
  | 'smart_bins'
  | 'ai_inspector'
  | 'audit_logs';

interface NavbarProps {
  currentUser: UserAccount;
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onBack: () => void;
  onForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  disputedCount: number;
  onResetDemo: () => void;
  onLogout: () => void;
  onOpenAssistant: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onBack,
  onForward,
  canGoBack,
  canGoForward,
  disputedCount,
  onResetDemo,
  onLogout,
  onOpenAssistant
}) => {
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'volunteer';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Grouped User Pages
  const userPageGroups = [
    {
      group: 'Core Sorting & Tracking',
      pages: [
        { id: 'dashboard', label: '1. User Command Dashboard', icon: LayoutDashboard },
        { id: 'scanner', label: '2. AI Waste Vision Scanner', icon: ScanLine },
        { id: 'deposit_confirmation', label: '3. Closed-Loop Bin Deposit', icon: CheckCircle2 },
        { id: 'history', label: '4. Scan History & Passport', icon: History },
        { id: 'journey_tracker', label: '5. Lifecycle Journey Tracker', icon: Clock },
      ]
    },
    {
      group: 'Circularity & Gamification',
      pages: [
        { id: 'rewards_store', label: '6. Eco-Credits Rewards Store', icon: Gift },
        { id: 'ai_recommendations', label: '7. Personalized AI Recommendations', icon: Lightbulb },
        { id: 'upcycling_hub', label: '8. Upcycling & DIY Hub', icon: Wrench },
        { id: 'reuse_market', label: '9. Peer Reuse & Locker Exchange', icon: ShoppingBag },
        { id: 'sustainability_quiz', label: '10. Sustainability Quiz & Trivia', icon: HelpCircle },
      ]
    },
    {
      group: 'Campus & Impact Intelligence',
      pages: [
        { id: 'station_finder', label: '11. Smart Bin Station Finder', icon: MapPin },
        { id: 'leaderboard', label: '12. Campus Impact Leaderboard', icon: Trophy },
        { id: 'digital_twin', label: '13. 3D Smart Station Twin', icon: Layers },
        { id: 'impact_calculator', label: '14. Carbon & LCA Calculator', icon: Leaf },
        { id: 'profile_settings', label: '15. Profile & Eco Settings', icon: Settings },
      ]
    }
  ];

  // Admin Pages
  const adminPages = [
    { id: 'admin_dashboard', label: 'Admin Command Overview', icon: LayoutDashboard },
    { id: 'pipeline', label: 'Lifecycle Kanban Pipeline', icon: Layers },
    { id: 'disputes', label: `Contamination & Dispute Desk (${disputedCount})`, icon: AlertTriangle },
    { id: 'analytics', label: 'Operations Analytics & Heatmaps', icon: BarChart3 },
    { id: 'digital_twin_admin', label: '3D Facility Digital Twin', icon: Layers },
    { id: 'volunteer_tasks', label: 'Field Operations Queue', icon: ShieldCheck },
    { id: 'smart_bins', label: 'Facility Smart Bins IoT', icon: Trash2 },
    { id: 'ai_inspector', label: 'AI Model Diagnostics', icon: Cpu },
    { id: 'audit_logs', label: 'Users & Audit Logs', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#030e09]/95 backdrop-blur-md border-b border-emerald-950/80 px-4 sm:px-6 py-3 transition-colors shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => onSelectTab(isAdmin ? 'admin_dashboard' : 'dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-lime-400 p-0.5 shadow-md shadow-emerald-500/20">
              <div className="w-full h-full bg-[#03180f] rounded-[10px] flex items-center justify-center text-emerald-400">
                <ScanLine className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-lg tracking-tight text-white">
                  EcoFlux<span className="text-emerald-400">AI</span>
                </span>
                <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${
                  isAdmin ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {isAdmin ? 'Admin' : 'User'}
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Primary Navigation Pills */}
        <nav className="hidden lg:flex items-center gap-2 text-xs font-semibold">
          {!isAdmin ? (
            <>
              <button
                onClick={() => onSelectTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'dashboard' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => onSelectTab('scanner')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'scanner' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <ScanLine className="w-3.5 h-3.5" />
                <span>AI Scanner</span>
              </button>

              <button
                onClick={() => onSelectTab('deposit_confirmation')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'deposit_confirmation' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verify Bin</span>
              </button>

              <button
                onClick={() => onSelectTab('rewards_store')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'rewards_store' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Rewards</span>
              </button>

              <button
                onClick={() => onSelectTab('journey_tracker')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'journey_tracker' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Lifecycle</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onSelectTab('admin_dashboard')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'admin_dashboard' ? 'bg-blue-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Command</span>
              </button>

              <button
                onClick={() => onSelectTab('pipeline')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'pipeline' ? 'bg-blue-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Pipeline</span>
              </button>

              <button
                onClick={() => onSelectTab('disputes')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 relative ${
                  activeTab === 'disputes' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Disputes</span>
                {disputedCount > 0 && (
                  <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-bold">
                    {disputedCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onSelectTab('analytics')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'analytics' ? 'bg-blue-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analytics</span>
              </button>

              <button
                onClick={() => onSelectTab('digital_twin_admin')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'digital_twin_admin' ? 'bg-blue-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>3D Facility</span>
              </button>
            </>
          )}

          {/* All 15 Pages Master Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Explore All {isAdmin ? 'Admin Modules' : '15 User Pages'}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {isDropdownOpen && (
              <div 
                className="absolute top-full left-0 mt-2 w-80 max-h-[75vh] overflow-y-auto bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3 shadow-2xl backdrop-blur-xl z-50 divide-y divide-slate-800"
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                {!isAdmin ? (
                  userPageGroups.map(group => (
                    <div key={group.group} className="py-2 first:pt-0 last:pb-0">
                      <div className="text-[10px] font-mono uppercase text-emerald-400 px-2 py-1 font-bold">
                        {group.group}
                      </div>
                      <div className="space-y-0.5">
                        {group.pages.map(page => {
                          const Icon = page.icon;
                          const isActive = activeTab === page.id;
                          return (
                            <button
                              key={page.id}
                              onClick={() => {
                                onSelectTab(page.id as NavigationTab);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
                                isActive ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{page.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-1 space-y-1">
                    <div className="text-[10px] font-mono uppercase text-blue-400 px-2 py-1 font-bold">
                      Admin Command Console Modules
                    </div>
                    {adminPages.map(page => {
                      const Icon = page.icon;
                      const isActive = activeTab === page.id;
                      return (
                        <button
                          key={page.id}
                          onClick={() => {
                            onSelectTab(page.id as NavigationTab);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
                            isActive ? 'bg-blue-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{page.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Right Section: Role Quick Toggle, Credits & Logout */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950/70 p-1">
            <button
              onClick={onBack}
              disabled={!canGoBack}
              title={canGoBack ? 'Go back' : 'No previous page'}
              aria-label="Go back"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onForward}
              disabled={!canGoForward}
              title={canGoForward ? 'Go forward' : 'No next page'}
              aria-label="Go forward"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          {/* Ask AI quick button */}
          <button
            onClick={onOpenAssistant}
            title="Ask AI Circularity Specialist"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50 text-xs font-semibold transition-colors"
          >
            <Bot className="w-3.5 h-3.5 text-lime-400" />
            <span>AI Assistant</span>
          </button>

          {/* Active Account Status Badge (No role switching permitted while logged in) */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs shadow-sm ${
            isAdmin 
              ? 'border-blue-500/30 bg-blue-950/40 text-blue-200' 
              : 'border-emerald-500/30 bg-emerald-950/40 text-emerald-200'
          }`}>
            {isAdmin ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-semibold hidden sm:inline">
                  {currentUser.isMainAdmin ? 'Main Admin' : 'Verified Admin'}
                </span>
                <span className="text-[10px] text-blue-300 font-mono hidden md:inline">
                  ({currentUser.name})
                </span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold hidden sm:inline">Citizen</span>
                <span className="text-[10px] text-emerald-300 font-mono hidden md:inline">
                  ({currentUser.name})
                </span>
              </>
            )}
          </div>

          {/* Credits Counter */}
          {!isAdmin && (
            <div className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono font-bold">{currentUser.credits}</span>
              <span className="text-[10px] text-emerald-400/80">pts</span>
            </div>
          )}

          {/* Reset Demo State */}
          <button
            onClick={onResetDemo}
            title="Reset Demo Dataset"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            title="Log Out to Authentication Gate"
            className="p-2 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-500/20 text-red-300 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};
