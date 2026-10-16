import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { 
  store, 
  analyzeWasteWithGemini, 
  classifyWasteHeuristic, 
  runYoloDetector, 
  askEcoAssistant,
  generateStructuredRecommendation,
  SEED_USERS 
} from './apiHandler.ts';
import type { WasteCategory, BinColor, LifecycleStatus, WasteItem, UserAccount } from '../src/types/ecosort.ts';

export const apiRouter = express.Router();

apiRouter.use(express.json({ limit: '20mb' }));

// Role-based authorization middleware (Phase 4)
function requireRole(allowedRoles: Array<'citizen' | 'volunteer' | 'admin'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const roleHeader = (req.headers['x-user-role'] as string) || (req.headers['authorization'] as string);
    const userIdHeader = req.headers['x-user-id'] as string;

    // Check user record
    let user: UserAccount | undefined;
    if (userIdHeader) {
      user = store.getUser(userIdHeader);
    }

    const currentRole = user?.role || (roleHeader as 'citizen' | 'volunteer' | 'admin') || 'citizen';

    if (!allowedRoles.includes(currentRole)) {
      return res.status(403).json({ 
        error: `Access Denied: Requires one of [${allowedRoles.join(', ')}] role. Your role: ${currentRole}`,
        requiredRoles: allowedRoles,
        currentRole
      });
    }

    next();
  };
}

// Health Check & System Diagnostics (Phase 6 & 11)
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', platform: 'EcoFlux AI Intelligence', time: new Date().toISOString() });
});

// Direct project zip download for VS Code local development
apiRouter.get('/download-zip', (_req: Request, res: Response) => {
  const zipPath = path.resolve(process.cwd(), 'public/ecosort-ai-project.zip');
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="ecosort-ai-project.zip"');
  res.sendFile(zipPath);
});

apiRouter.get('/admin/system-health', (_req: Request, res: Response) => {
  res.json(store.getSystemHealth());
});

// Authentication endpoints (Phase 4)
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { email, name, role = 'citizen' } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }

  const existing = store.getUser(email);
  if (existing) {
    return res.status(409).json({ error: 'User already registered' });
  }

  const newUser: UserAccount = {
    id: `user-${Date.now().toString().slice(-6)}`,
    email,
    name,
    role: role === 'admin' ? 'volunteer' : role, // Prevent unauthorized admin self-promotion
    credits: 50,
    rank: 'Eco Newcomer (Tier 1)',
    itemsRecycled: 0,
    hazardousSafeDrops: 0,
    co2DivertedKg: 0,
    streakDays: 1,
    badges: ['Welcome Recycler']
  };

  store.getUsers().push(newUser);
  res.json({ success: true, user: newUser });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, role, portal = 'citizen' } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return res.status(400).json({ success: false, error: 'A valid email address is required.' });
  }

  // ADMIN SECTION LOGIN: Strictly allow only verified admin emails
  if (portal === 'admin' || role === 'admin' || role === 'volunteer') {
    const authorized = store.isEmailAuthorizedAdmin(cleanEmail);
    if (!authorized) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: '${cleanEmail}' is not an authorized administrator email. Only emails verified in advance by the Main Admin (Elena Rostova) can access the Admin section. Regular users cannot log in here. Please use the Citizen Portal or contact the Main Admin.`
      });
    }

    let user = store.getUser(cleanEmail);
    if (!user) {
      user = {
        id: `user-admin-${Date.now()}`,
        email: cleanEmail,
        name: authorized.name || cleanEmail.split('@')[0],
        role: authorized.role,
        isMainAdmin: authorized.isMainAdmin,
        stationOrZone: authorized.department,
        credits: 500,
        rank: authorized.isMainAdmin ? 'Main Administrator & Lead Auditor' : 'Verified Operations Admin',
        itemsRecycled: 50,
        hazardousSafeDrops: 10,
        co2DivertedKg: 65.0,
        streakDays: 7,
        badges: authorized.isMainAdmin ? ['Root Admin', 'Operations Master'] : ['Authorized Admin', 'Operations Verified']
      };
      store.getUsers().push(user);
    } else {
      user.role = authorized.role;
      user.isMainAdmin = authorized.isMainAdmin;
    }

    return res.json({
      success: true,
      user,
      token: `token-${user.id}-${Date.now()}`
    });
  }

  // CITIZEN SECTION LOGIN: Open access for all users
  let user = store.getUser(cleanEmail);
  if (!user) {
    const namePart = (cleanEmail.split('@')[0] || 'Citizen').replace(/[._]/g, ' ');
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    user = {
      id: `user-citizen-${Date.now()}`,
      email: cleanEmail,
      name: req.body.name || formattedName,
      role: 'citizen',
      stationOrZone: 'West Campus Hub · Station A',
      credits: 100,
      rank: 'Eco Newcomer (Tier 1)',
      itemsRecycled: 0,
      hazardousSafeDrops: 0,
      co2DivertedKg: 0,
      streakDays: 1,
      badges: ['Welcome Recycler']
    };
    store.getUsers().push(user);
  }

  return res.json({ 
    success: true, 
    user,
    token: `token-${user.id}-${Date.now()}`
  });
});

// Admin Authorization Registry Endpoints (Phase 4 Security & Governance)
apiRouter.get('/admin/authorized-admins', (_req: Request, res: Response) => {
  res.json({ authorizedAdmins: store.getAuthorizedAdmins() });
});

apiRouter.post('/admin/authorize-email', (req: Request, res: Response) => {
  const { email, name, role = 'admin', department, actorName } = req.body;
  const result = store.authorizeAdminEmail({
    email,
    name,
    role,
    department,
    authorizedBy: actorName || 'Elena Rostova (Main Admin)'
  });

  if (!result.success) {
    return res.status(400).json(result);
  }
  return res.json({ success: true, authorizedAdmin: result.authorizedAdmin, authorizedAdmins: store.getAuthorizedAdmins() });
});

apiRouter.delete('/admin/authorize-email/:email', (req: Request, res: Response) => {
  const { email } = req.params;
  const { actorName } = req.body || {};
  const result = store.revokeAdminEmail(email, actorName);

  if (!result.success) {
    return res.status(400).json(result);
  }
  return res.json({ success: true, authorizedAdmins: store.getAuthorizedAdmins() });
});

apiRouter.post('/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  const user = store.getUser(userId || 'user-citizen-1') || SEED_USERS[0];
  res.json({ user });
});

// User Profile
apiRouter.get('/user/:id', (req: Request, res: Response) => {
  const user = store.getUser(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

apiRouter.get('/admin/users', requireRole(['admin', 'volunteer']), (_req: Request, res: Response) => {
  res.json({ users: store.getUsers() });
});

// Scanning & Material Intake (Phase 3 & Phase 5)
const handleScanIntake = async (req: Request, res: Response) => {
  try {
    const { 
      imageBase64, 
      mimeType, 
      hintText, 
      engine = 'yolo',
      station = 'Station A · Library Plaza',
      userId = 'user-citizen-1',
      userName = 'Alex Rivera',
      demoImageUrl
    } = req.body;

    let analysis: any;
    if (engine === 'yolo') {
      // Passes real imageBase64 or hint to existing Python YOLO/ClassMap detector
      analysis = await runYoloDetector({ imageBase64, hintText: hintText || 'Clear PET Water Bottle' });
    } else if (imageBase64) {
      analysis = await analyzeWasteWithGemini(imageBase64, mimeType || 'image/jpeg');
    } else {
      analysis = classifyWasteHeuristic(hintText || 'Clear PET Water Bottle');
    }

    // Material Passport ID (format: MAT-2026-XXXXXX)
    const materialId = store.generateMaterialId();

    const newItem: WasteItem = {
      id: materialId,
      name: analysis.itemName,
      category: analysis.category,
      binColor: analysis.binColor,
      material: analysis.material,
      confidence: analysis.confidence,
      decompositionTime: analysis.decompositionTime,
      recyclingInstructions: analysis.recyclingInstructions,
      imageUrl: demoImageUrl || imageBase64 || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
      timestamp: new Date().toISOString(),
      station,
      userId,
      userName,
      suggestedPoints: analysis.suggestedPoints || 15,
      creditsAwarded: 0,
      status: 'scanned',
      disputed: analysis.category === 'unclassified' || analysis.confidence < 0.75,
      engine: analysis.engine || (engine as 'gemini' | 'yolo'),
      boundingBox: analysis.boundingBox,
      lifecycleHistory: [
        {
          status: 'scanned',
          timestamp: new Date().toISOString(),
          actor: `${userName} (${engine === 'yolo' ? 'YOLOv8 Edge Model' : 'Gemini 3.8 Flash'})`,
          note: `Classified as ${analysis.category.toUpperCase()} (${Math.round((analysis.confidence || 0.94) * 100)}% confidence). Recommended ${analysis.binColor.toUpperCase()} receptacle.`
        }
      ]
    };

    store.addItem(newItem);

    res.json({
      success: true,
      item: newItem,
      analysis,
    });
  } catch (error: any) {
    console.error('Scan intake error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze scan' });
  }
};

apiRouter.post('/scan/analyze', handleScanIntake);
apiRouter.post('/scans', handleScanIntake);

// Get All Scans / Filter Scans
apiRouter.get('/scans', (req: Request, res: Response) => {
  const { status, category, disputed, userId } = req.query;
  let items = store.getItems();

  if (status && typeof status === 'string' && status !== 'all') {
    items = items.filter(i => i.status === status);
  }
  if (category && typeof category === 'string' && category !== 'all') {
    items = items.filter(i => i.category === category);
  }
  if (disputed === 'true') {
    items = items.filter(i => i.disputed === true);
  }
  if (userId && typeof userId === 'string') {
    items = items.filter(i => i.userId === userId);
  }

  res.json({ count: items.length, items });
});

apiRouter.get('/scans/:id', (req: Request, res: Response) => {
  const item = store.getItemById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Scan record not found' });
  res.json({ item });
});

// Citizen confirms physical bin used (Phase 5 closed loop)
apiRouter.post('/scans/:id/confirm', (req: Request, res: Response) => {
  const { confirmedBin, userId } = req.body;
  if (!confirmedBin) {
    return res.status(400).json({ error: 'confirmedBin is required' });
  }

  const updatedItem = store.confirmBin(req.params.id, confirmedBin as BinColor, userId);
  if (!updatedItem) {
    return res.status(404).json({ error: 'Scan item not found' });
  }

  const isMatch = confirmedBin === updatedItem.binColor;
  res.json({
    success: true,
    item: updatedItem,
    isMatch,
    creditsAwarded: updatedItem.creditsAwarded,
  });
});

// User flags scan for human review
apiRouter.post('/scans/:id/review', (req: Request, res: Response) => {
  const item = store.getItemById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  item.disputed = true;
  item.disputeReason = req.body.reason || 'User flagged scan for review';
  store.addAuditLog(req.body.userName || 'Citizen', 'citizen', 'MANUAL_REVIEW_FLAG', item.id, item.disputeReason || 'Flagged for review');

  res.json({ success: true, item });
});

// Material Passport & Lifecycle Endpoints (Phase 5 & 6)
apiRouter.get('/materials/:id', (req: Request, res: Response) => {
  const item = store.getItemById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Material Passport not found' });
  res.json({
    materialPassport: {
      id: item.id,
      name: item.name,
      category: item.category,
      binColor: item.binColor,
      material: item.material,
      confidence: item.confidence,
      decompositionTime: item.decompositionTime,
      recyclingInstructions: item.recyclingInstructions,
      status: item.status,
      station: item.station,
      owner: item.userName,
      disputed: item.disputed,
      creditsAwarded: item.creditsAwarded,
      timeline: item.lifecycleHistory,
      qrPayload: `ECOFLUX-PASSPORT:${item.id}:${item.category}:${item.status}`
    }
  });
});

apiRouter.get('/materials/:id/history', (req: Request, res: Response) => {
  const item = store.getItemById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Material record not found' });
  res.json({ id: item.id, history: item.lifecycleHistory });
});

apiRouter.patch('/materials/:id/status', requireRole(['admin', 'volunteer']), (req: Request, res: Response) => {
  const { status, actorName = 'Elena Rostova', note } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  const result = store.updateItemStatus(req.params.id, status as LifecycleStatus, actorName, note);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json(result);
});

// Digital Twin Endpoints (Phase 7)
apiRouter.get('/twin/overview', (_req: Request, res: Response) => {
  res.json(store.getDigitalTwinOverview());
});

apiRouter.get('/twin/bins', (_req: Request, res: Response) => {
  res.json({ bins: store.getBins() });
});

apiRouter.get('/twin/batches', (_req: Request, res: Response) => {
  res.json({ batches: store.getDigitalTwinBatches() });
});

apiRouter.get('/twin/material-flow', (_req: Request, res: Response) => {
  const analytics = store.getAnalytics();
  res.json({
    currentVelocityUnitsPerHr: 24,
    intakeCount: analytics.totalScans,
    disposedInBinsCount: analytics.disposedCount,
    collectedInTransitCount: analytics.collectedCount,
    facilityInProcessingCount: analytics.inProcessingCount,
    closedLoopRecycledCount: analytics.recycledCount,
    rejectedContaminatedCount: analytics.rejectedCount,
    overallYield: analytics.overallRecyclingRate
  });
});

// Admin Monitoring & Reviews (Phase 9 & 11)
apiRouter.get('/admin/overview', requireRole(['admin', 'volunteer']), (_req: Request, res: Response) => {
  const analytics = store.getAnalytics();
  res.json({
    analytics,
    reviewsPending: store.getAdminReviews().length,
    health: store.getSystemHealth()
  });
});

apiRouter.get('/admin/reviews', requireRole(['admin', 'volunteer']), (_req: Request, res: Response) => {
  res.json({ reviews: store.getAdminReviews() });
});

// Volunteer: Batch update lifecycle status
apiRouter.post('/volunteer/batch-status', requireRole(['admin', 'volunteer']), (req: Request, res: Response) => {
  const { 
    itemIds, 
    targetStatus, 
    volunteerName = 'Elena Rostova (Operations Lead)', 
    batchNote 
  } = req.body;

  if (!itemIds || !Array.isArray(itemIds) || !targetStatus) {
    return res.status(400).json({ error: 'itemIds array and targetStatus are required' });
  }

  const result = store.batchUpdateStatus(
    itemIds, 
    targetStatus as LifecycleStatus, 
    volunteerName, 
    batchNote
  );

  res.json({
    success: true,
    updatedCount: result.updatedCount,
    items: result.items,
    errors: result.errors
  });
});

// Volunteer: Audit & Resolve Dispute
apiRouter.post('/volunteer/audit', requireRole(['admin', 'volunteer']), (req: Request, res: Response) => {
  const { 
    itemId, 
    action, 
    volunteerName = 'Elena Rostova (Operations Lead)', 
    notes, 
    newCategory 
  } = req.body;

  if (!itemId || !action) {
    return res.status(400).json({ error: 'itemId and action are required' });
  }

  const auditedItem = store.auditDispute(
    itemId, 
    action as 'approved' | 'overruled' | 'reclassified', 
    volunteerName, 
    notes, 
    newCategory as WasteCategory
  );

  if (!auditedItem) {
    return res.status(404).json({ error: 'Item not found' });
  }

  res.json({
    success: true,
    item: auditedItem,
  });
});

// Smart Bins Management
apiRouter.get('/bins', (_req: Request, res: Response) => {
  res.json({ bins: store.getBins() });
});

apiRouter.post('/bins/:id/empty', requireRole(['admin', 'volunteer']), (req: Request, res: Response) => {
  const result = store.emptyBin(req.params.id, req.body.actorName || 'Elena Rostova');
  if (!result) return res.status(404).json({ error: 'Bin not found' });
  res.json({ 
    success: true, 
    bin: result.bin, 
    batchId: result.batchId, 
    collectedCount: result.collectedCount,
    task: result.task 
  });
});

apiRouter.post('/bins/dispatch-all-critical', requireRole(['admin', 'volunteer']), (req: Request, res: Response) => {
  const summary = store.dispatchAllCriticalBins(req.body.actorName || 'Elena Rostova');
  res.json({ success: true, ...summary });
});

// Volunteer Tasks Management
apiRouter.get('/tasks', (_req: Request, res: Response) => {
  res.json({ tasks: store.getTasks() });
});

apiRouter.post('/tasks/:id/complete', requireRole(['admin', 'volunteer']), (req: Request, res: Response) => {
  const task = store.completeTask(req.params.id, req.body.actorName || 'Elena Rostova');
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json({ success: true, task });
});

// Rewards & Redemptions (Phase 10.D)
apiRouter.get('/rewards', (_req: Request, res: Response) => {
  res.json({ rewards: store.getRewards() });
});

const handleRewardClaim = (req: Request, res: Response) => {
  const rewardId = req.params.id || req.body.rewardId;
  const userId = req.body.userId || 'user-citizen-1';
  if (!rewardId) return res.status(400).json({ error: 'rewardId is required' });

  const result = store.claimReward(rewardId, userId);
  if (!result.success) return res.status(400).json({ error: result.error });
  res.json(result);
};

apiRouter.post('/rewards/claim', handleRewardClaim);
apiRouter.post('/rewards/:id/claim', handleRewardClaim);

// Circular Reuse Listings (Phase 10.B)
apiRouter.get('/reuse', (_req: Request, res: Response) => {
  res.json({ listings: store.getReuseListings() });
});
apiRouter.get('/reuse/listings', (_req: Request, res: Response) => {
  res.json({ listings: store.getReuseListings() });
});

apiRouter.post('/reuse', (req: Request, res: Response) => {
  const listing = store.createReuseListing(req.body);
  res.json({ success: true, listing });
});
apiRouter.post('/reuse/listings', (req: Request, res: Response) => {
  const listing = store.createReuseListing(req.body);
  res.json({ success: true, listing });
});

apiRouter.post('/reuse/:id/claim', (req: Request, res: Response) => {
  const listing = store.claimReuseItem(req.params.id, req.body.claimantName || 'Alex Rivera');
  if (!listing) return res.status(404).json({ error: 'Listing not available' });
  res.json({ success: true, listing });
});

// Learning Lab Quizzes
apiRouter.get('/quiz', (_req: Request, res: Response) => {
  res.json({ questions: store.getQuiz() });
});

// AI Insights & Structured Recommendations (Phase 8)
apiRouter.get('/insights', (_req: Request, res: Response) => {
  res.json({ insights: store.getInsights() });
});
apiRouter.get('/recommendations/history', (_req: Request, res: Response) => {
  res.json({ recommendations: store.getInsights() });
});

apiRouter.post('/recommendations', async (req: Request, res: Response) => {
  try {
    const { materialName = 'Single-Use Packaging', category = 'recyclable', historyContext } = req.body;
    const rec = await generateStructuredRecommendation(materialName, category, historyContext);
    res.json({ success: true, recommendation: rec });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Recommendation generation failed' });
  }
});

// System Audit Logs
apiRouter.get('/audit-logs', requireRole(['admin', 'volunteer']), (_req: Request, res: Response) => {
  res.json({ logs: store.getAuditLogs() });
});

// Generative AI Assistant Route (Phase 8.1)
apiRouter.post('/ai/ask', async (req: Request, res: Response) => {
  try {
    const { question, context } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });
    const answer = await askEcoAssistant(question, context);
    res.json({ success: true, answer });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI assistant error' });
  }
});

// Operations Analytics Dashboard Endpoint (Phase 11)
apiRouter.get('/analytics', (_req: Request, res: Response) => {
  const analytics = store.getAnalytics();
  res.json(analytics);
});
apiRouter.get('/admin/analytics', requireRole(['admin', 'volunteer']), (_req: Request, res: Response) => {
  res.json(store.getAnalytics());
});

// Reset Demo Data
apiRouter.post('/reset-demo', (_req: Request, res: Response) => {
  store.resetDemo();
  res.json({ success: true, message: 'EcoFlux demo data reset successfully' });
});
