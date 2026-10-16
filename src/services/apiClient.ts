import type { 
  WasteItem, 
  UserAccount, 
  AnalyticsSummary, 
  WasteCategory, 
  BinColor, 
  LifecycleStatus,
  ScanAnalysisResult,
  SmartBin,
  VolunteerTask,
  RewardItem,
  ReuseListing,
  QuizQuestion,
  AIInsight,
  AuditLogEntry,
  AuthorizedAdmin
} from '../types/ecosort.ts';

const API_BASE = '/api';

export async function fetchAllScans(filters?: {
  status?: LifecycleStatus | 'all';
  category?: WasteCategory | 'all';
  disputed?: boolean;
  userId?: string;
}): Promise<WasteItem[]> {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters?.category && filters.category !== 'all') params.set('category', filters.category);
  if (filters?.disputed !== undefined) params.set('disputed', String(filters.disputed));
  if (filters?.userId) params.set('userId', filters.userId);

  const res = await fetch(`${API_BASE}/scans?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch scans');
  const data = await res.json();
  return data.items || [];
}

export async function analyzeWasteScan(payload: {
  imageBase64?: string;
  mimeType?: string;
  hintText?: string;
  engine?: 'gemini' | 'yolo';
  station?: string;
  userId?: string;
  userName?: string;
  demoImageUrl?: string;
}): Promise<{ item: WasteItem; analysis: ScanAnalysisResult }> {
  const res = await fetch(`${API_BASE}/scan/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to analyze scan');
  }
  return res.json();
}

export async function confirmItemBin(itemId: string, confirmedBin: BinColor, userId?: string): Promise<{
  item: WasteItem;
  isMatch: boolean;
  creditsAwarded: number;
}> {
  const res = await fetch(`${API_BASE}/scans/${itemId}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirmedBin, userId }),
  });
  if (!res.ok) throw new Error('Failed to confirm bin');
  return res.json();
}

export async function batchAdvanceLifecycle(payload: {
  itemIds: string[];
  targetStatus: LifecycleStatus;
  volunteerName?: string;
  batchNote?: string;
}): Promise<{ updatedCount: number; items: WasteItem[] }> {
  const res = await fetch(`${API_BASE}/volunteer/batch-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to batch update status');
  return res.json();
}

export async function auditItemDispute(payload: {
  itemId: string;
  action: 'approved' | 'overruled' | 'reclassified';
  volunteerName?: string;
  notes?: string;
  newCategory?: WasteCategory;
}): Promise<{ item: WasteItem }> {
  const res = await fetch(`${API_BASE}/volunteer/audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to audit item');
  return res.json();
}

export async function fetchAnalytics(): Promise<AnalyticsSummary> {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function loginUser(
  email: string, 
  role?: 'citizen' | 'volunteer' | 'admin',
  portal?: 'citizen' | 'admin',
  name?: string
): Promise<UserAccount> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, role, portal, name }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to authenticate');
  }
  const data = await res.json();
  return data.user;
}

export async function fetchAuthorizedAdmins(): Promise<AuthorizedAdmin[]> {
  const res = await fetch(`${API_BASE}/admin/authorized-admins`);
  if (!res.ok) throw new Error('Failed to fetch authorized administrators');
  const data = await res.json();
  return data.authorizedAdmins || [];
}

export async function authorizeAdminEmail(payload: {
  email: string;
  name?: string;
  role?: 'admin' | 'volunteer';
  department?: string;
  actorName?: string;
}): Promise<{ authorizedAdmin: AuthorizedAdmin; authorizedAdmins: AuthorizedAdmin[] }> {
  const res = await fetch(`${API_BASE}/admin/authorize-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to authorize admin email');
  }
  return res.json();
}

export async function revokeAdminEmail(email: string, actorName?: string): Promise<{ authorizedAdmins: AuthorizedAdmin[] }> {
  const res = await fetch(`${API_BASE}/admin/authorize-email/${encodeURIComponent(email)}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actorName })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to revoke admin email');
  }
  return res.json();
}

export async function resetDemoData(): Promise<void> {
  const res = await fetch(`${API_BASE}/reset-demo`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset demo');
}

export async function fetchSmartBins(): Promise<SmartBin[]> {
  const res = await fetch(`${API_BASE}/bins`);
  if (!res.ok) throw new Error('Failed to fetch smart bins');
  const data = await res.json();
  return data.bins || [];
}

export interface DispatchBatchResult {
  bin: SmartBin;
  batchId?: string;
  collectedCount?: number;
  task?: VolunteerTask;
}

export async function emptySmartBin(binId: string, actorName?: string): Promise<DispatchBatchResult> {
  const res = await fetch(`${API_BASE}/bins/${binId}/empty`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actorName }),
  });
  if (!res.ok) throw new Error('Failed to dispatch bin collection batch');
  const data = await res.json();
  return { 
    bin: data.bin, 
    batchId: data.batchId, 
    collectedCount: data.collectedCount,
    task: data.task 
  };
}

export async function dispatchAllCriticalBinsApi(actorName?: string): Promise<{ dispatchedCount: number; batches: string[]; totalItemsCollected: number }> {
  const res = await fetch(`${API_BASE}/bins/dispatch-all-critical`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actorName }),
  });
  if (!res.ok) throw new Error('Failed to auto-dispatch critical bins');
  return res.json();
}

export async function fetchVolunteerTasks(): Promise<VolunteerTask[]> {
  const res = await fetch(`${API_BASE}/tasks`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  const data = await res.json();
  return data.tasks || [];
}

export async function completeVolunteerTask(taskId: string, actorName?: string): Promise<VolunteerTask> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actorName }),
  });
  if (!res.ok) throw new Error('Failed to complete task');
  const data = await res.json();
  return data.task;
}

export async function fetchRewards(): Promise<RewardItem[]> {
  const res = await fetch(`${API_BASE}/rewards`);
  if (!res.ok) throw new Error('Failed to fetch rewards');
  const data = await res.json();
  return data.rewards || [];
}

export async function claimRewardItem(rewardId: string, userId: string): Promise<{ success: boolean; reward?: RewardItem; user?: UserAccount; error?: string }> {
  const res = await fetch(`${API_BASE}/rewards/${rewardId}/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  return res.json();
}

export async function fetchReuseListings(): Promise<ReuseListing[]> {
  const res = await fetch(`${API_BASE}/reuse`);
  if (!res.ok) throw new Error('Failed to fetch reuse listings');
  const data = await res.json();
  return data.listings || [];
}

export async function createReuseListing(payload: Omit<ReuseListing, 'id' | 'timestamp' | 'status'>): Promise<ReuseListing> {
  const res = await fetch(`${API_BASE}/reuse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to list reuse item');
  const data = await res.json();
  return data.listing;
}

export async function claimReuseListing(listingId: string, claimantName?: string): Promise<ReuseListing> {
  const res = await fetch(`${API_BASE}/reuse/${listingId}/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claimantName }),
  });
  if (!res.ok) throw new Error('Failed to claim listing');
  const data = await res.json();
  return data.listing;
}

export async function fetchQuizQuestions(): Promise<QuizQuestion[]> {
  const res = await fetch(`${API_BASE}/quiz`);
  if (!res.ok) throw new Error('Failed to fetch quiz');
  const data = await res.json();
  return data.questions || [];
}

export async function fetchAIInsights(): Promise<AIInsight[]> {
  const res = await fetch(`${API_BASE}/insights`);
  if (!res.ok) throw new Error('Failed to fetch insights');
  const data = await res.json();
  return data.insights || [];
}

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  const res = await fetch(`${API_BASE}/audit-logs`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  const data = await res.json();
  return data.logs || [];
}

export async function askGeminiAssistant(question: string, context?: string): Promise<string> {
  const res = await fetch(`${API_BASE}/ai/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, context }),
  });
  if (!res.ok) throw new Error('AI Assistant request failed');
  const data = await res.json();
  return data.answer || '';
}

export async function fetchAdminUsers(): Promise<UserAccount[]> {
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: { 'x-user-role': 'admin' }
  });
  if (!res.ok) throw new Error('Failed to fetch admin users');
  const data = await res.json();
  return data.users || [];
}

export async function fetchMaterialPassport(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/materials/${id}`);
  if (!res.ok) throw new Error('Failed to fetch material passport');
  return res.json();
}

export async function updateMaterialStatus(id: string, status: LifecycleStatus, actorName?: string, note?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/materials/${id}/status`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': 'admin'
    },
    body: JSON.stringify({ status, actorName, note })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update material status');
  }
  return res.json();
}

export async function fetchDigitalTwinOverview(): Promise<any> {
  const res = await fetch(`${API_BASE}/twin/overview`);
  if (!res.ok) throw new Error('Failed to fetch digital twin overview');
  return res.json();
}

export async function fetchDigitalTwinBatches(): Promise<any> {
  const res = await fetch(`${API_BASE}/twin/batches`);
  if (!res.ok) throw new Error('Failed to fetch digital twin batches');
  return res.json();
}

export async function fetchDigitalTwinMaterialFlow(): Promise<any> {
  const res = await fetch(`${API_BASE}/twin/material-flow`);
  if (!res.ok) throw new Error('Failed to fetch material flow telemetry');
  return res.json();
}

export async function fetchSystemHealth(): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/system-health`);
  if (!res.ok) throw new Error('Failed to fetch system health');
  return res.json();
}

export async function fetchAdminReviews(): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/reviews`, {
    headers: { 'x-user-role': 'admin' }
  });
  if (!res.ok) throw new Error('Failed to fetch admin reviews');
  return res.json();
}

export async function requestRecommendation(materialName: string, category: string, historyContext?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ materialName, category, historyContext })
  });
  if (!res.ok) throw new Error('Failed to request recommendation');
  return res.json();
}

