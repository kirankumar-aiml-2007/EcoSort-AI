/**
 * EcoFlux AI - Complete Data Types & Domain Schemas
 */

export type WasteCategory = 'recyclable' | 'reusable' | 'biodegradable' | 'hazardous' | 'unclassified';
export type BinColor = 'blue' | 'green' | 'brown' | 'red' | 'slate';
export type LifecycleStatus = 'scanned' | 'disposed' | 'collected' | 'processing' | 'recycled' | 'rejected';
export type UserRole = 'citizen' | 'volunteer' | 'admin';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isMainAdmin?: boolean;
  avatar?: string;
  stationOrZone?: string;
  credits: number;
  rank: string;
  itemsRecycled: number;
  hazardousSafeDrops: number;
  co2DivertedKg: number;
  streakDays: number;
  badges: string[];
}

export interface AuthorizedAdmin {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'volunteer';
  isMainAdmin: boolean;
  department: string;
  authorizedAt: string;
  authorizedBy: string;
  status: 'active' | 'suspended';
}

export interface LifecycleEntry {
  status: LifecycleStatus;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface WasteItem {
  id: string;
  name: string;
  category: WasteCategory;
  binColor: BinColor;
  material: string;
  confidence: number;
  decompositionTime: string;
  recyclingInstructions: string;
  imageUrl: string;
  timestamp: string;
  station: string;
  userId: string;
  userName: string;
  suggestedPoints: number;
  creditsAwarded: number;
  confirmedBin?: BinColor;
  confirmedAt?: string;
  status: LifecycleStatus;
  disputed: boolean;
  disputeReason?: string;
  auditAction?: 'approved' | 'overruled' | 'reclassified';
  auditedBy?: string;
  auditedAt?: string;
  volunteerNotes?: string;
  lifecycleHistory: LifecycleEntry[];
  engine?: 'gemini' | 'yolo';
  boundingBox?: [number, number, number, number];
  batchId?: string;
}

export interface SmartBin {
  id: string;
  station: string;
  category: WasteCategory;
  binColor: BinColor;
  fillPercentage: number;
  itemCount: number;
  capacityLiters: number;
  lastEmptied: string;
  status: 'normal' | 'near_full' | 'full' | 'maintenance';
}

export interface VolunteerTask {
  id: string;
  title: string;
  station: string;
  type: 'collection' | 'inspection' | 'dispute_audit' | 'sorting';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string;
  assignedToName?: string;
  dueDate: string;
  itemsCount?: number;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  creditCost: number;
  category: 'voucher' | 'gear' | 'donation' | 'workshop';
  imageUrl: string;
  stock: number;
}

export interface ReuseListing {
  id: string;
  title: string;
  category: string;
  condition: 'like_new' | 'good' | 'fair';
  description: string;
  donorName: string;
  stationLocker: string;
  status: 'available' | 'reserved' | 'claimed';
  timestamp: string;
  imageUrl: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: WasteCategory;
}

export interface AnalyticsSummary {
  totalScans: number;
  disposedCount: number;
  collectedCount: number;
  inProcessingCount: number;
  recycledCount: number;
  rejectedCount: number;
  disputedCount: number;
  resolvedDisputesCount: number;
  overallRecyclingRate: number;
  contaminationRate: number;
  co2AvoidedTotalKg: number;
  categoryBreakdown: Record<WasteCategory, number>;
  binBreakdown: Record<BinColor, number>;
  problemAreas: {
    station: string;
    issue: string;
    urgency: 'low' | 'medium' | 'high';
    stat: string;
  }[];
}

export interface ScanAnalysisResult {
  itemName: string;
  category: WasteCategory;
  binColor: BinColor;
  material: string;
  confidence: number;
  decompositionTime: string;
  recyclingInstructions: string;
  suggestedPoints: number;
  detectedFeatures: string[];
  engine?: 'gemini' | 'yolo';
  boundingBox?: [number, number, number, number];
}

export interface AIInsight {
  id: string;
  title: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
  timestamp: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  target: string;
  details: string;
  ipAddress?: string;
}
