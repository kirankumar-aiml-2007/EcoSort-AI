import express, { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
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
import {
  clearSessionCookie,
  hasConfiguredAdminAccount,
  matchesConfiguredAdminPassword,
  readSession,
  setSessionCookie,
} from './auth.ts';

export const apiRouter = express.Router();

apiRouter.use(express.json({ limit: '20mb' }));

function requireRole(allowedRoles: Array<'citizen' | 'volunteer' | 'admin'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.authenticatedUser;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Requires one of: ${allowedRoles.join(', ')}.`,
      });
    }

    next();
  };
}

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', platform: 'EcoFlux AI Intelligence', time: new Date().toISOString() });
});

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function limitLoginAttempts(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const attempt = loginAttempts.get(key);
  if (!attempt || attempt.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + 60_000 });
    return next();
  }
  if (attempt.count >= 10) {
    return res.status(429).json({ error: 'Too many sign-in attempts. Try again in one minute.' });
  }
  attempt.count += 1;
  next();
}

const aiRequests = new Map<string, { count: number; resetAt: number }>();

function limitAiRequests(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const attempt = aiRequests.get(key);
  if (!attempt || attempt.resetAt <= now) {
    aiRequests.set(key, { count: 1, resetAt: now + 60_000 });
    return next();
  }
  if (attempt.count >= 12) {
    return res.status(429).json({ error: 'AI request limit reached. Try again in one minute.' });
  }
  attempt.count += 1;
  next();
}

apiRouter.post('/auth/login', limitLoginAttempts, (req: Request, res: Response) => {
  const { email, name, password, portal = 'citizen' } = req.body;
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ success: false, error: 'A valid email address is required.' });
  }

  let user: UserAccount;
  if (portal === 'admin') {
    const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const authorizedAdmin = store.isEmailAuthorizedAdmin(cleanEmail);
    const isAllowedEmail = cleanEmail === configuredEmail || Boolean(authorizedAdmin);
    if (
      !hasConfiguredAdminAccount() ||
      !isAllowedEmail ||
      !matchesConfiguredAdminPassword(typeof password === 'string' ? password : '')
    ) {
      return res.status(401).json({ success: false, error: 'Invalid administrator credentials or admin sign-in is not configured.' });
    }
    const seedAdmin = authorizedAdmin
      ? SEED_USERS.find(account => account.email.toLowerCase() === cleanEmail)
      : SEED_USERS.find(account => account.role === 'admin');
    const role = authorizedAdmin?.role ?? 'admin';
    user = {
      ...(seedAdmin ?? SEED_USERS[0]),
      id: `admin-${randomUUID()}`,
      email: cleanEmail,
      name: authorizedAdmin?.name || seedAdmin?.name || cleanEmail.split('@')[0],
      stationOrZone: authorizedAdmin?.department || seedAdmin?.stationOrZone,
      role,
      isMainAdmin: role === 'admin',
    };
  } else if (portal === 'citizen') {
    const generatedName = cleanEmail.split('@')[0]?.replace(/[._-]/g, ' ') || 'Citizen';
    const displayName = typeof name === 'string' && name.trim()
      ? name.trim().slice(0, 80)
      : generatedName.replace(/\b\w/g, letter => letter.toUpperCase());
    user = {
      id: `guest-${randomUUID()}`,
      email: cleanEmail,
      name: displayName,
      role: 'citizen',
      stationOrZone: 'West Campus Hub · Station A',
      credits: 50,
      rank: 'Eco Newcomer (Tier 1)',
      itemsRecycled: 0,
      hazardousSafeDrops: 0,
      co2DivertedKg: 0,
      streakDays: 1,
      badges: ['Welcome Recycler'],
    };
  } else {
    return res.status(400).json({ success: false, error: 'Unsupported sign-in portal.' });
  }

  store.addUser(user);
  setSessionCookie(res, { id: user.id, email: user.email, name: user.name, role: user.role });
  res.json({ success: true, user });
});

apiRouter.post('/auth/logout', (_req: Request, res: Response) => {
  clearSessionCookie(res);
  res.json({ success: true });
});

apiRouter.use((req: Request, res: Response, next: NextFunction) => {
  const user = readSession(req);
  if (!user || !store.getUser(user.id)) {
    clearSessionCookie(res);
    return res.status(401).json({ error: 'Sign in to continue.' });
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const origin = req.get('origin');
    const expectedOrigin = `${req.protocol}://${req.get('host')}`;
    if (origin !== expectedOrigin) {
      return res.status(403).json({ error: 'Request origin validation failed.' });
    }
  }

  res.locals.authenticatedUser = user;
  next();
});

apiRouter.get('/auth/me', (_req: Request, res: Response) => {
  const identity = res.locals.authenticatedUser;
  const user = store.getUser(identity.id);
  if (!user) return res.status(401).json({ error: 'Session expired. Sign in again.' });
  res.json({ user });
});

// Direct project zip download for VS Code local development
apiRouter.get('/download-zip', (_req: Request, res: Response) => {
  const zipPath = path.resolve(process.cwd(), 'public/ecosort-ai-project.zip');
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="ecosort-ai-project.zip"');
  res.sendFile(zipPath);
});

apiRouter.get('/admin/system-health', requireRole(['admin']), (_req: Request, res: Response) => {
  res.json(store.getSystemHealth());
});

// Admin Authorization Registry Endpoints (Phase 4 Security & Governance)
apiRouter.get('/admin/authorized-admins', requireRole(['admin']), (_req: Request, res: Response) => {
  res.json({ authorizedAdmins: store.getAuthorizedAdmins() });
});

apiRouter.post('/admin/authorize-email', requireRole(['admin']), (req: Request, res: Response) => {
  const { email, name, role = 'admin', department } = req.body;
  const result = store.authorizeAdminEmail({
    email,
    name,
    role,
    department,
    authorizedBy: res.locals.authenticatedUser.name
  });

  if (!result.success) {
    return res.status(400).json(result);
  }
  return res.json({ success: true, authorizedAdmin: result.authorizedAdmin, authorizedAdmins: store.getAuthorizedAdmins() });
});

apiRouter.delete('/admin/authorize-email/:email', requireRole(['admin']), (req: Request, res: Response) => {
  const { email } = req.params;
  const result = store.revokeAdminEmail(email, res.locals.authenticatedUser.name);

  if (!result.success) {
    return res.status(400).json(result);
  }
  return res.json({ success: true, authorizedAdmins: store.getAuthorizedAdmins() });
});

// User Profile
apiRouter.get('/user/:id', (req: Request, res: Response) => {
  const identity = res.locals.authenticatedUser;
  if (identity.role !== 'admin' && identity.id !== req.params.id) {
    return res.status(403).json({ error: 'You may only access your own profile.' });
  }
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
      demoImageUrl
    } = req.body;
    const identity = res.locals.authenticatedUser;

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
      userId: identity.id,
      userName: identity.name,
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
          actor: `${identity.name} (${engine === 'yolo' ? 'YOLOv8 Edge Model' : 'Gemini 3.8 Flash'})`,
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

apiRouter.post('/scan/analyze', limitAiRequests, handleScanIntake);
apiRouter.post('/scans', limitAiRequests, handleScanIntake);

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
  const identity = res.locals.authenticatedUser;
  if (identity.role === 'citizen') {
    items = items.filter(item => item.userId === identity.id);
  }

  res.json({ count: items.length, items });
});

apiRouter.get('/scans/:id', (req: Request, res: Response) => {
  const item = store.getItemById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Scan record not found' });
  const identity = res.locals.authenticatedUser;
  if (identity.role === 'citizen' && item.userId !== identity.id) {
    return res.status(403).json({ error: 'You may only access your own scan.' });
  }
  res.json({ item });
});

// Citizen confirms physical bin used (Phase 5 closed loop)
apiRouter.post('/scans/:id/confirm', (req: Request, res: Response) => {
  const { confirmedBin } = req.body;
  if (!confirmedBin) {
    return res.status(400).json({ error: 'confirmedBin is required' });
  }

  const identity = res.locals.authenticatedUser;
  const scan = store.getItemById(req.params.id);
  if (!scan) return res.status(404).json({ error: 'Scan item not found' });
  if (identity.role !== 'admin' && scan.userId !== identity.id) {
    return res.status(403).json({ error: 'You may only confirm your own scan.' });
  }

  const updatedItem = store.confirmBin(req.params.id, confirmedBin as BinColor, identity.id);
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
  const identity = res.locals.authenticatedUser;
  if (identity.role !== 'admin' && item.userId !== identity.id) {
    return res.status(403).json({ error: 'You may only flag your own scan.' });
  }

  item.disputed = true;
  item.disputeReason = req.body.reason || 'User flagged scan for review';
  store.addAuditLog(identity.name, identity.role, 'MANUAL_REVIEW_FLAG', item.id, item.disputeReason || 'Flagged for review');

  res.json({ success: true, item });
});

// Material Passport & Lifecycle Endpoints (Phase 5 & 6)
apiRouter.get('/materials/:id', (req: Request, res: Response) => {
  const item = store.getItemById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Material Passport not found' });
  const identity = res.locals.authenticatedUser;
  if (identity.role === 'citizen' && item.userId !== identity.id) {
    return res.status(403).json({ error: 'You may only access your own material passport.' });
  }
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
  const identity = res.locals.authenticatedUser;
  if (identity.role === 'citizen' && item.userId !== identity.id) {
    return res.status(403).json({ error: 'You may only access your own material history.' });
  }
  res.json({ id: item.id, history: item.lifecycleHistory });
});

apiRouter.patch('/materials/:id/status', requireRole(['admin', 'volunteer']), (req: Request, res: Response) => {
  const { status, note } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  const result = store.updateItemStatus(req.params.id, status as LifecycleStatus, res.locals.authenticatedUser.name, note);
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
    batchNote 
  } = req.body;

  if (!itemIds || !Array.isArray(itemIds) || !targetStatus) {
    return res.status(400).json({ error: 'itemIds array and targetStatus are required' });
  }

  const result = store.batchUpdateStatus(
    itemIds, 
    targetStatus as LifecycleStatus, 
    res.locals.authenticatedUser.name,
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
    notes, 
    newCategory 
  } = req.body;

  if (!itemId || !action) {
    return res.status(400).json({ error: 'itemId and action are required' });
  }

  const auditedItem = store.auditDispute(
    itemId, 
    action as 'approved' | 'overruled' | 'reclassified', 
    res.locals.authenticatedUser.name,
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
  const result = store.emptyBin(req.params.id, res.locals.authenticatedUser.name);
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
  const summary = store.dispatchAllCriticalBins(res.locals.authenticatedUser.name);
  res.json({ success: true, ...summary });
});

// Volunteer Tasks Management
apiRouter.get('/tasks', (_req: Request, res: Response) => {
  res.json({ tasks: store.getTasks() });
});

apiRouter.post('/tasks/:id/complete', requireRole(['admin', 'volunteer']), (req: Request, res: Response) => {
  const task = store.completeTask(req.params.id, res.locals.authenticatedUser.name);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json({ success: true, task });
});

// Rewards & Redemptions (Phase 10.D)
apiRouter.get('/rewards', (_req: Request, res: Response) => {
  res.json({ rewards: store.getRewards() });
});

const handleRewardClaim = (req: Request, res: Response) => {
  const rewardId = req.params.id || req.body.rewardId;
  const userId = res.locals.authenticatedUser.id;
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
  const listing = store.createReuseListing({ ...req.body, donorName: res.locals.authenticatedUser.name });
  res.json({ success: true, listing });
});
apiRouter.post('/reuse/listings', (req: Request, res: Response) => {
  const listing = store.createReuseListing({ ...req.body, donorName: res.locals.authenticatedUser.name });
  res.json({ success: true, listing });
});

apiRouter.post('/reuse/:id/claim', (req: Request, res: Response) => {
  const listing = store.claimReuseItem(req.params.id, res.locals.authenticatedUser.name);
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

apiRouter.post('/recommendations', limitAiRequests, async (req: Request, res: Response) => {
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
apiRouter.post('/ai/ask', limitAiRequests, async (req: Request, res: Response) => {
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
apiRouter.post('/reset-demo', requireRole(['admin']), (_req: Request, res: Response) => {
  const adminUser = store.getUser(res.locals.authenticatedUser.id);
  store.resetDemo();
  if (adminUser) store.addUser(adminUser);
  res.json({ success: true, message: 'EcoFlux demo data reset successfully' });
});
