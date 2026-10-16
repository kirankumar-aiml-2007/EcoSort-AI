import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Layers, 
  MapPin, 
  Maximize2, 
  RotateCcw, 
  Play, 
  Pause, 
  Info,
  CheckCircle2,
  Trash2,
  Truck,
  Factory,
  Recycle,
  Sparkles
} from 'lucide-react';
import type { SmartBin, WasteItem } from '../types/ecosort.ts';

interface DigitalTwin3DProps {
  bins: SmartBin[];
  items: WasteItem[];
  onSelectBin?: (bin: SmartBin) => void;
}

export const DigitalTwin3D: React.FC<DigitalTwin3DProps> = ({ bins, items, onSelectBin }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedStation, setSelectedStation] = useState<string>('Station A');
  const [activeBinData, setActiveBinData] = useState<SmartBin | null>(bins[0] || null);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [cameraView, setCameraView] = useState<'overview' | 'bins' | 'conveyor' | 'processing'>('overview');

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 480;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b12);
    scene.fog = new THREE.FogExp2(0x070b12, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(12, 14, 16);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x10b981, 1.2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 2, 25);
    blueLight.position.set(-6, 4, -4);
    scene.add(blueLight);

    const amberLight = new THREE.PointLight(0xf59e0b, 2, 25);
    amberLight.position.set(6, 4, -4);
    scene.add(amberLight);

    const redLight = new THREE.PointLight(0xef4444, 2, 25);
    redLight.position.set(6, 4, 4);
    scene.add(redLight);

    // 3. Grid & Facility Base
    const gridHelper = new THREE.GridHelper(26, 26, 0x10b981, 0x1f2937);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Floor platform
    const floorGeo = new THREE.BoxGeometry(24, 0.2, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0b1120,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.1;
    scene.add(floor);

    // 4. Central Sorting Gantry / Conveyor Belt
    const conveyorGeo = new THREE.BoxGeometry(16, 0.3, 2.2);
    const conveyorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.6,
      roughness: 0.4
    });
    const conveyor = new THREE.Mesh(conveyorGeo, conveyorMat);
    conveyor.position.set(0, 0.5, 0);
    scene.add(conveyor);

    // Conveyor rollers
    const rollerGroup = new THREE.Group();
    for (let i = -7; i <= 7; i += 1.2) {
      const rollerGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.3, 16);
      const rollerMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
      const roller = new THREE.Mesh(rollerGeo, rollerMat);
      roller.rotation.z = Math.PI / 2;
      roller.position.set(i, 0.68, 0);
      rollerGroup.add(roller);
    }
    scene.add(rollerGroup);

    // Sorting Scanner Arch (Optical AI Sorter)
    const archGeo = new THREE.TorusGeometry(1.6, 0.12, 12, 24, Math.PI);
    const archMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.4 });
    const arch = new THREE.Mesh(archGeo, archMat);
    arch.position.set(0, 0.8, 0);
    arch.rotation.y = Math.PI / 2;
    scene.add(arch);

    // Laser scan light plane
    const laserGeo = new THREE.PlaneGeometry(0.1, 2.6);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.position.set(0, 1.8, 0);
    scene.add(laser);

    // 5. The 4 Smart Bins Hub (Represented in 3D with live fill levels)
    const binMeshMap = new Map<string, THREE.Mesh>();
    const binLocations = [
      { name: 'Blue (Recyclable)', color: 0x2563eb, pos: [-6, 0, -4], key: 'blue' },
      { name: 'Green (Reusable)', color: 0x059669, pos: [-6, 0, 4], key: 'green' },
      { name: 'Brown (Compost)', color: 0xd97706, pos: [6, 0, -4], key: 'brown' },
      { name: 'Red (Hazardous)', color: 0xdc2626, pos: [6, 0, 4], key: 'red' },
    ];

    binLocations.forEach((b, idx) => {
      // Find matching bin from props
      const binData = bins.find(item => item.binColor === b.key) || { fillPercentage: 50 + idx * 10 };
      const fillHeight = 0.5 + (binData.fillPercentage / 100) * 2.2;

      // Outer transparent casing
      const caseGeo = new THREE.BoxGeometry(1.6, 2.6, 1.6);
      const caseMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        transparent: true,
        opacity: 0.5,
        roughness: 0.2,
        metalness: 0.5
      });
      const caseMesh = new THREE.Mesh(caseGeo, caseMat);
      caseMesh.position.set(b.pos[0], 1.3, b.pos[2]);
      scene.add(caseMesh);

      // Inner volumetric fill column
      const fillGeo = new THREE.BoxGeometry(1.4, fillHeight, 1.4);
      const fillMat = new THREE.MeshStandardMaterial({
        color: b.color,
        emissive: b.color,
        emissiveIntensity: 0.3,
        roughness: 0.3
      });
      const fillMesh = new THREE.Mesh(fillGeo, fillMat);
      fillMesh.position.set(b.pos[0], fillHeight / 2, b.pos[2]);
      scene.add(fillMesh);
      binMeshMap.set(b.key, fillMesh);

      // Top sensor cap
      const capGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
      const capMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(b.pos[0], 2.7, b.pos[2]);
      scene.add(cap);
    });

    // 6. Animated Material Movement Cubes
    const movingParticles: { mesh: THREE.Mesh; speed: number; lane: number }[] = [];
    const colors = [0x3b82f6, 0x10b981, 0xf59e0b, 0xef4444];

    for (let i = 0; i < 7; i++) {
      const pGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const pMat = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        metalness: 0.3,
        roughness: 0.5
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.set(-7 + i * 2.4, 0.8, 0);
      scene.add(pMesh);
      movingParticles.push({
        mesh: pMesh,
        speed: 0.03 + (i % 2) * 0.01,
        lane: i % 4
      });
    }

    // 7. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Laser pulsing
      laser.scale.x = 1 + Math.sin(elapsedTime * 4) * 0.3;

      // Particle movement along conveyor
      if (isSimulating) {
        movingParticles.forEach((p) => {
          p.mesh.position.x += p.speed;
          p.mesh.rotation.x += 0.02;
          p.mesh.rotation.y += 0.03;

          // Reset when reached end of conveyor
          if (p.mesh.position.x > 7.5) {
            p.mesh.position.x = -7.5;
          }
        });
      }

      // Camera transitions
      if (cameraView === 'overview') {
        camera.position.lerp(new THREE.Vector3(12, 14, 16), 0.04);
        camera.lookAt(0, 1, 0);
      } else if (cameraView === 'bins') {
        camera.position.lerp(new THREE.Vector3(-8, 7, 7), 0.04);
        camera.lookAt(-5, 2, 0);
      } else if (cameraView === 'conveyor') {
        camera.position.lerp(new THREE.Vector3(0, 4, 6), 0.04);
        camera.lookAt(0, 1, 0);
      } else if (cameraView === 'processing') {
        camera.position.lerp(new THREE.Vector3(8, 7, -6), 0.04);
        camera.lookAt(4, 2, -2);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, [cameraView, isSimulating, bins]);

  const activeBin = activeBinData || bins[0] || {
    id: 'BIN-101',
    station: 'Station A · Library Plaza',
    category: 'recyclable',
    binColor: 'blue',
    fillPercentage: 42,
    itemCount: 18,
    capacityLiters: 120,
    status: 'normal'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Viewport Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            3D Spatial Simulation · Industrial Digital Twin
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Sorting Facility Digital Twin
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Simulates real-time material routing from intake through AI optical sorting gantries and smart bin storage cells.
          </p>
        </div>

        {/* Camera Preset Switches */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => setCameraView('overview')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              cameraView === 'overview' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setCameraView('bins')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              cameraView === 'bins' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Smart Bins
          </button>
          <button
            onClick={() => setCameraView('conveyor')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              cameraView === 'conveyor' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Optical Gantry
          </button>
          <button
            onClick={() => setCameraView('processing')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              cameraView === 'processing' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Compost Bay
          </button>
        </div>
      </div>

      {/* 3D Canvas Container & HUD Overlays */}
      <div className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl h-[520px]">
        
        {/* Three.js mount element */}
        <div ref={mountRef} className="w-full h-full" />

        {/* Top-Left Telemetry Overlay */}
        <div className="absolute top-4 left-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md text-xs space-y-1.5 text-slate-300 pointer-events-auto shadow-lg">
          <div className="font-display font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Conveyor Velocity: 0.85 m/s
          </div>
          <div className="text-[11px] text-slate-400">
            Active Optical Sorter: <span className="text-emerald-300 font-mono">YOLOv8 Edge Laser</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Facility Throughput: <span className="font-mono text-white font-medium">{items.length} items logged</span>
          </div>
        </div>

        {/* Top-Right Simulation Play/Pause Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className="px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 backdrop-blur-md transition-colors"
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isSimulating ? 'Pause Flow' : 'Resume Flow'}
          </button>
        </div>

        {/* Bottom Interactive Bin Telemetry Strip */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="font-mono uppercase text-slate-400 text-[11px]">Active Hub Telemetry:</span>

            {bins.slice(0, 4).map(b => (
              <button
                key={b.id}
                onClick={() => setActiveBinData(b)}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors ${
                  activeBin.id === b.id 
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300' 
                    : 'border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${
                  b.binColor === 'blue' ? 'bg-blue-500' :
                  b.binColor === 'green' ? 'bg-emerald-500' :
                  b.binColor === 'brown' ? 'bg-amber-500' : 'bg-red-500'
                }`} />
                <span>{b.id} ({b.fillPercentage}%)</span>
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 font-mono">
            {activeBin.station} · <span className="text-white font-semibold">{activeBin.itemCount} items stored</span>
          </div>
        </div>

      </div>

      {/* Explanatory Cards below 3D */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="font-semibold text-slate-200 mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            1. Optical Intake & Laser Sorter
          </div>
          <p className="text-slate-400 leading-relaxed">
            YOLOv8 bounding box classifier identifies incoming item geometries on the high-speed belt and actuates pneumatic diverters.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="font-semibold text-slate-200 mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            2. Volumetric Storage Cells
          </div>
          <p className="text-slate-400 leading-relaxed">
            Smart bins track capacity estimates digitally. Overfills automatically trigger volunteer collection dispatch tickets.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="font-semibold text-slate-200 mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            3. Circularity Outcomes
          </div>
          <p className="text-slate-400 leading-relaxed">
            Recycled pellets and organic compost outputs update community CO₂ diversion metrics in real-time.
          </p>
        </div>
      </div>

    </div>
  );
};
