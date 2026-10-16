/**
 * EcoSort AI / EcoFlux AI - Smart Recycling & Circular Economy Intelligence Platform
 */

import React, { useState, useEffect, useRef } from 'react';
import { Navbar, type NavigationTab } from './components/Navbar.tsx';
import { AuthScreen } from './components/AuthScreen.tsx';
import { CommandDashboard } from './components/CommandDashboard.tsx';
import { CitizenScanner } from './components/CitizenScanner.tsx';
import { BinDepositVerification } from './components/BinDepositVerification.tsx';
import { CitizenHistory } from './components/CitizenHistory.tsx';
import { MaterialJourneyTracker } from './components/MaterialJourneyTracker.tsx';
import { EcoRewardsStore } from './components/EcoRewardsStore.tsx';
import { AIRecommendations } from './components/AIRecommendations.tsx';
import { UpcyclingHub } from './components/UpcyclingHub.tsx';
import { ReuseMarketplace } from './components/ReuseMarketplace.tsx';
import { SustainabilityQuiz } from './components/SustainabilityQuiz.tsx';
import { SmartBinStationFinder } from './components/SmartBinStationFinder.tsx';
import { CitizenLeaderboard } from './components/CitizenLeaderboard.tsx';
import { CarbonImpactCalculator } from './components/CarbonImpactCalculator.tsx';
import { UserProfileSettings } from './components/UserProfileSettings.tsx';

// Admin / Volunteer Components
import { VolunteerPipeline } from './components/VolunteerPipeline.tsx';
import { DisputeDesk } from './components/DisputeDesk.tsx';
import { OperationsAnalytics } from './components/OperationsAnalytics.tsx';
import { DigitalTwin3D } from './components/DigitalTwin3D.tsx';
import { VolunteerOperations } from './components/VolunteerOperations.tsx';
import { SmartBinsManagement } from './components/SmartBinsManagement.tsx';
import { AIModelInspector } from './components/AIModelInspector.tsx';
import { UsersAndAuditLogs } from './components/UsersAndAuditLogs.tsx';

// Modals
import { ItemDetailModal } from './components/ItemDetailModal.tsx';
import { EcoAssistant } from './components/EcoAssistant.tsx';

import { 
  fetchAllScans, 
  fetchAnalytics, 
  fetchSmartBins, 
  fetchVolunteerTasks, 
  resetDemoData 
} from './services/apiClient.ts';
import type { 
  UserAccount, 
  WasteItem, 
  AnalyticsSummary, 
  SmartBin, 
  VolunteerTask 
} from './types/ecosort.ts';
import { X, Sparkles, MessageSquare } from 'lucide-react';

const NAVIGATION_TABS: NavigationTab[] = [
  'dashboard',
  'scanner',
  'deposit_confirmation',
  'history',
  'journey_tracker',
  'rewards_store',
  'ai_recommendations',
  'upcycling_hub',
  'reuse_market',
  'sustainability_quiz',
  'station_finder',
  'leaderboard',
  'digital_twin',
  'impact_calculator',
  'profile_settings',
  'admin_dashboard',
  'pipeline',
  'disputes',
  'analytics',
  'digital_twin_admin',
  'volunteer_tasks',
  'smart_bins',
  'ai_inspector',
  'audit_logs',
];

interface EcoSortHistoryState {
  ecoSortNavigation: true;
  index: number;
  modal?: EcoSortModalState;
}

type EcoSortModalState =
  | { type: 'assistant' }
  | { type: 'item'; itemId: string };

const readNavigationTab = (pathname: string): NavigationTab | null => {
  const segment = pathname.replace(/^\/+|\/+$/g, '');
  if (!segment) return 'dashboard';
  return NAVIGATION_TABS.find(tab => tab === segment) ?? null;
};

const readHistoryState = (): Partial<EcoSortHistoryState> | null =>
  window.history.state as Partial<EcoSortHistoryState> | null;

const readHistoryModal = (): EcoSortModalState | undefined => {
  const modal = readHistoryState()?.modal;
  if (modal?.type === 'assistant') return modal;
  if (modal?.type === 'item' && typeof modal.itemId === 'string') return modal;
  return undefined;
};

const readHistoryIndex = (): number | null => {
  const state = readHistoryState();
  const index = state?.index;
  return state?.ecoSortNavigation === true && typeof index === 'number' && Number.isInteger(index)
    ? index
    : null;
};

const INITIAL_CITIZEN: UserAccount = {
  id: 'user-citizen-1',
  email: 'citizen@ecosort.ai',
  name: 'Alex Rivera',
  role: 'citizen',
  stationOrZone: 'Station A · Main Campus Plaza',
  credits: 195,
  rank: 'Eco Guardian (Tier 3)',
  itemsRecycled: 14,
  hazardousSafeDrops: 3,
  co2DivertedKg: 18.4,
  streakDays: 7,
  badges: ['Zero Contamination', 'E-Waste Safeguard', '7-Day Streak', 'Campus Upcycler']
};

const INITIAL_ADMIN: UserAccount = {
  id: 'user-admin-1',
  email: 'admin@ecosort.ai',
  name: 'Elena Rostova',
  role: 'admin',
  isMainAdmin: true,
  stationOrZone: 'Central Operations · Sector Alpha',
  credits: 640,
  rank: 'Main Administrator & Operations Lead',
  itemsRecycled: 192,
  hazardousSafeDrops: 28,
  co2DivertedKg: 146.5,
  streakDays: 24,
  badges: ['Root Admin', 'Master Auditor', 'Hazard Incident Lead', 'Batch Lead', 'Fleet Coordinator']
};

const DEFAULT_ANALYTICS: AnalyticsSummary = {
  totalScans: 12,
  disposedCount: 4,
  collectedCount: 3,
  inProcessingCount: 3,
  recycledCount: 2,
  rejectedCount: 0,
  disputedCount: 2,
  resolvedDisputesCount: 1,
  overallRecyclingRate: 88,
  contaminationRate: 12,
  co2AvoidedTotalKg: 28.4,
  categoryBreakdown: {
    recyclable: 5,
    reusable: 2,
    biodegradable: 3,
    hazardous: 2,
    unclassified: 0,
  },
  binBreakdown: {
    blue: 5,
    green: 2,
    brown: 3,
    red: 2,
    slate: 0,
  },
  problemAreas: [
    {
      station: 'Station C · Science Innovation Hub',
      issue: 'Hazardous e-waste receptacle reached 85% capacity. Collection team dispatched.',
      urgency: 'high',
      stat: '3 uncollected batteries'
    },
    {
      station: 'Station B · Engineering Cafeteria',
      issue: 'Compost contamination spike: Greasy pizza boxes mistakenly deposited in Blue bin.',
      urgency: 'medium',
      stat: '12% mismatch rate'
    }
  ]
};

export default function App() {
  // Authentication gate state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserAccount>(INITIAL_CITIZEN);
  const [activeTab, setActiveTab] = useState<NavigationTab>(
    () => readNavigationTab(window.location.pathname) ?? 'dashboard'
  );
  const [isNotFound, setIsNotFound] = useState(
    () => readNavigationTab(window.location.pathname) === null
  );
  const [canGoBack, setCanGoBack] = useState(() => (readHistoryIndex() ?? 0) > 0);
  const [canGoForward, setCanGoForward] = useState(false);
  const furthestHistoryIndex = useRef(readHistoryIndex() ?? 0);

  // Shared platform state
  const [items, setItems] = useState<WasteItem[]>([]);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(DEFAULT_ANALYTICS);
  const [smartBins, setSmartBins] = useState<SmartBin[]>([]);
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [selectedInspectItem, setSelectedInspectItem] = useState<WasteItem | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(
    () => readHistoryModal()?.type === 'assistant'
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load backend data
  const loadData = async () => {
    try {
      const [fetchedItems, fetchedAnalytics, fetchedBins, fetchedTasks] = await Promise.all([
        fetchAllScans(),
        fetchAnalytics(),
        fetchSmartBins(),
        fetchVolunteerTasks()
      ]);
      setItems(fetchedItems);
      setAnalytics(fetchedAnalytics);
      setSmartBins(fetchedBins);
      setTasks(fetchedTasks);
    } catch (err) {
      console.warn('Backend load notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const modal = readHistoryModal();
    if (modal?.type === 'item') {
      setSelectedInspectItem(items.find(item => item.id === modal.itemId) ?? null);
    }
  }, [items]);

  useEffect(() => {
    const currentTab = readNavigationTab(window.location.pathname);
    const currentPath = currentTab ? `/${currentTab}` : window.location.pathname;
    const currentIndex = readHistoryIndex();

    if (window.location.pathname === '/') {
      window.history.replaceState(
        { ecoSortNavigation: true, index: currentIndex ?? 0 } satisfies EcoSortHistoryState,
        '',
        `/dashboard${window.location.search}${window.location.hash}`
      );
    } else if (currentIndex === null) {
      window.history.replaceState(
        { ecoSortNavigation: true, index: 0 } satisfies EcoSortHistoryState,
        '',
        `${currentPath}${window.location.search}${window.location.hash}`
      );
    }

    furthestHistoryIndex.current = Math.max(furthestHistoryIndex.current, readHistoryIndex() ?? 0);
    setCanGoBack((readHistoryIndex() ?? 0) > 0);

    const handlePopState = () => {
      const tab = readNavigationTab(window.location.pathname);
      const modal = readHistoryModal();
      const index = readHistoryIndex();
      setIsNotFound(tab === null);
      if (tab) setActiveTab(tab);
      setIsAssistantOpen(modal?.type === 'assistant');
      setSelectedInspectItem(
        modal?.type === 'item'
          ? itemsRef.current.find(item => item.id === modal.itemId) ?? null
          : null
      );
      setCanGoBack(index !== null && index > 0);
      setCanGoForward(index !== null && index < furthestHistoryIndex.current);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToTab = (tab: NavigationTab, replace = false) => {
    const nextPath = `/${tab}`;
    if (!isNotFound && activeTab === tab) return;

    const index = readHistoryIndex() ?? 0;
    const nextState: EcoSortHistoryState = {
      ecoSortNavigation: true,
      index: replace ? index : index + 1,
    };
    window.history[replace ? 'replaceState' : 'pushState'](
      nextState,
      '',
      `${nextPath}${window.location.search}${window.location.hash}`
    );
    setActiveTab(tab);
    setIsNotFound(false);
    setIsAssistantOpen(false);
    setSelectedInspectItem(null);
    setCanGoBack(nextState.index > 0);
    if (!replace) furthestHistoryIndex.current = nextState.index;
    setCanGoForward(false);
  };

  const pushModalHistory = (modal: EcoSortModalState) => {
    const currentModal = readHistoryModal();
    if (
      currentModal?.type === modal.type &&
      (currentModal.type !== 'item' || (modal.type === 'item' && currentModal.itemId === modal.itemId))
    ) return;

    const nextState: EcoSortHistoryState = {
      ecoSortNavigation: true,
      index: (readHistoryIndex() ?? 0) + 1,
      modal,
    };
    window.history.pushState(
      nextState,
      '',
      `${window.location.pathname}${window.location.search}${window.location.hash}`
    );
    furthestHistoryIndex.current = nextState.index;
    setCanGoBack(true);
    setCanGoForward(false);
  };

  const openItemInspector = (item: WasteItem) => {
    pushModalHistory({ type: 'item', itemId: item.id });
    setIsAssistantOpen(false);
    setSelectedInspectItem(item);
  };

  const closeItemInspector = () => {
    if (readHistoryModal()?.type === 'item') {
      window.history.back();
    } else {
      setSelectedInspectItem(null);
    }
  };

  const openAssistant = () => {
    pushModalHistory({ type: 'assistant' });
    setSelectedInspectItem(null);
    setIsAssistantOpen(true);
  };

  const closeAssistant = () => {
    if (readHistoryModal()?.type === 'assistant') {
      window.history.back();
    } else {
      setIsAssistantOpen(false);
    }
  };

  // Scan handler
  const handleScanCompleted = (item: WasteItem) => {
    setItems(prev => {
      const existing = prev.findIndex(i => i.id === item.id);
      if (existing >= 0) {
        const copy = [...prev];
        copy[existing] = item;
        return copy;
      }
      return [item, ...prev];
    });
    fetchAnalytics().then(setAnalytics).catch(() => {});
  };

  // Reset to demo state
  const handleResetDemo = async () => {
    try {
      await resetDemoData();
      await loadData();
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  // User credit updates
  const handleUpdateCredits = (newCredits: number) => {
    setCurrentUser(prev => ({
      ...prev,
      credits: newCredits
    }));
  };

  const handleRewardCredits = (bonus: number) => {
    setCurrentUser(prev => ({
      ...prev,
      credits: prev.credits + bonus
    }));
  };

  // Unresolved disputes count
  const disputedCount = items.filter(i => i.disputed && !i.auditAction).length;

  // 1. If not authenticated, present the split-screen auth experience
  if (!isAuthenticated) {
    return (
      <AuthScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
          if ((user.role === 'volunteer' || user.role === 'admin') && !isNotFound && activeTab === 'dashboard') {
            navigateToTab('admin_dashboard', true);
          }
        }}
      />
    );
  }

  // 2. Main Authenticated Application
  return (
    <div className="min-h-screen bg-[#020906] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Top Bar Header */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={navigateToTab}
        onBack={() => window.history.back()}
        onForward={() => window.history.forward()}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        disputedCount={disputedCount}
        onResetDemo={handleResetDemo}
        onLogout={() => setIsAuthenticated(false)}
        onOpenAssistant={openAssistant}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {isNotFound ? (
          <div className="max-w-3xl mx-auto px-4 py-20 text-center">
            <p className="text-xs font-mono uppercase tracking-wider text-emerald-400">EcoSort AI</p>
            <h1 className="mt-3 text-3xl font-display font-bold text-white">Page not found</h1>
            <p className="mt-2 text-sm text-slate-400">That route isn’t part of EcoSort AI.</p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => window.history.back()}
                disabled={!canGoBack}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Go back
              </button>
              <button
                onClick={() => navigateToTab(currentUser.role === 'admin' || currentUser.role === 'volunteer' ? 'admin_dashboard' : 'dashboard')}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400"
              >
                Go to dashboard
              </button>
            </div>
          </div>
        ) : (
        <>
        
        {/* ========================================================= */}
        {/* 15 CITIZEN / USER PAGES                                  */}
        {/* ========================================================= */}
        
        {/* Page 1: User Command Overview Dashboard */}
        {activeTab === 'dashboard' && (
          <CommandDashboard
            currentUser={currentUser}
            analytics={analytics}
            recentItems={items}
            onNavigate={navigateToTab}
            onInspectItem={openItemInspector}
            onOpenAssistant={openAssistant}
          />
        )}

        {/* Page 2: AI Waste Scanner */}
        {activeTab === 'scanner' && (
          <CitizenScanner
            currentUser={currentUser}
            onScanCompleted={handleScanCompleted}
            onViewPipeline={() => navigateToTab('journey_tracker')}
          />
        )}

        {/* Page 3: Closed-Loop Bin Deposit Confirmation */}
        {activeTab === 'deposit_confirmation' && (
          <BinDepositVerification
            currentUser={currentUser}
            items={items}
            onScanNew={() => navigateToTab('scanner')}
            onUpdateItem={handleScanCompleted}
            onUpdateCredits={handleUpdateCredits}
          />
        )}

        {/* Page 4: My Scan History & Material Passport */}
        {activeTab === 'history' && (
          <CitizenHistory
            currentUser={currentUser}
            items={items}
            onScanNew={() => navigateToTab('scanner')}
            onInspectItem={openItemInspector}
          />
        )}

        {/* Page 5: Material Journey Tracker */}
        {activeTab === 'journey_tracker' && (
          <MaterialJourneyTracker
            items={items}
            onInspectItem={openItemInspector}
          />
        )}

        {/* Page 6: Eco-Credits & Rewards Store */}
        {activeTab === 'rewards_store' && (
          <EcoRewardsStore
            currentUser={currentUser}
            onUpdateUserCredits={handleUpdateCredits}
          />
        )}

        {/* Page 7: Personalized AI Recommendations */}
        {activeTab === 'ai_recommendations' && (
          <AIRecommendations
            currentUser={currentUser}
            items={items}
          />
        )}

        {/* Page 8: Upcycling & DIY Hub */}
        {activeTab === 'upcycling_hub' && (
          <UpcyclingHub />
        )}

        {/* Page 9: Peer Reuse Marketplace & Campus Smart Lockers */}
        {activeTab === 'reuse_market' && (
          <ReuseMarketplace
            currentUser={currentUser}
          />
        )}

        {/* Page 10: Sustainability Quiz & Sorting Trivia */}
        {activeTab === 'sustainability_quiz' && (
          <SustainabilityQuiz
            currentUser={currentUser}
            onRewardCredits={handleRewardCredits}
          />
        )}

        {/* Page 11: Smart Bin Station Finder & Map */}
        {activeTab === 'station_finder' && (
          <SmartBinStationFinder />
        )}

        {/* Page 12: Campus Impact Leaderboard */}
        {activeTab === 'leaderboard' && (
          <CitizenLeaderboard
            currentUser={currentUser}
          />
        )}

        {/* Page 13: 3D Smart Station Digital Twin Viewer (Citizen View) */}
        {activeTab === 'digital_twin' && (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono text-emerald-400 uppercase">3D Digital Twin · Citizen View</span>
              <h1 className="text-3xl font-display font-bold text-white mt-1">Smart Sorting Station 3D Simulation</h1>
              <p className="text-xs text-slate-400 mt-1">Interact with our 3D model to see physical bin capacities and material stream separation.</p>
            </div>
            <DigitalTwin3D bins={smartBins} items={items} />
          </div>
        )}

        {/* Page 14: Carbon & Environmental Impact Calculator */}
        {activeTab === 'impact_calculator' && (
          <CarbonImpactCalculator
            currentUser={currentUser}
            items={items}
          />
        )}

        {/* Page 15: User Profile & Preferences Settings */}
        {activeTab === 'profile_settings' && (
          <UserProfileSettings
            currentUser={currentUser}
            items={items}
            onLogout={() => setIsAuthenticated(false)}
            onUpdateStation={(station) => setCurrentUser(prev => ({ ...prev, stationOrZone: station }))}
          />
        )}

        {/* ========================================================= */}
        {/* ADMIN & VOLUNTEER MODULES                                */}
        {/* ========================================================= */}

        {/* Admin 1: Master Operations Command Dashboard */}
        {activeTab === 'admin_dashboard' && (
          <CommandDashboard
            currentUser={currentUser}
            analytics={analytics}
            recentItems={items}
            onNavigate={navigateToTab}
            onInspectItem={openItemInspector}
            onOpenAssistant={openAssistant}
          />
        )}

        {/* Admin 2: Lifecycle Kanban Pipeline & Batch Dispatcher */}
        {activeTab === 'pipeline' && (
          <VolunteerPipeline
            items={items}
            onRefreshData={loadData}
            onInspectItem={openItemInspector}
            onOpenDisputeDesk={() => navigateToTab('disputes')}
          />
        )}

        {/* Admin 3: Contamination & Dispute Desk */}
        {activeTab === 'disputes' && (
          <DisputeDesk
            items={items}
            onRefreshData={loadData}
            onInspectItem={openItemInspector}
          />
        )}

        {/* Admin 4: Operations Analytics & Heatmaps */}
        {activeTab === 'analytics' && (
          <OperationsAnalytics
            analytics={analytics}
            items={items}
            currentUser={currentUser}
          />
        )}

        {/* Admin 5: 3D Facility Digital Twin */}
        {activeTab === 'digital_twin_admin' && (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono text-emerald-400 uppercase">Automated Sorting Center · Facility Model</span>
              <h1 className="text-3xl font-display font-bold text-white mt-1">Facility 3D Digital Twin</h1>
              <p className="text-xs text-slate-400 mt-1">Real-time WebGL rendering of sorting gantry, optical sensors, conveyor belt, and stream containers.</p>
            </div>
            <DigitalTwin3D bins={smartBins} items={items} />
          </div>
        )}

        {/* Admin 6: Volunteer Operations & Field Tasks Queue */}
        {activeTab === 'volunteer_tasks' && (
          <VolunteerOperations
            tasks={tasks}
            currentUser={currentUser}
            onRefreshData={loadData}
          />
        )}

        {/* Admin 7: Smart Bins Telemetry & 1-Click Collection */}
        {activeTab === 'smart_bins' && (
          <SmartBinsManagement
            onRefreshData={loadData}
          />
        )}

        {/* Admin 8: AI Model Performance & Class Map Diagnostics */}
        {activeTab === 'ai_inspector' && (
          <AIModelInspector
            items={items}
            onInspectItem={openItemInspector}
          />
        )}

        {/* Admin 9: Users, Permissions & System Audit Logs */}
        {activeTab === 'audit_logs' && (
          <UsersAndAuditLogs
            currentUser={currentUser}
          />
        )}

        </>
        )}
      </main>

      {/* Item Detail Inspector Modal */}
      <ItemDetailModal
        item={selectedInspectItem}
        onClose={closeItemInspector}
      />

      {/* Floating AI Assistant Drawer */}
      {isAssistantOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={closeAssistant}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <EcoAssistant />
          </div>
        </div>
      )}

      {/* Bottom Floating Quick AI Assistant Pill */}
      {!isAssistantOpen && (
        <button
          onClick={openAssistant}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-slate-950 font-bold text-xs shadow-2xl shadow-emerald-500/30 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask Circularity AI</span>
        </button>
      )}

      {/* Standard Compact Footer */}
      <footer className="border-t border-emerald-950/80 bg-[#020b07] px-6 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">EcoFlux AI</span>
            <span>·</span>
            <span>Smart Recycling & Circular Economy Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span className="text-blue-400">● Blue: Recyclables</span>
            <span className="text-emerald-400">● Green: Reusable</span>
            <span className="text-amber-500">● Brown: Compost</span>
            <span className="text-red-400">● Red: Hazardous</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
