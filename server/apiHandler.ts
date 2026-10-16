import { GoogleGenAI } from "@google/genai";
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
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
} from '../src/types/ecosort.ts';

// Server-side GenAI SDK setup
const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Initial Seed Users
export const SEED_USERS: UserAccount[] = [
  {
    id: 'user-citizen-1',
    email: 'citizen@ecosort.ai',
    name: 'Alex Rivera',
    role: 'citizen',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    stationOrZone: 'West Campus Hub · Station A',
    credits: 220,
    rank: 'Eco Champion (Tier 3)',
    itemsRecycled: 16,
    hazardousSafeDrops: 3,
    co2DivertedKg: 19.8,
    streakDays: 5,
    badges: ['Zero Contamination', 'E-Waste Savior', 'Compost Pioneer', '5-Day Streak'],
  },
  {
    id: 'user-admin-1',
    email: 'admin@ecosort.ai',
    name: 'Elena Rostova',
    role: 'admin',
    isMainAdmin: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    stationOrZone: 'Central Operations · Sector Alpha',
    credits: 640,
    rank: 'Operations Lead & Lead Auditor',
    itemsRecycled: 192,
    hazardousSafeDrops: 28,
    co2DivertedKg: 146.5,
    streakDays: 19,
    badges: ['Operations Master', 'Lead Auditor', 'Fleet Coordinator', 'Zero Waste Hero'],
  },
  {
    id: 'user-volunteer-1',
    email: 'volunteer@ecosort.ai',
    name: 'Marcus Chen',
    role: 'volunteer',
    isMainAdmin: false,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    stationOrZone: 'Station B · Cafeteria Operations',
    credits: 410,
    rank: 'Audit Specialist',
    itemsRecycled: 94,
    hazardousSafeDrops: 12,
    co2DivertedKg: 78.2,
    streakDays: 11,
    badges: ['Contamination Hunter', 'Compost Expert'],
  },
  {
    id: 'user-admin-chandhan',
    email: 'chandhankumar356@gmail.com',
    name: 'Chandhan Kumar',
    role: 'admin',
    isMainAdmin: false,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    stationOrZone: 'Systems & Circular Operations',
    credits: 520,
    rank: 'Systems Administrator',
    itemsRecycled: 80,
    hazardousSafeDrops: 15,
    co2DivertedKg: 95.0,
    streakDays: 14,
    badges: ['Systems Admin', 'Lead Auditor'],
  }
];

// Initial Authorized Admins list (Only Main Admin can authorize new emails)
export const SEED_AUTHORIZED_ADMINS: AuthorizedAdmin[] = [
  {
    id: 'auth-admin-1',
    email: 'admin@ecosort.ai',
    name: 'Elena Rostova',
    role: 'admin',
    isMainAdmin: true,
    department: 'Central Operations Command',
    authorizedAt: '2026-01-01T00:00:00Z',
    authorizedBy: 'Root Security Authority (Main Admin)',
    status: 'active'
  },
  {
    id: 'auth-admin-2',
    email: 'volunteer@ecosort.ai',
    name: 'Marcus Chen',
    role: 'volunteer',
    isMainAdmin: false,
    department: 'Field Logistics & Collection Operations',
    authorizedAt: '2026-02-15T08:30:00Z',
    authorizedBy: 'Elena Rostova (Main Admin)',
    status: 'active'
  },
  {
    id: 'auth-admin-3',
    email: 'chandhankumar356@gmail.com',
    name: 'Chandhan Kumar',
    role: 'admin',
    isMainAdmin: false,
    department: 'Systems & Circular Operations',
    authorizedAt: '2026-03-01T10:00:00Z',
    authorizedBy: 'Elena Rostova (Main Admin)',
    status: 'active'
  }
];

// Initial Smart Bins
export const SEED_BINS: SmartBin[] = [
  { id: 'BIN-101', station: 'Station A · Library Plaza', category: 'recyclable', binColor: 'blue', fillPercentage: 42, itemCount: 18, capacityLiters: 120, lastEmptied: '2026-10-15T04:30:00Z', status: 'normal' },
  { id: 'BIN-102', station: 'Station A · Library Plaza', category: 'reusable', binColor: 'green', fillPercentage: 25, itemCount: 6, capacityLiters: 80, lastEmptied: '2026-10-14T18:00:00Z', status: 'normal' },
  { id: 'BIN-103', station: 'Station B · Cafeteria', category: 'biodegradable', binColor: 'brown', fillPercentage: 88, itemCount: 46, capacityLiters: 150, lastEmptied: '2026-10-14T22:00:00Z', status: 'near_full' },
  { id: 'BIN-104', station: 'Station B · Cafeteria', category: 'recyclable', binColor: 'blue', fillPercentage: 65, itemCount: 29, capacityLiters: 120, lastEmptied: '2026-10-15T05:00:00Z', status: 'normal' },
  { id: 'BIN-105', station: 'Station C · Science Block', category: 'hazardous', binColor: 'red', fillPercentage: 92, itemCount: 14, capacityLiters: 50, lastEmptied: '2026-10-13T10:00:00Z', status: 'full' },
  { id: 'BIN-106', station: 'Station C · Science Block', category: 'recyclable', binColor: 'blue', fillPercentage: 35, itemCount: 12, capacityLiters: 100, lastEmptied: '2026-10-15T06:00:00Z', status: 'normal' },
  { id: 'BIN-107', station: 'Station D · Student Union', category: 'reusable', binColor: 'green', fillPercentage: 50, itemCount: 15, capacityLiters: 80, lastEmptied: '2026-10-15T02:00:00Z', status: 'normal' },
  { id: 'BIN-108', station: 'Station D · Student Union', category: 'biodegradable', binColor: 'brown', fillPercentage: 70, itemCount: 31, capacityLiters: 120, lastEmptied: '2026-10-14T20:00:00Z', status: 'normal' },
];

// Initial Volunteer Tasks
export const SEED_TASKS: VolunteerTask[] = [
  { id: 'TASK-301', title: 'Emergency E-Waste Tube Emptying', station: 'Station C · Science Block', type: 'collection', priority: 'high', status: 'pending', dueDate: 'Today, 10:00 AM', itemsCount: 14 },
  { id: 'TASK-302', title: 'Compost Aeration & Bin Swap', station: 'Station B · Cafeteria', type: 'collection', priority: 'medium', status: 'in_progress', assignedTo: 'user-admin-1', assignedToName: 'Elena Rostova', dueDate: 'Today, 11:30 AM', itemsCount: 46 },
  { id: 'TASK-303', title: 'Pizza Box Mismatch Contamination Audit', station: 'Station B · Cafeteria', type: 'dispute_audit', priority: 'high', status: 'pending', dueDate: 'Today, 12:00 PM', itemsCount: 3 },
  { id: 'TASK-304', title: 'Reusable Locker Cleaning & Sterilization', station: 'Station A · Library', type: 'sorting', priority: 'low', status: 'completed', assignedTo: 'user-admin-1', assignedToName: 'Elena Rostova', dueDate: 'Yesterday', itemsCount: 12 },
];

// Initial Rewards Catalog
export const SEED_REWARDS: RewardItem[] = [
  { id: 'REW-1', title: 'Fair-Trade Campus Coffee Voucher', description: 'Redeem for 1 handcrafted hot or iced coffee at the Sustainable Bean cafe.', creditCost: 80, category: 'voucher', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&auto=format&fit=crop&q=80', stock: 45 },
  { id: 'REW-2', title: 'Insulated Bamboo Thermos (500ml)', description: 'Laser-engraved double-wall stainless steel with renewable bamboo wrap.', creditCost: 250, category: 'gear', imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&auto=format&fit=crop&q=80', stock: 12 },
  { id: 'REW-3', title: 'Tree Planting in Urban Canopy', description: 'Plant one native oak or maple tree with GPS coordinates in the campus reforestation project.', creditCost: 150, category: 'donation', imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&auto=format&fit=crop&q=80', stock: 999 },
  { id: 'REW-4', title: 'MakerSpace DIY Repair Lab Pass', description: 'Access 3D printers, soldering stations, and tools to repair your household electronics.', creditCost: 120, category: 'workshop', imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80', stock: 20 },
];

// Initial Circular Reuse Listings
export const SEED_REUSE: ReuseListing[] = [
  { id: 'REUSE-501', title: 'Calculus & Linear Algebra Textbook (Hardcover)', category: 'Books & Notes', condition: 'like_new', description: 'Barely used, zero highlighting. Free to any student taking MATH 201.', donorName: 'Sarah Lin', stationLocker: 'Station A Locker #3', status: 'available', timestamp: '2026-10-15T05:20:00Z', imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80' },
  { id: 'REUSE-502', title: 'USB-C Fast Charger & Braided Cable (65W)', category: 'Electronics', condition: 'good', description: 'Tested and certified by volunteer team. Fully functional.', donorName: 'David Chen', stationLocker: 'Station C Locker #1', status: 'available', timestamp: '2026-10-15T06:10:00Z', imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&auto=format&fit=crop&q=80' },
  { id: 'REUSE-503', title: 'Set of 4 Vintage Mason Jars for Food Prep', category: 'Household', condition: 'like_new', description: 'Clean sterilized glass jars with airtight golden lids.', donorName: 'Maya Patel', stationLocker: 'Station D Locker #7', status: 'claimed', timestamp: '2026-10-14T19:00:00Z', imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400&auto=format&fit=crop&q=80' },
];

// Circularity Quiz Questions
export const SEED_QUIZ: QuizQuestion[] = [
  {
    id: 'Q1',
    question: 'Why should a pizza box with greasy oil stains NOT be deposited into the Blue Recycling bin?',
    options: [
      'Cardboard cannot be recycled anyway',
      'Food oil contaminates paper pulp slurry and ruins the entire batch',
      'The cheese increases paper weight too much',
      'Boxes must be burned in incinerators'
    ],
    correctIndex: 1,
    explanation: 'Grease and oil cannot be separated from paper fibers during pulping. It creates oil spots that ruin recycled paper. Greasy boxes must go into the Brown compost bin!',
    category: 'biodegradable'
  },
  {
    id: 'Q2',
    question: 'What is the most critical hazard of throwing swollen smartphone batteries into normal trash bins?',
    options: [
      'They make garbage trucks heavier',
      'Lithium is flammable and can ignite compression fires inside trucks and MRFs',
      'They dissolve plastic bags instantly',
      'They prevent compost worms from eating'
    ],
    correctIndex: 1,
    explanation: 'Lithium-ion batteries easily puncture or short-circuit under compression in waste trucks, causing catastrophic chemical fires. Always use the Red hazardous container.',
    category: 'hazardous'
  },
  {
    id: 'Q3',
    question: 'Which of the following items represents true circular reuse rather than single-use downcycling?',
    options: [
      'Single-use paper coffee cup with plastic lining',
      'Stainless steel travel tumbler washed and reused daily',
      'Plastic straw made from PLA',
      'Crushed soda can'
    ],
    correctIndex: 1,
    explanation: 'True circular economy prioritizes durable reuse assets (Green stream) that prevent virgin material extraction over 1,000+ cycles.',
    category: 'reusable'
  },
  {
    id: 'Q4',
    question: 'How should plastic bottles be prepared before being placed in the Blue recycling bin?',
    options: [
      'Filled with soapy water to the brim',
      'Rinsed, emptied of liquids, crushed, and cap screwed on tightly',
      'Cut into 50 small pieces with scissors',
      'Frozen overnight'
    ],
    correctIndex: 1,
    explanation: 'Liquids contaminate sorting balers. Emptying, crushing, and replacing caps ensures caps do not fall through sorting screeners.',
    category: 'recyclable'
  }
];

// Automated AI Insights
export const SEED_INSIGHTS: AIInsight[] = [
  {
    id: 'INS-01',
    title: 'High Pizza Box Contamination in Station B',
    category: 'Quality Control',
    severity: 'high',
    description: '18% of items placed in Station B Blue bin over the past 24 hours are food-greased pizza boxes. This risks rejecting the entire 120L paper batch at the Materials Recovery Facility.',
    recommendation: 'Deploy prompt sticker: "Grease = Compost Brown Bin" above Station B paper slot, and add volunteer spot-check at 12:30 lunch peak.',
    timestamp: '2026-10-15T06:30:00Z'
  },
  {
    id: 'INS-02',
    title: 'Science Hub E-Waste Safe Drops Surge (+35%)',
    category: 'Logistics',
    severity: 'medium',
    description: 'Battery drop volume increased by 35% following mid-term electronics lab cleanout. Red hazardous container #BIN-105 is currently at 92% capacity.',
    recommendation: 'Dispatch Hazardous collection crew to empty tube #BIN-105 before afternoon classes begin.',
    timestamp: '2026-10-15T07:00:00Z'
  },
  {
    id: 'INS-03',
    title: 'Carbon Offset Milestone Approaching',
    category: 'Environmental Impact',
    severity: 'low',
    description: 'Campus has diverted 146.5 kg of CO2 equivalent this week, on track to exceed the 200 kg weekly milestone.',
    recommendation: 'Highlight the +20 Eco-Credits weekend reusable tumbler campaign on the student command dashboard.',
    timestamp: '2026-10-15T07:15:00Z'
  }
];

// Seed Data with stable Material Passport IDs
export const INITIAL_ITEMS: WasteItem[] = [
  {
    id: 'MAT-2026-000101',
    name: 'Sparkling Water PET Bottle (500ml)',
    category: 'recyclable',
    binColor: 'blue',
    material: 'PET #1 (Polyethylene Terephthalate)',
    confidence: 0.98,
    decompositionTime: '450 years if landfilled',
    recyclingInstructions: 'Empty liquids, crush slightly, replace cap and deposit into the Blue bin.',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
    timestamp: '2026-10-15T06:15:00Z',
    station: 'Station A · Library Plaza',
    userId: 'user-citizen-1',
    userName: 'Alex Rivera',
    suggestedPoints: 15,
    creditsAwarded: 15,
    confirmedBin: 'blue',
    confirmedAt: '2026-10-15T06:16:12Z',
    status: 'recycled',
    disputed: false,
    engine: 'yolo',
    boundingBox: [100, 80, 520, 420],
    lifecycleHistory: [
      { status: 'scanned', timestamp: '2026-10-15T06:15:00Z', actor: 'Alex Rivera (Citizen)' },
      { status: 'disposed', timestamp: '2026-10-15T06:16:12Z', actor: 'Alex Rivera (Confirmed Blue Bin)' },
      { status: 'collected', timestamp: '2026-10-15T06:30:00Z', actor: 'Elena Rostova (Lead)', note: 'Batch Station A collection' },
      { status: 'processing', timestamp: '2026-10-15T06:45:00Z', actor: 'Metro Materials Recovery Facility' },
      { status: 'recycled', timestamp: '2026-10-15T07:00:00Z', actor: 'Pelletizing Plant', note: 'Pelletized into food-grade rPET' },
    ]
  },
  {
    id: 'MAT-2026-000102',
    name: 'Organic Cavendish Banana Peel',
    category: 'biodegradable',
    binColor: 'brown',
    material: 'Organic Compostable Biomass',
    confidence: 0.99,
    decompositionTime: '2 to 4 weeks in industrial compost',
    recyclingInstructions: 'Place in the Brown compost bin. Eliminates methane emissions from open landfills.',
    imageUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&auto=format&fit=crop&q=80',
    timestamp: '2026-10-15T06:22:00Z',
    station: 'Station B · Cafeteria',
    userId: 'user-citizen-1',
    userName: 'Alex Rivera',
    suggestedPoints: 15,
    creditsAwarded: 15,
    confirmedBin: 'brown',
    confirmedAt: '2026-10-15T06:23:05Z',
    status: 'processing',
    disputed: false,
    engine: 'gemini',
    lifecycleHistory: [
      { status: 'scanned', timestamp: '2026-10-15T06:22:00Z', actor: 'Alex Rivera' },
      { status: 'disposed', timestamp: '2026-10-15T06:23:05Z', actor: 'Alex Rivera (Confirmed Brown Bin)' },
      { status: 'collected', timestamp: '2026-10-15T06:40:00Z', actor: 'Volunteer Marcus Chen' },
      { status: 'processing', timestamp: '2026-10-15T06:55:00Z', actor: 'City Aerobic Digester #2' },
    ]
  },
  {
    id: 'MAT-2026-000103',
    name: 'Swollen Li-Ion Smartphone Battery',
    category: 'hazardous',
    binColor: 'red',
    material: 'Lithium-Cobalt & Electrolyte Solution',
    confidence: 0.97,
    decompositionTime: 'Never decomposes · Leaches heavy metals',
    recyclingInstructions: 'CRITICAL: Place gently into Red Fire-Retardant Sand Locker. Do not puncture.',
    imageUrl: 'https://images.unsplash.com/photo-1584679109597-c656b19974c9?w=600&auto=format&fit=crop&q=80',
    timestamp: '2026-10-15T06:35:00Z',
    station: 'Station C · Science Innovation Hub',
    userId: 'user-citizen-1',
    userName: 'Alex Rivera',
    suggestedPoints: 25,
    creditsAwarded: 25,
    confirmedBin: 'red',
    confirmedAt: '2026-10-15T06:36:40Z',
    status: 'collected',
    disputed: false,
    engine: 'yolo',
    boundingBox: [120, 100, 500, 390],
    lifecycleHistory: [
      { status: 'scanned', timestamp: '2026-10-15T06:35:00Z', actor: 'Alex Rivera' },
      { status: 'disposed', timestamp: '2026-10-15T06:36:40Z', actor: 'Alex Rivera (Confirmed Red Bin)' },
      { status: 'collected', timestamp: '2026-10-15T06:50:00Z', actor: 'Elena Rostova (Hazard Team)', note: 'Quarantined in vermiculite barrel' },
    ]
  },
  {
    id: 'MAT-2026-000104',
    name: 'Stainless Steel Insulated Travel Tumbler',
    category: 'reusable',
    binColor: 'green',
    material: 'Food-Grade 18/8 Stainless Steel',
    confidence: 0.96,
    decompositionTime: 'Durable multi-year asset (>1,000 cycles)',
    recyclingInstructions: 'Do not throw away! Wash and reuse, or donate to the Green Reusable Exchange Locker.',
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80',
    timestamp: '2026-10-15T06:42:00Z',
    station: 'Station A · Library Plaza',
    userId: 'user-citizen-1',
    userName: 'Alex Rivera',
    suggestedPoints: 20,
    creditsAwarded: 20,
    confirmedBin: 'green',
    confirmedAt: '2026-10-15T06:43:10Z',
    status: 'disposed',
    disputed: false,
    engine: 'gemini',
    lifecycleHistory: [
      { status: 'scanned', timestamp: '2026-10-15T06:42:00Z', actor: 'Alex Rivera' },
      { status: 'disposed', timestamp: '2026-10-15T06:43:10Z', actor: 'Alex Rivera (Confirmed Green Hub)' }
    ]
  },
  {
    id: 'MAT-2026-000105',
    name: 'Greasy Cardboard Pizza Box with Cheese',
    category: 'biodegradable',
    binColor: 'brown',
    material: 'Grease-Soaked Kraft Paper Fiber',
    confidence: 0.94,
    decompositionTime: '2 to 3 months (Cannot be recycled into paper)',
    recyclingInstructions: 'Grease ruins paper recycling slurry! Put into Brown compost bin, NOT Blue recycling.',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    timestamp: '2026-10-15T06:48:00Z',
    station: 'Station B · Cafeteria',
    userId: 'user-citizen-1',
    userName: 'Alex Rivera',
    suggestedPoints: 15,
    creditsAwarded: 0,
    confirmedBin: 'blue',
    confirmedAt: '2026-10-15T06:49:15Z',
    status: 'disposed',
    disputed: true,
    disputeReason: 'Bin Mismatch: App recommended Brown (Compost) due to oil grease, user confirmed Blue (Recyclable). Flagged for contamination audit.',
    engine: 'yolo',
    boundingBox: [90, 70, 550, 440],
    lifecycleHistory: [
      { status: 'scanned', timestamp: '2026-10-15T06:48:00Z', actor: 'Alex Rivera' },
      { status: 'disposed', timestamp: '2026-10-15T06:49:15Z', actor: 'Alex Rivera (Mismatched to Blue Bin)', note: 'Flagged by system for volunteer audit' }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'LOG-01', timestamp: '2026-10-15T06:16:12Z', actorName: 'Alex Rivera', actorRole: 'citizen', action: 'BIN_CONFIRMATION', target: 'MAT-2026-000101', details: 'Confirmed Blue bin deposit. 15 Eco-Credits awarded.' },
  { id: 'LOG-02', timestamp: '2026-10-15T06:30:00Z', actorName: 'Elena Rostova', actorRole: 'admin', action: 'BATCH_STATUS_UPDATE', target: 'Batch Station A', details: 'Advanced 12 items from Station A to COLLECTED stage.' },
  { id: 'LOG-03', timestamp: '2026-10-15T06:49:15Z', actorName: 'System Verifier', actorRole: 'admin', action: 'MISMATCH_FLAGGED', target: 'MAT-2026-000105', details: 'Brown recommended vs Blue tapped by citizen. Dispute ticket created.' },
  { id: 'LOG-04', timestamp: '2026-10-15T07:05:00Z', actorName: 'Elena Rostova', actorRole: 'admin', action: 'DISPATCH_LOGISTICS', target: 'TR-402', details: 'Initiated transport manifest to Metro MRF Facility.' }
];

// Valid lifecycle progression rules (Phase 5)
const VALID_LIFECYCLE_TRANSITIONS: Record<LifecycleStatus, LifecycleStatus[]> = {
  scanned: ['disposed'],
  disposed: ['collected', 'rejected'],
  collected: ['processing', 'rejected'],
  processing: ['recycled', 'rejected'],
  recycled: [],
  rejected: []
};

export class EcoSortStore {
  private items: WasteItem[] = [...INITIAL_ITEMS];
  private users: UserAccount[] = [...SEED_USERS];
  private bins: SmartBin[] = [...SEED_BINS];
  private tasks: VolunteerTask[] = [...SEED_TASKS];
  private rewards: RewardItem[] = [...SEED_REWARDS];
  private reuseListings: ReuseListing[] = [...SEED_REUSE];
  private insights: AIInsight[] = [...SEED_INSIGHTS];
  private auditLogs: AuditLogEntry[] = [...INITIAL_AUDIT_LOGS];
  private authorizedAdmins: AuthorizedAdmin[] = [...SEED_AUTHORIZED_ADMINS];
  
  // Track reward transactions idempotently (Phase 10.D)
  private rewardLedger: Array<{
    id: string;
    userId: string;
    qualifyingEvent: string;
    points: number;
    timestamp: string;
    status: 'approved' | 'pending' | 'rejected';
  }> = [];

  // Generate unique stable Material Passport ID (Phase 5)
  generateMaterialId(): string {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    return `MAT-2026-${randomSuffix}`;
  }

  getItems(): WasteItem[] { return [...this.items]; }
  getUsers(): UserAccount[] { return [...this.users]; }
  addUser(user: UserAccount): void { this.users.push(user); }
  getBins(): SmartBin[] { return [...this.bins]; }
  getTasks(): VolunteerTask[] { return [...this.tasks]; }
  getRewards(): RewardItem[] { return [...this.rewards]; }
  getReuseListings(): ReuseListing[] { return [...this.reuseListings]; }
  getQuiz(): QuizQuestion[] { return SEED_QUIZ; }
  getInsights(): AIInsight[] { return [...this.insights]; }
  getAuditLogs(): AuditLogEntry[] { return [...this.auditLogs]; }

  getItemById(id: string): WasteItem | undefined {
    return this.items.find(i => i.id === id);
  }

  addItem(item: WasteItem): WasteItem {
    this.items.unshift(item);
    this.addAuditLog(item.userName || 'System Intake', 'citizen', 'NEW_SCAN', item.id, `Created scan for ${item.name} (${item.category})`);
    return item;
  }

  addAuditLog(actorName: string, actorRole: 'citizen' | 'volunteer' | 'admin', action: string, target: string, details: string) {
    this.auditLogs.unshift({
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      actorName,
      actorRole,
      action,
      target,
      details,
    });
  }

  // Validate state transitions
  isValidTransition(current: LifecycleStatus, next: LifecycleStatus): boolean {
    if (current === next) return true;
    const allowed = VALID_LIFECYCLE_TRANSITIONS[current] || [];
    return allowed.includes(next);
  }

  // Update item status with validation
  updateItemStatus(itemId: string, targetStatus: LifecycleStatus, actorName: string, note?: string): { success: boolean; item?: WasteItem; error?: string } {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return { success: false, error: 'Item not found' };

    if (!this.isValidTransition(item.status, targetStatus)) {
      return {
        success: false,
        error: `Invalid lifecycle transition from '${item.status}' to '${targetStatus}'. Material must follow valid sequential chain.`
      };
    }

    item.status = targetStatus;
    item.lifecycleHistory.push({
      status: targetStatus,
      timestamp: new Date().toISOString(),
      actor: actorName,
      note: note || `Status updated to ${targetStatus}`
    });

    this.addAuditLog(actorName, 'admin', 'STATUS_UPDATE', item.id, `Updated to ${targetStatus}. ${note || ''}`);
    return { success: true, item };
  }

  confirmBin(itemId: string, confirmedBin: BinColor, userId?: string): WasteItem | null {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return null;

    item.confirmedBin = confirmedBin;
    item.confirmedAt = new Date().toISOString();
    item.status = 'disposed';

    const isMatch = confirmedBin === item.binColor;

    // Check if points were already awarded for this item
    const alreadyAwarded = this.rewardLedger.some(
      r => r.qualifyingEvent === `BIN_CONFIRM_${itemId}` && r.status === 'approved'
    );

    if (isMatch) {
      item.disputed = false;
      item.creditsAwarded = item.suggestedPoints;
      item.lifecycleHistory.push({
        status: 'disposed',
        timestamp: new Date().toISOString(),
        actor: `${item.userName} (Confirmed ${confirmedBin.toUpperCase()} Bin)`,
        note: `Match confirmed. ${item.suggestedPoints} Eco-Credits credited.`
      });

      if (!alreadyAwarded) {
        const user = this.users.find(u => u.id === (userId || item.userId));
        if (user) {
          user.credits += item.suggestedPoints;
          user.itemsRecycled += 1;
          if (item.category === 'hazardous') user.hazardousSafeDrops += 1;
          user.co2DivertedKg += item.category === 'recyclable' ? 1.2 : 0.8;
        }

        this.rewardLedger.push({
          id: `TXN-${Date.now().toString().slice(-6)}`,
          userId: userId || item.userId,
          qualifyingEvent: `BIN_CONFIRM_${itemId}`,
          points: item.suggestedPoints,
          timestamp: new Date().toISOString(),
          status: 'approved'
        });
      }

      this.addAuditLog(item.userName, 'citizen', 'BIN_CONFIRMATION', item.id, `Match verified on ${confirmedBin.toUpperCase()} bin. Awarded ${item.suggestedPoints} pts.`);
    } else {
      item.disputed = true;
      item.creditsAwarded = 0;
      item.disputeReason = `Bin Mismatch: Recommended ${item.binColor.toUpperCase()} (${item.category}), but user confirmed deposit into ${confirmedBin.toUpperCase()} bin.`;
      item.lifecycleHistory.push({
        status: 'disposed',
        timestamp: new Date().toISOString(),
        actor: `${item.userName} (Tapped ${confirmedBin.toUpperCase()})`,
        note: `MISMATCH FLAGGED: Recommendation was ${item.binColor.toUpperCase()}. Sent to volunteer audit desk.`
      });

      this.addAuditLog(item.userName, 'citizen', 'MISMATCH_FLAGGED', item.id, `Discrepancy: ${item.binColor} vs user ${confirmedBin}. Queued for audit.`);
    }

    return item;
  }

  batchUpdateStatus(
    itemIds: string[], 
    targetStatus: LifecycleStatus, 
    volunteerName: string, 
    batchNote?: string
  ): { updatedCount: number; items: WasteItem[]; errors: string[] } {
    const updated: WasteItem[] = [];
    const errors: string[] = [];
    const timestamp = new Date().toISOString();

    for (const item of this.items) {
      if (itemIds.includes(item.id)) {
        if (!this.isValidTransition(item.status, targetStatus)) {
          errors.push(`Item ${item.id} cannot transition from ${item.status} to ${targetStatus}`);
          continue;
        }
        item.status = targetStatus;
        item.lifecycleHistory.push({
          status: targetStatus,
          timestamp,
          actor: volunteerName,
          note: batchNote || `Batch advanced to ${targetStatus}`
        });
        updated.push(item);
      }
    }

    this.addAuditLog(volunteerName, 'admin', 'BATCH_STATUS_UPDATE', `${updated.length} items`, `Batch advanced to ${targetStatus.toUpperCase()}. Note: ${batchNote || 'Standard transit'}`);
    return { updatedCount: updated.length, items: updated, errors };
  }

  auditDispute(
    itemId: string,
    action: 'approved' | 'overruled' | 'reclassified',
    volunteerName: string,
    notes?: string,
    newCategory?: WasteCategory
  ): WasteItem | null {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return null;

    item.auditAction = action;
    item.auditedBy = volunteerName;
    item.auditedAt = new Date().toISOString();
    item.volunteerNotes = notes;

    const user = this.users.find(u => u.id === item.userId);

    if (action === 'approved') {
      item.disputed = false;
      item.creditsAwarded = item.suggestedPoints;
      if (user) {
        user.credits += item.suggestedPoints;
        user.itemsRecycled += 1;
      }
      item.lifecycleHistory.push({
        status: item.status,
        timestamp: new Date().toISOString(),
        actor: `${volunteerName} (Dispute Audit)`,
        note: `Approved by volunteer: ${notes || 'Credits awarded'}.`
      });
    } else if (action === 'overruled') {
      item.disputed = true;
      item.creditsAwarded = 0;
      item.status = 'rejected';
      item.lifecycleHistory.push({
        status: 'rejected',
        timestamp: new Date().toISOString(),
        actor: `${volunteerName} (Dispute Audit)`,
        note: `Contamination confirmed: ${notes || 'Marked as rejected/re-routed'}.`
      });
    } else if (action === 'reclassified' && newCategory) {
      item.category = newCategory;
      const binMap: Record<WasteCategory, BinColor> = {
        recyclable: 'blue',
        reusable: 'green',
        biodegradable: 'brown',
        hazardous: 'red',
        unclassified: 'slate'
      };
      item.binColor = binMap[newCategory];
      item.disputed = false;
      item.lifecycleHistory.push({
        status: item.status,
        timestamp: new Date().toISOString(),
        actor: `${volunteerName} (Reclassification)`,
        note: `Reclassified as ${newCategory.toUpperCase()} (${item.binColor} bin). ${notes || ''}`
      });
    }

    this.addAuditLog(volunteerName, 'admin', 'DISPUTE_RESOLVED', item.id, `Action: ${action.toUpperCase()}. ${notes || ''}`);
    return item;
  }

  emptyBin(binId: string, actorName: string = 'Elena Rostova'): { bin: SmartBin; batchId: string; collectedCount: number; task?: VolunteerTask } | null {
    const bin = this.bins.find(b => b.id === binId);
    if (!bin) return null;

    // Generate official logistics batch identifier
    const dateStr = new Date().toISOString().slice(5, 10).replace('-', '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const batchId = `BATCH-${dateStr}-${bin.binColor.toUpperCase()}-${randomSuffix}`;

    // Find items deposited in physical bins matching this stream or station
    let matchingItems = this.items.filter((s: WasteItem) => 
      s.status === 'disposed' && (
        s.binColor === bin.binColor || 
        s.category === bin.category || 
        s.station.toLowerCase().includes(bin.station.toLowerCase().slice(0, 9))
      )
    );

    // If no direct matches, grab available disposed items
    if (matchingItems.length === 0) {
      matchingItems = this.items.filter((s: WasteItem) => s.status === 'disposed').slice(0, 3);
    }

    // Advance items from 'disposed' to 'collected' with batch ID & audit record
    matchingItems.forEach((item: WasteItem) => {
      item.status = 'collected';
      item.batchId = batchId;
      item.lifecycleHistory.push({
        status: 'collected',
        timestamp: new Date().toISOString(),
        actor: `${actorName} (Smart Bin Batch Dispatcher)`,
        note: `Collected from ${bin.station} (${bin.binColor.toUpperCase()} receptacle). Batched as ${batchId} for transport to sorting gantry.`
      });
    });

    const collectedCount = matchingItems.length;

    // Reset bin sensor state
    bin.fillPercentage = 0;
    bin.itemCount = 0;
    bin.lastEmptied = new Date().toISOString();
    bin.status = 'normal';

    // Auto-create volunteer collection task in the operations queue
    const newTask: VolunteerTask = {
      id: `TASK-COLLECT-${Date.now().toString().slice(-4)}`,
      title: `Transport Batch ${batchId} (${collectedCount} items) to Central Facility`,
      station: bin.station,
      type: 'collection',
      priority: 'high',
      status: 'in_progress',
      assignedToName: actorName,
      dueDate: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      itemsCount: collectedCount
    };
    this.tasks.unshift(newTask);

    this.addAuditLog(actorName, 'volunteer', 'BATCH_DISPATCHED', batchId, `Dispatched collection batch ${batchId} with ${collectedCount} items from ${bin.station}. Bin reset to 0%.`);
    return { bin, batchId, collectedCount, task: newTask };
  }

  dispatchAllCriticalBins(actorName: string = 'Elena Rostova'): { dispatchedCount: number; batches: string[]; totalItemsCollected: number } {
    const criticalBins = this.bins.filter(b => b.fillPercentage >= 75);
    const batches: string[] = [];
    let totalItems = 0;

    criticalBins.forEach(bin => {
      const res = this.emptyBin(bin.id, actorName);
      if (res) {
        batches.push(res.batchId);
        totalItems += res.collectedCount;
      }
    });

    return {
      dispatchedCount: criticalBins.length,
      batches,
      totalItemsCollected: totalItems
    };
  }

  completeTask(taskId: string, actorName: string = 'Elena Rostova'): VolunteerTask | null {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return null;
    task.status = 'completed';
    task.assignedToName = actorName;
    this.addAuditLog(actorName, 'volunteer', 'TASK_COMPLETED', task.id, `Completed task: ${task.title}`);
    return task;
  }

  claimReward(rewardId: string, userId: string): { success: boolean; reward?: RewardItem; user?: UserAccount; error?: string } {
    const reward = this.rewards.find(r => r.id === rewardId);
    const user = this.users.find(u => u.id === userId);
    if (!reward) return { success: false, error: 'Reward not found' };
    if (!user) return { success: false, error: 'User not found' };
    if (user.credits < reward.creditCost) return { success: false, error: 'Insufficient Eco-Credits balance' };

    user.credits -= reward.creditCost;
    reward.stock = Math.max(0, reward.stock - 1);
    this.addAuditLog(user.name, 'citizen', 'REWARD_REDEEMED', reward.id, `Redeemed ${reward.title} for ${reward.creditCost} credits.`);
    return { success: true, reward, user };
  }

  claimReuseItem(listingId: string, claimantName: string): ReuseListing | null {
    const item = this.reuseListings.find(r => r.id === listingId);
    if (!item || item.status === 'claimed') return null;
    item.status = 'claimed';
    this.addAuditLog(claimantName, 'citizen', 'REUSE_CLAIMED', item.id, `Claimed circular reuse item: ${item.title}`);
    return item;
  }

  createReuseListing(listing: Omit<ReuseListing, 'id' | 'timestamp' | 'status'>): ReuseListing {
    const newListing: ReuseListing = {
      ...listing,
      id: `REUSE-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      status: 'available'
    };
    this.reuseListings.unshift(newListing);
    this.addAuditLog(listing.donorName, 'citizen', 'REUSE_LISTED', newListing.id, `Listed new reuse item: ${newListing.title}`);
    return newListing;
  }

  getAnalytics(): AnalyticsSummary {
    const totalScans = this.items.length;
    const disposedCount = this.items.filter(i => i.status === 'disposed').length;
    const collectedCount = this.items.filter(i => i.status === 'collected').length;
    const inProcessingCount = this.items.filter(i => i.status === 'processing').length;
    const recycledCount = this.items.filter(i => i.status === 'recycled').length;
    const rejectedCount = this.items.filter(i => i.status === 'rejected').length;
    const disputedCount = this.items.filter(i => i.disputed).length;
    const resolvedDisputesCount = this.items.filter(i => i.auditAction !== undefined).length;

    const completed = recycledCount + rejectedCount;
    const overallRecyclingRate = completed > 0 
      ? Math.round((recycledCount / completed) * 100)
      : (totalScans > 0 ? 88 : 0);

    const contaminationRate = totalScans > 0 
      ? Math.round((disputedCount / totalScans) * 100)
      : 0;

    let co2AvoidedTotalKg = 0;
    const categoryBreakdown: Record<WasteCategory, number> = {
      recyclable: 0,
      reusable: 0,
      biodegradable: 0,
      hazardous: 0,
      unclassified: 0,
    };

    const binBreakdown: Record<BinColor, number> = {
      blue: 0,
      green: 0,
      brown: 0,
      red: 0,
      slate: 0,
    };

    for (const item of this.items) {
      if (item.category in categoryBreakdown) {
        categoryBreakdown[item.category] += 1;
      }
      if (item.binColor in binBreakdown) {
        binBreakdown[item.binColor] += 1;
      }
      if (item.status === 'recycled' || item.status === 'processing' || item.status === 'collected') {
        co2AvoidedTotalKg += item.category === 'recyclable' ? 1.2 : 0.8;
      }
    }

    const problemAreas = [
      {
        station: 'Station C · Science Innovation Hub',
        issue: 'Hazardous e-waste receptacle reached 92% capacity. Hazardous team dispatched.',
        urgency: 'high' as const,
        stat: '14 uncollected batteries',
      },
      {
        station: 'Station B · Engineering Cafeteria',
        issue: 'Compost contamination spike: Greasy pizza boxes mistakenly deposited in Blue bin.',
        urgency: 'medium' as const,
        stat: '18% mismatch rate',
      },
    ];

    return {
      totalScans,
      disposedCount,
      collectedCount,
      inProcessingCount,
      recycledCount,
      rejectedCount,
      disputedCount,
      resolvedDisputesCount,
      overallRecyclingRate,
      contaminationRate,
      co2AvoidedTotalKg: Number(co2AvoidedTotalKg.toFixed(1)),
      categoryBreakdown,
      binBreakdown,
      problemAreas,
    };
  }

  // Digital Twin state derived from actual stored records (Phase 7)
  getDigitalTwinOverview() {
    const totalItems = this.items.length;
    const itemsByStage = {
      scanned: this.items.filter(i => i.status === 'scanned').length,
      disposedInBin: this.items.filter(i => i.status === 'disposed').length,
      collectedInTransit: this.items.filter(i => i.status === 'collected').length,
      facilityProcessing: this.items.filter(i => i.status === 'processing').length,
      recycledOutput: this.items.filter(i => i.status === 'recycled').length,
      rejectedContaminated: this.items.filter(i => i.status === 'rejected').length
    };

    return {
      facility: 'EcoFlux MRF Smart Facility #1',
      totalTrackedUnits: totalItems,
      itemsByStage,
      conveyorLoadItems: this.items.filter(i => i.status === 'processing').slice(0, 6),
      activeBinsCount: this.bins.length,
      averageBinFill: Math.round(this.bins.reduce((acc, b) => acc + b.fillPercentage, 0) / this.bins.length),
      timestamp: new Date().toISOString()
    };
  }

  getDigitalTwinBatches() {
    const stages: LifecycleStatus[] = ['disposed', 'collected', 'processing', 'recycled'];
    return stages.map(st => {
      const stageItems = this.items.filter(i => i.status === st);
      return {
        stage: st,
        count: stageItems.length,
        items: stageItems.map(i => ({
          id: i.id,
          name: i.name,
          category: i.category,
          binColor: i.binColor,
          station: i.station
        }))
      };
    });
  }

  getAdminReviews() {
    return this.items.filter(i => i.disputed || i.category === 'unclassified' || i.confidence < 0.85);
  }

  getSystemHealth() {
    return {
      status: 'healthy',
      geminiVisionConfigured: !!(ai && geminiApiKey),
      yoloEdgeVisionReady: true,
      recordsCount: this.items.length,
      activeUsersCount: this.users.length,
      auditLogEntries: this.auditLogs.length,
      serverUptimeSec: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    };
  }

  getUser(userIdOrEmail: string): UserAccount | undefined {
    return this.users.find(u => u.id === userIdOrEmail || u.email === userIdOrEmail);
  }

  getAuthorizedAdmins(): AuthorizedAdmin[] {
    return [...this.authorizedAdmins];
  }

  isEmailAuthorizedAdmin(email: string): AuthorizedAdmin | undefined {
    if (!email) return undefined;
    const cleanEmail = email.trim().toLowerCase();
    return this.authorizedAdmins.find(a => a.email.toLowerCase() === cleanEmail && a.status === 'active');
  }

  authorizeAdminEmail(data: {
    email: string;
    name?: string;
    role?: 'admin' | 'volunteer';
    department?: string;
    authorizedBy?: string;
  }): { success: boolean; authorizedAdmin?: AuthorizedAdmin; error?: string } {
    const cleanEmail = (data.email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }

    const existing = this.authorizedAdmins.find(a => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      existing.status = 'active';
      if (data.role) existing.role = data.role;
      if (data.name) existing.name = data.name;
      if (data.department) existing.department = data.department;
      return { success: true, authorizedAdmin: existing };
    }

    const newAdmin: AuthorizedAdmin = {
      id: `auth-admin-${Date.now()}`,
      email: cleanEmail,
      name: data.name || cleanEmail.split('@')[0],
      role: data.role || 'admin',
      isMainAdmin: false,
      department: data.department || 'Operations Team',
      authorizedAt: new Date().toISOString(),
      authorizedBy: data.authorizedBy || 'Elena Rostova (Main Admin)',
      status: 'active'
    };

    this.authorizedAdmins.push(newAdmin);

    // Sync with users array if account already exists, or create a ready profile
    let user = this.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (user) {
      user.role = newAdmin.role;
      user.name = newAdmin.name || user.name;
    } else {
      this.users.push({
        id: `user-admin-${Date.now()}`,
        email: cleanEmail,
        name: newAdmin.name,
        role: newAdmin.role,
        isMainAdmin: false,
        stationOrZone: newAdmin.department,
        credits: 500,
        rank: 'Authorized Operations Admin',
        itemsRecycled: 42,
        hazardousSafeDrops: 8,
        co2DivertedKg: 52.0,
        streakDays: 4,
        badges: ['Authorized Admin', 'Operations Verified']
      });
    }

    this.addAuditLog(
      data.authorizedBy || 'Elena Rostova (Main Admin)',
      'admin',
      'AUTHORIZE_ADMIN_EMAIL',
      cleanEmail,
      `Authorized new admin email ${cleanEmail} (${newAdmin.name}) with role ${newAdmin.role}`
    );

    return { success: true, authorizedAdmin: newAdmin };
  }

  revokeAdminEmail(email: string, actorName?: string): { success: boolean; error?: string } {
    const cleanEmail = (email || '').trim().toLowerCase();
    const admin = this.authorizedAdmins.find(a => a.email.toLowerCase() === cleanEmail);
    if (!admin) {
      return { success: false, error: 'Admin email not found in directory.' };
    }
    if (admin.isMainAdmin) {
      return { success: false, error: 'Cannot revoke root privileges for the Main Administrator.' };
    }

    this.authorizedAdmins = this.authorizedAdmins.filter(a => a.email.toLowerCase() !== cleanEmail);

    // If exists in users, demote to citizen
    const user = this.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (user) {
      user.role = 'citizen';
    }

    this.addAuditLog(
      actorName || 'Elena Rostova (Main Admin)',
      'admin',
      'REVOKE_ADMIN_EMAIL',
      cleanEmail,
      `Revoked administrator privileges for ${cleanEmail}`
    );

    return { success: true };
  }

  resetDemo() {
    this.items = [...INITIAL_ITEMS];
    this.users = [...SEED_USERS];
    this.bins = [...SEED_BINS];
    this.tasks = [...SEED_TASKS];
    this.rewards = [...SEED_REWARDS];
    this.reuseListings = [...SEED_REUSE];
    this.insights = [...SEED_INSIGHTS];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.authorizedAdmins = [...SEED_AUTHORIZED_ADMINS];
    this.rewardLedger = [];
  }
}

export const store = new EcoSortStore();

// Heuristic ClassMap Classifier
export function classifyWasteHeuristic(hintText?: string): ScanAnalysisResult {
  const text = (hintText || '').toLowerCase();

  if (text.includes('battery') || text.includes('phone') || text.includes('laptop') || text.includes('circuit') || text.includes('keyboard') || text.includes('mouse') || text.includes('charger')) {
    return {
      itemName: 'Lithium Battery / Electronic E-Waste',
      category: 'hazardous',
      binColor: 'red',
      material: 'Lithium-Ion / Mixed Metals & Circuitry',
      confidence: 0.97,
      decompositionTime: 'Never decomposes · Dangerous chemical & fire hazard',
      recyclingInstructions: 'Deposit strictly into the Red Hazardous receptacle. Never dispose in regular bins.',
      suggestedPoints: 25,
      detectedFeatures: ['Lithium Cells', 'Fire Hazard Warning', 'Metal Terminals'],
      engine: 'yolo',
      boundingBox: [120, 80, 520, 400]
    };
  }

  if (text.includes('banana') || text.includes('apple') || text.includes('food') || text.includes('peel') || text.includes('coffee') || text.includes('pizza') || text.includes('bread')) {
    return {
      itemName: text.includes('pizza') ? 'Greasy Pizza Box (Compostable)' : 'Organic Food Waste / Fruit Peel',
      category: 'biodegradable',
      binColor: 'brown',
      material: 'Cellulose Organic Biomass',
      confidence: 0.98,
      decompositionTime: '2 to 4 weeks in commercial compost',
      recyclingInstructions: 'Drop in Brown compost bin. Diverts methane emissions and generates organic fertilizer.',
      suggestedPoints: 15,
      detectedFeatures: ['Organic Moisture', 'Natural Fiber', 'Zero Synthetic Polymers'],
      engine: 'yolo',
      boundingBox: [100, 90, 530, 420]
    };
  }

  if (text.includes('tumbler') || text.includes('cup') || text.includes('bowl') || text.includes('tote') || text.includes('bag') || text.includes('mug') || text.includes('reusable')) {
    return {
      itemName: 'Reusable Insulated Container / Mug',
      category: 'reusable',
      binColor: 'green',
      material: 'Food-Grade Stainless Steel & Silicone',
      confidence: 0.95,
      decompositionTime: 'Durable multi-year lifecycle (>1,000 uses)',
      recyclingInstructions: 'Wash and keep using! Or deposit in the Green Reusable Exchange Locker.',
      suggestedPoints: 20,
      detectedFeatures: ['Double-wall insulation', 'Washable gasket', 'Durable steel casing'],
      engine: 'yolo',
      boundingBox: [140, 70, 500, 430]
    };
  }

  if (text.includes('chip') || text.includes('metallized') || text.includes('composite') || text.includes('foil') || text.includes('mystery')) {
    return {
      itemName: 'Composite Multilayer Snack Film',
      category: 'unclassified',
      binColor: 'slate',
      material: 'Mixed Metallized Polypropylene Composite',
      confidence: 0.68,
      decompositionTime: 'Indefinite non-recyclable composite',
      recyclingInstructions: 'Multi-layer polymers cannot be separated mechanically. Flagged for volunteer audit.',
      suggestedPoints: 10,
      detectedFeatures: ['Aluminized Mylar', 'Heat-sealed seams', 'Mixed polymer density'],
      engine: 'yolo',
      boundingBox: [130, 100, 510, 410]
    };
  }

  // Default: Recyclable
  return {
    itemName: 'Clear PET Water Bottle (500ml)',
    category: 'recyclable',
    binColor: 'blue',
    material: 'PET #1 (Polyethylene Terephthalate)',
    confidence: 0.96,
    decompositionTime: '450 years if landfilled',
    recyclingInstructions: 'Empty all liquids, squeeze to save bin space, tighten cap, and place into the Blue bin.',
    suggestedPoints: 15,
    detectedFeatures: ['Molded PET triangle #1', 'Transparent cylindrical body', 'Threaded HDPE neck'],
    engine: 'yolo',
    boundingBox: [110, 80, 520, 420]
  };
}

// Multimodal Gemini 3.8 Flash Analyzer
export async function analyzeWasteWithGemini(
  imageBase64: string, 
  mimeType: string = 'image/jpeg'
): Promise<ScanAnalysisResult> {
  if (!ai || !geminiApiKey) {
    throw new Error('Gemini vision is not configured. Set GEMINI_API_KEY in .env and restart the server, or select YOLOv8 Edge Vision.');
  }

  try {
    const prompt = `Analyze this waste/item image for EcoFlux AI smart recycling platform.
Classify it strictly into ONE of the following 4 official streams:
1. "recyclable" (binColor: "blue") - bottles, glass, paper, cardboard, aluminum cans, clean plastics
2. "reusable" (binColor: "green") - durable travel mugs, tumblers, tote bags, glass jars, food containers
3. "biodegradable" (binColor: "brown") - fruit peels, banana, apple core, food scraps, compostables
4. "hazardous" (binColor: "red") - phone, laptop, keyboard, batteries, chargers, e-waste, aerosols, chemicals
If completely unknown, ambiguous, or multi-material contaminated foil, classify as "unclassified" (binColor: "slate").

Respond in valid JSON matching this schema:
{
  "itemName": string,
  "category": "recyclable" | "reusable" | "biodegradable" | "hazardous" | "unclassified",
  "binColor": "blue" | "green" | "brown" | "red" | "slate",
  "material": string,
  "confidence": number between 0.70 and 0.99,
  "decompositionTime": string,
  "recyclingInstructions": string,
  "suggestedPoints": integer,
  "detectedFeatures": string[]
}`;

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || 'image/jpeg',
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '';
    const parsed = JSON.parse(text) as ScanAnalysisResult;

    const categoryMap: Record<WasteCategory, BinColor> = {
      recyclable: 'blue',
      reusable: 'green',
      biodegradable: 'brown',
      hazardous: 'red',
      unclassified: 'slate'
    };

    const validCategory: WasteCategory =
      ['recyclable', 'reusable', 'biodegradable', 'hazardous', 'unclassified'].includes(parsed.category)
        ? parsed.category
        : 'unclassified';
    const confidence = typeof parsed.confidence === 'number' && Number.isFinite(parsed.confidence)
      ? Math.min(Math.max(parsed.confidence, 0), 1)
      : 0;

    return {
      itemName: parsed.itemName || 'Identified Waste Item',
      category: validCategory,
      binColor: categoryMap[validCategory] || 'blue',
      material: parsed.material || 'Mixed Material',
      confidence,
      decompositionTime: parsed.decompositionTime || 'Varies by landfill condition',
      recyclingInstructions: parsed.recyclingInstructions || `Please deposit into the ${categoryMap[validCategory].toUpperCase()} bin.`,
      suggestedPoints: validCategory === 'hazardous' ? 25 : 15,
      detectedFeatures: parsed.detectedFeatures || ['Visual match', 'Surface material identification'],
      engine: 'gemini'
    };
  } catch (error) {
    console.error('[EcoFlux Gemini Vision] Analysis failed:', error);
    throw new Error(`Gemini vision analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Executes Python WasteDetector directly on the server (handles image files & base64)
export function runYoloDetector(options?: { imageBase64?: string; hintText?: string } | string): Promise<ScanAnalysisResult> {
  return new Promise((resolve, reject) => {
    let hintText: string | undefined;
    let imageBase64: string | undefined;

    if (typeof options === 'string') {
      hintText = options;
    } else if (options) {
      hintText = options.hintText;
      imageBase64 = options.imageBase64;
    }

    const pythonPath = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
    const scriptPath = path.resolve(process.cwd(), 'vision/detector.py');
    let tempImgPath: string | null = null;
    let args: string[] = [];

    if (imageBase64 && imageBase64.length > 50) {
      try {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        tempImgPath = path.join(os.tmpdir(), `ecosort_scan_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`);
        fs.writeFileSync(tempImgPath, Buffer.from(cleanBase64, 'base64'));
        args = ['--image', tempImgPath, '--json'];
      } catch (e) {
        tempImgPath = null;
        if (hintText) {
          args = ['--hint', hintText, '--json'];
        } else {
          reject(new Error(`Unable to prepare the image for YOLO analysis: ${e instanceof Error ? e.message : 'Unknown error'}`));
          return;
        }
      }
    } else {
      args = hintText ? ['--hint', hintText, '--json'] : ['--hint', 'bottle', '--json'];
    }

    execFile(pythonPath, [scriptPath, ...args], (error, stdout, stderr) => {
      // Clean up temporary image file safely
      if (tempImgPath && fs.existsSync(tempImgPath)) {
        try { fs.unlinkSync(tempImgPath); } catch {}
      }

      if (error || !stdout) {
        return reject(new Error(`YOLO analysis failed: ${stderr.trim() || error?.message || 'No detector output'}`));
      }

      try {
        const parsed = JSON.parse(stdout);
        const prim = parsed.primary || {};
        resolve({
          itemName: prim.class_name ? `Detected: ${prim.class_name.toUpperCase()}` : 'Identified Waste Item',
          category: prim.category || 'recyclable',
          binColor: prim.bin_color || 'blue',
          material: prim.material || 'Mixed Material',
          confidence: typeof prim.confidence === 'number' ? prim.confidence : 0.94,
          decompositionTime: prim.decomposition || 'Standard municipal sorting',
          recyclingInstructions: prim.instructions || 'Deposit in appropriate bin.',
          suggestedPoints: prim.suggested_points || 15,
          detectedFeatures: [
            `YOLO class: ${prim.class_name}`,
            `ClassMap stream: ${prim.category}`,
            `Confidence: ${Math.round((typeof prim.confidence === 'number' ? prim.confidence : 0.94) * 100)}%`
          ],
          engine: 'yolo',
          boundingBox: prim.bbox || [120, 80, 520, 400]
        });
      } catch (error) {
        reject(new Error(`YOLO detector returned invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });
  });
}

// Generative AI Assistant Service
export async function askEcoAssistant(userQuery: string, historyContext?: string): Promise<string> {
  if (ai && geminiApiKey) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are the EcoFlux AI Circular Economy & Recycling Specialist.
Provide an encouraging, accurate, science-backed response to the user's question about recycling, reuse, composting, or material safety.
Format clearly with short bullet points or concise paragraphs. Be practical and prevent contamination.

User Question: "${userQuery}"
Context: ${historyContext || 'Campus Smart Recycling Station'}`,
      });
      return response.text || 'Recycling guidance could not be formatted. Please try again.';
    } catch (err) {
      console.warn('Gemini Assistant fallback:', err);
    }
  }

  // Smart Heuristic fallback answers
  const q = userQuery.toLowerCase();
  if (q.includes('pizza') || q.includes('grease') || q.includes('box')) {
    return 'Greasy cardboard from pizza boxes contains animal fats and vegetable oils that cannot be separated during the water pulping process at paper mills. One greasy box can contaminate an entire 500-gallon pulp slurry! Solution: Tear off clean top lid for the Blue paper bin; place the oily bottom half in the Brown compost bin.';
  }
  if (q.includes('battery') || q.includes('lithium') || q.includes('fire') || q.includes('phone')) {
    return 'Lithium-ion and rechargeable batteries must NEVER be placed in curbside recycling or trash. Under the hydraulic compression of waste haulers, punctured lithium cells ignite chemical thermal runaway fires. Always deposit them into our Red Fire-Retardant E-Waste tubes at Station C.';
  }
  if (q.includes('jar') || q.includes('upcycle') || q.includes('reuse')) {
    return 'Glass jars (flint or amber) are 100% circular and infinitely reusable! Creative upcycling ideas: (1) Bulk pantry storage for oats and spices, (2) Planters for kitchen herb cuttings, (3) Candle holders or craft organizers. You can also list clean jars on our Reuse & Donation Hub for campus art students.';
  }
  return `To protect circular material flows: (1) Keep items clean and dry, (2) Verify local category color codes (Blue=Recycle, Green=Reuse, Brown=Compost, Red=Hazardous), and (3) When in doubt, request a Volunteer Audit rather than wish-cycling into the wrong container.`;
}

// Structured Circularity Recommendation Generator (Phase 8.2)
export async function generateStructuredRecommendation(materialName: string, category: string, historyContext?: string) {
  if (ai && geminiApiKey) {
    try {
      const prompt = `Provide a structured circular economy recommendation for this item:
Item: "${materialName}" (Category: "${category}")
User Context: "${historyContext || 'Campus Citizen'}"

Return valid JSON:
{
  "explanation": "Short scientific explanation of recyclability",
  "recommendedAction": "Exact immediate step the user should take",
  "category": "${category}",
  "preparationInstructions": "Cleaning, rinsing or cap removal steps",
  "reuseOrRepairAlternatives": "Creative upcycling or repair idea before disposal",
  "safetyWarnings": "Any hazard or contamination warning",
  "confidenceNote": "High confidence municipal guideline"
}`;

      const res = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      return JSON.parse(res.text || '{}');
    } catch (e) {
      console.warn('Structured recommendation fallback:', e);
    }
  }

  // High-fidelity fallback
  return {
    explanation: `${materialName} requires proper separation into the designated stream to maintain secondary material purity.`,
    recommendedAction: `Empty liquids, verify container is dry, and place into the assigned receptacle.`,
    category,
    preparationInstructions: `Rinse with room-temperature water to prevent mold growth in collection bins.`,
    reuseOrRepairAlternatives: `Consider repurposing into household planters or organizers.`,
    safetyWarnings: category === 'hazardous' ? 'Fire & chemical leaching hazard: never incinerate or puncture.' : 'Keep free of food oils to prevent batch contamination.',
    confidenceNote: 'Standard EPA Circular Economy protocol.'
  };
}
