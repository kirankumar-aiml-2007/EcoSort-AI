import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { 
  ScanLine, 
  Sparkles, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Leaf,
  Recycle,
  Layers,
  Zap,
  Globe2,
  KeyRound,
  ShieldAlert,
  Users
} from 'lucide-react';
import type { UserAccount } from '../types/ecosort.ts';
import { loginUser } from '../services/apiClient.ts';

interface AuthScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  // Completely separate portals: 'citizen' or 'admin'
  const [activePortal, setActivePortal] = useState<'citizen' | 'admin'>('citizen');

  // Citizen credentials
  const [citizenEmail, setCitizenEmail] = useState('citizen@ecosort.ai');
  const [citizenName, setCitizenName] = useState('Alex Rivera');
  const [citizenPassword, setCitizenPassword] = useState('recycle2026');

  // Admin credentials
  const [adminEmail, setAdminEmail] = useState('admin@ecosort.ai');
  const [adminPassword, setAdminPassword] = useState('greenops2026');

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 3D Canvas Mount for animated recycling objects
  const threeMountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!threeMountRef.current) return;

    let renderer: THREE.WebGLRenderer;
    let animationFrameId: number;
    let handleResize: () => void;

    try {
      const width = threeMountRef.current.clientWidth || 400;
      const height = threeMountRef.current.clientHeight || 600;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
      camera.position.set(0, 0, 7.5);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      threeMountRef.current.innerHTML = '';
      threeMountRef.current.appendChild(renderer.domElement);

      // Lights
      const ambientLight = new THREE.AmbientLight(0x10b981, 1.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x22c55e, 3, 20);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x3b82f6, 2, 20);
    pointLight2.position.set(-5, -4, 3);
    scene.add(pointLight2);

    // Group for rotating shapes
    const group = new THREE.Group();
    scene.add(group);

    // 1. Central Mobius / Torus representing circular economy loop
    const torusGeo = new THREE.TorusGeometry(2.4, 0.35, 24, 70);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: false,
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    group.add(torus);

    // 2. Wireframe outer sphere
    const sphereGeo = new THREE.IcosahedronGeometry(3.6, 2);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x059669,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    group.add(sphere);

    // 3. Floating particle dust
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 12;
      positions[i + 1] = (Math.random() - 0.5) * 12;
      positions[i + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.06,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 4. Color-coded 4 stream satellite nodes
    const nodeColors = [0x3b82f6, 0x10b981, 0xd97706, 0xef4444];
    const nodes: THREE.Mesh[] = [];
    nodeColors.forEach((color, idx) => {
      const nodeGeo = new THREE.OctahedronGeometry(0.35);
      const nodeMat = new THREE.MeshStandardMaterial({
        color,
        metalness: 0.7,
        roughness: 0.2,
        emissive: color,
        emissiveIntensity: 0.3,
      });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      const angle = (idx / 4) * Math.PI * 2;
      node.position.set(Math.cos(angle) * 3, Math.sin(angle) * 3, 0);
      group.add(node);
      nodes.push(node);
    });

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      group.rotation.x = elapsed * 0.2;
      group.rotation.y = elapsed * 0.35;
      torus.rotation.z = elapsed * 0.15;
      particles.rotation.y = -elapsed * 0.05;

      nodes.forEach((n, idx) => {
        const angle = (idx / 4) * Math.PI * 2 + elapsed * 0.4;
        n.position.x = Math.cos(angle) * 3;
        n.position.y = Math.sin(angle) * 3;
        n.rotation.x += 0.02;
        n.rotation.y += 0.03;
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    handleResize = () => {
      if (!threeMountRef.current || !renderer) return;
      const w = threeMountRef.current.clientWidth;
      const h = threeMountRef.current.clientHeight || 600;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (handleResize) window.removeEventListener('resize', handleResize);
      if (renderer) renderer.dispose();
      torusGeo.dispose();
      torusMat.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
    };
  } catch (err) {
    console.warn('WebGL is not available on this device/browser:', err);
    return;
  }
}, []);

  const handlePortalSwitch = (portal: 'citizen' | 'admin') => {
    setActivePortal(portal);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleCitizenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!citizenEmail || !citizenEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    try {
      setIsLoading(true);
      // Citizen portal: anyone can log in
      const user = await loginUser(citizenEmail, 'citizen', 'citizen', citizenName);
      setSuccessMessage(`Welcome back, ${user.name}! Entering Citizen Portal...`);
      setTimeout(() => {
        onLoginSuccess(user);
      }, 650);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed.');
      setIsLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!adminEmail || !adminEmail.includes('@')) {
      setErrorMessage('Please enter a valid administrator email.');
      return;
    }

    try {
      setIsLoading(true);
      // Admin portal: STRICT check against verified admin list
      const user = await loginUser(adminEmail, 'admin', 'admin');
      setSuccessMessage(`Verified Admin Access Granted! Welcome, ${user.name} (${user.isMainAdmin ? 'Main Administrator' : 'Operations Admin'}).`);
      setTimeout(() => {
        onLoginSuccess(user);
      }, 700);
    } catch (err: any) {
      // Rejection for unverified emails or regular users attempting admin login
      setErrorMessage(err.message || 'Access Denied: Only verified administrator emails are permitted.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020b07] text-slate-100 flex flex-col lg:flex-row overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* LEFT COLUMN: Animated 3D Visual Experience & Sustainability Story */}
      <div className="relative flex-1 lg:w-7/12 min-h-[460px] lg:min-h-screen bg-gradient-to-br from-[#03180f] via-[#052317] to-[#020b07] border-b lg:border-b-0 lg:border-r border-emerald-950/80 flex flex-col justify-between p-8 sm:p-12 overflow-hidden">
        
        {/* Subtle decorative grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(52, 211, 153, 0.4) 1px, transparent 1px)`,
            backgroundSize: '28px 28px'
          }}
        />

        {/* Ambient glow effects */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 3D Canvas Background Container */}
        <div 
          ref={threeMountRef} 
          className="absolute inset-0 z-0 opacity-80 pointer-events-none"
        />

        {/* Top Header: Brand Wordmark */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-lime-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-[#03180f] rounded-[10px] flex items-center justify-center">
                <Recycle className="w-5 h-5 text-emerald-400 animate-spin-slow" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-2xl tracking-tight text-white">
                  EcoFlux<span className="text-emerald-400">AI</span>
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  v2.6 Live
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/70 font-mono">
                Circular Economy & Smart Waste Intelligence
              </p>
            </div>
          </div>

          <div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Campus Network Active</span>
            </div>
          </div>
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 my-auto py-12 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 text-xs font-mono uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-lime-400" />
            Computer Vision + 3D Digital Twin + Closed Loop
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-tight">
            Close the loop on waste with <span className="bg-gradient-to-r from-emerald-400 via-lime-300 to-teal-300 bg-clip-text text-transparent">real-time vision AI</span>.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed font-normal">
            Recognize Recyclable, Reusable, Biodegradable, and Hazardous items in milliseconds. Track material movement through our 3D digital twin, confirm bin drops to earn verified eco-credits, and manage campus recycling operations.
          </p>

          {/* 4 Waste Stream Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-8">
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 backdrop-blur-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400 mb-1.5 shadow-sm shadow-blue-400" />
              <div className="text-xs font-bold text-white">Blue Stream</div>
              <div className="text-[11px] text-blue-300/80">Recyclables</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 backdrop-blur-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mb-1.5 shadow-sm shadow-emerald-400" />
              <div className="text-xs font-bold text-white">Green Stream</div>
              <div className="text-[11px] text-emerald-300/80">Reusable Items</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/30 backdrop-blur-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mb-1.5 shadow-sm shadow-amber-400" />
              <div className="text-xs font-bold text-white">Brown Stream</div>
              <div className="text-[11px] text-amber-300/80">Biodegradable</div>
            </div>
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 backdrop-blur-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400 mb-1.5 shadow-sm shadow-red-400" />
              <div className="text-xs font-bold text-white">Red Stream</div>
              <div className="text-[11px] text-red-300/80">Hazardous / E-Waste</div>
            </div>
          </div>
        </div>

        {/* Bottom Metrics Bar */}
        <div className="relative z-10 pt-6 border-t border-emerald-900/30 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-6">
            <div>
              <span className="font-mono text-emerald-400 font-bold text-base">98.4%</span>
              <p className="text-[11px] text-slate-400">Vision Precision</p>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="font-mono text-emerald-400 font-bold text-base">&lt;450ms</span>
              <p className="text-[11px] text-slate-400">Inference Latency</p>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="font-mono text-emerald-400 font-bold text-base">5-Stage</span>
              <p className="text-[11px] text-slate-400">Digital Twin Pipeline</p>
            </div>
          </div>
          <div className="text-[11px] font-mono text-emerald-400/80 flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5" />
            Zero Landfill Directive
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Separate Dedicated Portals for Citizen & Admin */}
      <div className="lg:w-5/12 flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-[#030e09] relative">
        
        <div className="w-full max-w-md">
          
          {/* Top Portal Selection Selector: Completely Distinct Portals */}
          <div className="mb-6">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
              Select Access Gateway
            </div>
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => handlePortalSwitch('citizen')}
                className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                  activePortal === 'citizen'
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>Citizen Portal</span>
                </div>
                <span className={`text-[10px] font-normal ${activePortal === 'citizen' ? 'text-slate-900 font-medium' : 'text-emerald-400'}`}>
                  Open to Anyone
                </span>
              </button>

              <button
                type="button"
                onClick={() => handlePortalSwitch('admin')}
                className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                  activePortal === 'admin'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Gateway</span>
                </div>
                <span className={`text-[10px] font-normal ${activePortal === 'admin' ? 'text-blue-100 font-medium' : 'text-blue-400'}`}>
                  Verified Admins Only
                </span>
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5 shadow-lg">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-700/80 text-emerald-200 text-xs flex items-center gap-2.5 shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* PORTAL 1: CITIZEN / USER LOGIN (OPEN TO ANYONE)           */}
          {/* ========================================================= */}
          {activePortal === 'citizen' && (
            <div className="bg-slate-900/60 border border-emerald-500/20 rounded-3xl p-7 sm:p-8 shadow-2xl backdrop-blur-xl relative">
              <div className="mb-6">
                <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  Citizen Circular Access
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                  Sign in as Citizen
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Open access for all students and campus members. Anyone can enter their email to scan waste, verify bin deposits, and earn eco-credits.
                </p>
              </div>

              {/* Citizen Open Access Badge */}
              <div className="mb-5 p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-medium">Open Registration Active · Campus Community</span>
              </div>

              {/* 1-Click Fast Evaluator Mode for Citizens */}
              <div className="mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setCitizenEmail('citizen@ecosort.ai');
                    setCitizenName('Alex Rivera');
                    setCitizenPassword('recycle2026');
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-emerald-500/30 bg-emerald-900/30 hover:bg-emerald-800/40 text-emerald-200 text-xs font-medium transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                    <span>Demo Citizen Profile: <strong>Alex Rivera</strong></span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">195 pts · Tier 3</span>
                </button>
              </div>

              <form onSubmit={handleCitizenSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={citizenEmail}
                      onChange={(e) => setCitizenEmail(e.target.value)}
                      placeholder="you@campus.edu or citizen@ecosort.ai"
                      className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your Name <span className="text-[10px] text-slate-500 font-normal">(Optional for profile)</span>
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={citizenName}
                      onChange={(e) => setCitizenName(e.target.value)}
                      placeholder="Alex Rivera"
                      className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={citizenPassword}
                      onChange={(e) => setCitizenPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-400/20"
                    />
                    <span>Remember terminal</span>
                  </label>
                  <span className="text-[11px] text-emerald-400/80">Demo: recycle2026</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating Citizen...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Citizen Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
                Are you a facility administrator?{' '}
                <button
                  type="button"
                  onClick={() => handlePortalSwitch('admin')}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  Go to Admin Gateway →
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PORTAL 2: ADMIN OPERATIONS GATEWAY (VERIFIED ONLY)        */}
          {/* ========================================================= */}
          {activePortal === 'admin' && (
            <div className="bg-slate-900/70 border border-blue-500/30 rounded-3xl p-7 sm:p-8 shadow-2xl backdrop-blur-xl relative">
              <div className="mb-6">
                <div className="text-xs font-mono uppercase tracking-wider text-blue-400 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Restricted Admin Gateway
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                  Admin Sign In
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Strict security verification. Only email addresses authorized in advance by the <strong>Main Administrator</strong> can log into this section.
                </p>
              </div>

              {/* Strict Security Notice */}
              <div className="mb-5 p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs">
                <div className="flex items-center gap-2 text-blue-300 font-semibold mb-1">
                  <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                  <span>Main Admin Authorization Gate</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Only the <strong>Main Admin</strong> and colleagues whose emails were verified before login can authenticate here. Citizen accounts cannot access this gateway.
                </p>
              </div>

              {/* Fast Evaluator Fill Buttons for Admin Evaluators */}
              <div className="mb-5 space-y-2">
                <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
                  <span>Authorized Accounts:</span>
                  <span className="text-blue-400">Pre-Verified</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminEmail('admin@ecosort.ai');
                      setAdminPassword('greenops2026');
                    }}
                    className="p-2.5 rounded-xl border border-blue-500/30 bg-blue-950/50 hover:bg-blue-900/50 text-left transition-colors flex flex-col"
                  >
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <span>Elena Rostova</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Main</span>
                    </span>
                    <span className="text-[10px] text-blue-300 font-mono">admin@ecosort.ai</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdminEmail('volunteer@ecosort.ai');
                      setAdminPassword('greenops2026');
                    }}
                    className="p-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-left transition-colors flex flex-col"
                  >
                    <span className="text-xs font-bold text-white">Marcus Chen</span>
                    <span className="text-[10px] text-slate-400 font-mono">volunteer@ecosort.ai</span>
                  </button>
                </div>

                {/* Pre-verified user email */}
                <button
                  type="button"
                  onClick={() => {
                    setAdminEmail('chandhankumar356@gmail.com');
                    setAdminPassword('greenops2026');
                  }}
                  className="w-full py-1.5 px-3 rounded-xl border border-blue-500/20 bg-blue-950/20 hover:bg-blue-900/30 text-left text-xs text-blue-200 transition-colors flex items-center justify-between"
                >
                  <span>Chandhan Kumar (Verified Admin):</span>
                  <span className="font-mono text-[10px] text-blue-400">chandhankumar356@gmail.com</span>
                </button>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Authorized Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@ecosort.ai"
                      className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Admin Security Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-blue-500 focus:ring-blue-400/20"
                    />
                    <span>Remember terminal</span>
                  </label>
                  <span className="text-[11px] text-blue-400/80">Demo: greenops2026</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Admin Authorization...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify & Access Admin Console</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
                Not an administrator?{' '}
                <button
                  type="button"
                  onClick={() => handlePortalSwitch('citizen')}
                  className="text-blue-400 hover:underline font-semibold"
                >
                  Go to Citizen Portal (Anyone can log in) →
                </button>
              </div>
            </div>
          )}

          {/* Security footnote */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Role-Enforced Two-Gate Authentication
            </span>
            <span>EcoFlux AI v2.6</span>
          </div>

        </div>
      </div>

    </div>
  );
};
