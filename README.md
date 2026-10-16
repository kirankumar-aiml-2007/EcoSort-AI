# EcoFlux AI — Smart Recycling & Circular Economy Intelligence Platform

EcoFlux AI is an integrated, full-stack circular economy intelligence platform connecting citizen waste sorting, real-time computer vision, closed-loop trust protocols, and volunteer lifecycle operations.

---

## 1. System Architecture

```
                  +----------------------------------------------+
                  |         Vite + React SPA (TypeScript)        |
                  |  - 15 Dedicated Citizen Circularity Pages    |
                  |  - 9 Admin / Volunteer Operations Modules    |
                  |  - Three.js Interactive 3D Digital Twin      |
                  +----------------------+-----------------------+
                                         |
                                         | HTTP / JSON (/api/*)
                                         v
                  +----------------------------------------------+
                  |           Express Backend & Middleware       |
                  |  - Role-based Auth (Citizen, Volunteer, Admin)|
                  |  - Validated Lifecycle State Machine         |
                  |  - Digital Twin State Derivation             |
                  |  - Idempotent Reward Ledger                  |
                  +-----------+----------------------+-----------+
                              |                      |
            +-----------------+                      +-----------------+
            v                                                          v
+-------------------------------+                          +-------------------------------+
|    Computer Vision Pipeline   |                          |    Generative AI Specialist   |
| - vision/detector.py (YOLO)   |                          | - @google/genai SDK           |
| - vision/class_map.py (4-way) |                          | - gemini-3.8-flash model      |
| - Multi-stream classification |                          | - Science-backed circularity  |
| - Bounding box spatial anchor |                          | - Graceful rule-based fallback|
+-------------------------------+                          +-------------------------------+
```

---

## 2. Actual Folder Structure

```
├── .env.example              # Sample environment variables
├── index.html                # Entry HTML with fonts and meta tags
├── metadata.json             # AI Studio applet capabilities
├── package.json              # Project scripts and dependencies
├── server.ts                 # Full-stack production entry point
├── server/
│   ├── apiHandler.ts         # Data store, Gemini SDK, YOLO bridge, analytics
│   └── router.ts             # REST API routes and role authorization
├── vision/
│   ├── class_map.py          # 4-stream category & bin color mapping
│   ├── detector.py           # YOLOv8 object detector and feature inference
│   └── camera_app.py         # Standalone webcam test harness
├── src/
│   ├── App.tsx               # Main application container & view router
│   ├── index.css             # Tailwind CSS & theme definitions
│   ├── main.tsx              # React DOM mounting
│   ├── types/
│   │   └── ecosort.ts        # TypeScript schemas & models
│   ├── services/
│   │   └── apiClient.ts      # API client bridge
│   └── components/
│       ├── AuthScreen.tsx             # Split-screen 3D login gate
│       ├── Navbar.tsx                 # Top navigation & 15-page switcher
│       ├── CommandDashboard.tsx       # User & Admin Command overview
│       ├── CitizenScanner.tsx         # AI Vision Scanner (camera & upload)
│       ├── BinDepositVerification.tsx # Closed-loop deposit confirmation
│       ├── CitizenHistory.tsx         # Scan history & material passport
│       ├── MaterialJourneyTracker.tsx # 5-Stage chain-of-custody tracker
│       ├── EcoRewardsStore.tsx        # Credit redemption store
│       ├── AIRecommendations.tsx      # Gemini personalized circularity
│       ├── UpcyclingHub.tsx           # Step-by-step DIY blueprints
│       ├── ReuseMarketplace.tsx       # Campus smart locker sharing
│       ├── SustainabilityQuiz.tsx     # Gamified 4-stream trivia
│       ├── SmartBinStationFinder.tsx  # Campus station directory & map
│       ├── CitizenLeaderboard.tsx     # Community impact rankings
│       ├── DigitalTwin3D.tsx          # Three.js 3D facility simulation
│       ├── CarbonImpactCalculator.tsx # LCA carbon & freshwater calculator
│       ├── UserProfileSettings.tsx    # Preferences & JSON export
│       ├── VolunteerPipeline.tsx      # 5-Stage Kanban batch dispatcher
│       ├── DisputeDesk.tsx            # Contamination & mismatch audit
│       ├── OperationsAnalytics.tsx    # High-density operational charts
│       ├── VolunteerOperations.tsx    # Field tasks queue & assignments
│       ├── SmartBinsManagement.tsx    # IoT bin fill telemetry & empty
│       ├── AIModelInspector.tsx       # Dual-engine vision diagnostics
│       ├── UsersAndAuditLogs.tsx      # Account governance & audit log
│       └── ItemDetailModal.tsx        # Material Passport & QR modal
```

---

## 3. Required Software Versions

- **Node.js**: v20.19+ or v22.12+
- **Python**: 3.10+ (for `vision/detector.py`)
- **Package Manager**: npm or bun

---

## 4. Installation & Startup

### Frontend & Backend Development (Single Unified Server)
```bash
# 1. Install the locked Node.js dependencies
npm ci

# 2. Start the integrated dev server on port 3000
npm run dev
```

### Full-Stack Production Deployment
```bash
# Build the Vite frontend
npm run build

# Start production Express server
npm run start
```

---

## 5. Environment Variables

Configure `.env` using `.env.example`:
```ini
# Required for Gemini 3.8 Flash Vision & Assistant features
GEMINI_API_KEY="your-gemini-api-key"

# Application host URL
APP_URL="http://localhost:3000"
```
Live camera and uploaded-image scans use Gemini Vision by default and require `GEMINI_API_KEY`. Without the key, image analysis reports a configuration error rather than guessing a bin. You can manually select YOLOv8 Edge Vision, but accurate waste sorting requires compatible model weights; otherwise image scans are marked unclassified.

---

## 6. Default User Accounts (for Fast Evaluation)

1. **Citizen Recycler**:
   - Email: `citizen@ecosort.ai`
   - Password: `recycle2026`
   - Role: `citizen` (Alex Rivera, Tier 3 Guardian, 195 pts)

2. **Operations Admin / Volunteer**:
   - Email: `volunteer@ecosort.ai`
   - Password: `greenops2026`
   - Role: `admin` / `volunteer` (Elena Rostova, Operations Lead)

---

## 7. Verification & Test Commands

```sh
# 1. TypeScript type check
npm run lint

# 2. Build compilation check
npm run build
```

Windows PowerShell:
```powershell
python .\vision\detector.py --hint "battery" --json
```

macOS/Linux:
```sh
python3 vision/detector.py --hint "battery" --json
```

No automated E2E test script is included in this project yet.

---

## 8. Complete Demonstration Sequence for Judges

1. **Authentication Gate**: Start at the split-screen auth screen. Click the **"Alex Rivera (Citizen)"** 1-click fill button and sign in.
2. **AI Waste Scanner**: Launch the scanner, select one of the test presets (or use webcam/upload). View the real-time YOLO/Gemini bounding box, 4-stream color code, decomposition timeline, and points.
3. **Closed-Loop Bin Confirmation**: Confirm the physical bin used (Blue, Green, Brown, or Red). Observe the instant +15 or +25 Eco-Credits award and streak increase.
4. **Material Passport & QR Traceability**: Open any item from "My Scan History". Inspect the immutable chain of custody and the scannable QR code.
5. **Role Switch to Admin**: Click the top-bar **"User Mode · Switch"** button to toggle instantly to **Elena Rostova (Operations Lead)**.
6. **Contamination & Dispute Desk**: Review flagged items (e.g. greasy pizza box deposited in Blue bin). Overrule or approve with recorded volunteer notes.
7. **Lifecycle Kanban Pipeline**: Advance batches of items from *Disposed* to *Collected* and *At Processing*.
8. **3D Digital Twin**: Open the 3D sorting facility to see the animated conveyor, laser sorting arch, and volumetric fill levels bound to real database records.
9. **Eco-Credits Rewards Store**: Switch back to Citizen, navigate to the Rewards Store, and claim a Fair-Trade Coffee or Bamboo Thermos voucher.
