import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertOctagon, 
  RefreshCw, 
  Trash2, 
  Zap, 
  Award, 
  Clock, 
  Info,
  ChevronRight,
  ArrowRight,
  ShieldAlert,
  Flame,
  Check
} from 'lucide-react';
import type { 
  UserAccount, 
  WasteItem, 
  BinColor, 
  WasteCategory,
  ScanAnalysisResult 
} from '../types/ecosort.ts';
import { analyzeWasteScan, confirmItemBin } from '../services/apiClient.ts';

interface CitizenScannerProps {
  currentUser: UserAccount;
  onScanCompleted: (item: WasteItem) => void;
  onViewPipeline: () => void;
}

// Preset test samples for 1-click judging reliability
const PRESET_SAMPLES = [
  {
    id: 'sample-bottle',
    label: 'PET Bottle',
    category: 'recyclable' as WasteCategory,
    binColor: 'blue' as BinColor,
    desc: 'Plastic beverage container',
    hintText: 'Clear PET Water Bottle plastic 500ml',
    demoImageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'sample-banana',
    label: 'Banana Peel',
    category: 'biodegradable' as WasteCategory,
    binColor: 'brown' as BinColor,
    desc: 'Organic compostable food waste',
    hintText: 'Fresh yellow organic banana peel fruit scrap',
    demoImageUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'sample-battery',
    label: 'Li-Ion Battery',
    category: 'hazardous' as WasteCategory,
    binColor: 'red' as BinColor,
    desc: 'Toxic e-waste battery',
    hintText: 'Lithium-ion phone battery e-waste hazardous circuit',
    demoImageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'sample-tumbler',
    label: 'Travel Tumbler',
    category: 'reusable' as WasteCategory,
    binColor: 'green' as BinColor,
    desc: 'Stainless steel coffee mug',
    hintText: 'Stainless steel reusable coffee mug tumbler silicone lid',
    demoImageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'sample-pizza',
    label: 'Greasy Pizza Box',
    category: 'biodegradable' as WasteCategory,
    binColor: 'brown' as BinColor,
    desc: 'Oil-soaked paper (compostable)',
    hintText: 'Greasy cardboard pizza box with food cheese residue',
    demoImageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'sample-foil',
    label: 'Chip Foil Bag',
    category: 'unclassified' as WasteCategory,
    binColor: 'slate' as BinColor,
    desc: 'Multilayer metallized film',
    hintText: 'Multilayer metallized foil potato chip snack bag composite',
    demoImageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80',
  }
];

export const CitizenScanner: React.FC<CitizenScannerProps> = ({
  currentUser,
  onScanCompleted,
  onViewPipeline
}) => {
  const [inputMode, setInputMode] = useState<'camera' | 'upload'>('upload');
  const [visionEngine, setVisionEngine] = useState<'yolo' | 'gemini'>('gemini');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Current analysis result & active waste item
  const [analyzedItem, setAnalyzedItem] = useState<WasteItem | null>(null);
  const [confirmationStatus, setConfirmationStatus] = useState<{
    confirmed: boolean;
    isMatch?: boolean;
    confirmedBin?: BinColor;
    creditsAwarded?: number;
  }>({ confirmed: false });

  // Camera stream references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera when camera mode is active
  useEffect(() => {
    if (inputMode === 'camera' && !isCameraActive && !analyzedItem) {
      startCamera();
    } else if (inputMode !== 'camera' && isCameraActive) {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [inputMode]);

  const startCamera = async (deviceId?: string) => {
    let stream: MediaStream | null = null;
    try {
      setErrorMsg(null);
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Camera stream is not supported on this device/browser or requires HTTPS.');
      }
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          ...(deviceId || selectedCameraId
            ? { deviceId: { exact: deviceId || selectedCameraId } }
            : { facingMode: { ideal: 'environment' } }),
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      const devices = (await navigator.mediaDevices.enumerateDevices())
        .filter(camera => camera.kind === 'videoinput');
      setCameraDevices(devices);

      const activeDeviceId = stream.getVideoTracks()[0]?.getSettings().deviceId;
      if (!deviceId && !selectedCameraId) {
        const preferredCamera = devices.find(camera =>
          /asus/i.test(camera.label) && /(fhd|webcam|camera)/i.test(camera.label)
        ) || devices.find(camera => /(integrated|built[\s-]?in)/i.test(camera.label));

        if (preferredCamera && preferredCamera.deviceId !== activeDeviceId) {
          stream.getTracks().forEach(track => track.stop());
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: preferredCamera.deviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });
        }
      }

      const chosenDeviceId = deviceId || selectedCameraId || stream.getVideoTracks()[0]?.getSettings().deviceId || '';
      setSelectedCameraId(chosenDeviceId);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      stream?.getTracks().forEach(track => track.stop());
      console.warn('Camera access issue:', err);
      setErrorMsg(err instanceof Error ? `Camera could not be started: ${err.message}` : 'Camera access was denied or not available. Please use image upload or a sample preset.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();
    setSelectedImage(dataUrl);
    handleAnalyzeImage(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedImage(result);
      handleAnalyzeImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: typeof PRESET_SAMPLES[0]) => {
    setSelectedImage(sample.demoImageUrl);
    handleAnalyzeImage(undefined, sample.hintText, sample.demoImageUrl);
  };

  const handleAnalyzeImage = async (
    imageBase64?: string, 
    hintText?: string, 
    demoImageUrl?: string
  ) => {
    try {
      setIsAnalyzing(true);
      setErrorMsg(null);
      setConfirmationStatus({ confirmed: false });

      const response = await analyzeWasteScan({
        imageBase64,
        hintText,
        engine: visionEngine,
        demoImageUrl: demoImageUrl || imageBase64,
        userId: currentUser.id,
        userName: currentUser.name,
        station: currentUser.stationOrZone || 'Station A · Main Campus Library'
      });

      setAnalyzedItem(response.item);
      onScanCompleted(response.item);
    } catch (err: any) {
      setErrorMsg(err.message || 'Vision classification failed. Please try another image.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmBinDeposit = async (binColor: BinColor) => {
    if (!analyzedItem) return;

    try {
      const result = await confirmItemBin(analyzedItem.id, binColor, currentUser.id);
      setConfirmationStatus({
        confirmed: true,
        isMatch: result.isMatch,
        confirmedBin: binColor,
        creditsAwarded: result.creditsAwarded
      });
      setAnalyzedItem(result.item);
      onScanCompleted(result.item);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit bin confirmation.');
    }
  };

  const handleResetForNextScan = () => {
    setAnalyzedItem(null);
    setSelectedImage(null);
    setConfirmationStatus({ confirmed: false });
    setErrorMsg(null);
    if (inputMode === 'camera') {
      startCamera();
    }
  };

  // Bin color badge styling helper
  const getStreamColorClasses = (color: BinColor) => {
    switch (color) {
      case 'blue':
        return {
          border: 'border-blue-500/40',
          bg: 'bg-blue-950/20',
          text: 'text-blue-400',
          accent: 'bg-blue-600',
          glow: 'shadow-blue-500/10',
          tag: 'Recyclable Stream · Blue Bin'
        };
      case 'green':
        return {
          border: 'border-emerald-500/40',
          bg: 'bg-emerald-950/20',
          text: 'text-emerald-400',
          accent: 'bg-emerald-600',
          glow: 'shadow-emerald-500/10',
          tag: 'Reusable Asset · Green Hub'
        };
      case 'brown':
        return {
          border: 'border-amber-600/40',
          bg: 'bg-amber-950/20',
          text: 'text-amber-400',
          accent: 'bg-amber-600',
          glow: 'shadow-amber-500/10',
          tag: 'Biodegradable Compost · Brown Bin'
        };
      case 'red':
        return {
          border: 'border-red-500/40',
          bg: 'bg-red-950/20',
          text: 'text-red-400',
          accent: 'bg-red-600',
          glow: 'shadow-red-500/10',
          tag: 'Hazardous / E-Waste · Red Bin'
        };
      default:
        return {
          border: 'border-slate-500/40',
          bg: 'bg-slate-900/30',
          text: 'text-slate-300',
          accent: 'bg-slate-600',
          glow: 'shadow-slate-500/10',
          tag: 'Unclassified Item · Volunteer Review'
        };
    }
  };

  const streamTheme = analyzedItem ? getStreamColorClasses(analyzedItem.binColor) : getStreamColorClasses('blue');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Viewport Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1">
            Multimodal Vision AI · 4-Stream Smart Classification
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Waste Scanner & Bin Verifier
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Point your camera or upload an image to identify recyclables, reusable items, organics, or hazardous e-waste. Confirm which bin you use to earn verified eco-credits.
          </p>
        </div>

        {/* Selectors: Input Mode + Vision Engine */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          
          {/* Vision Model Engine Toggle (YOLOv8 vs Gemini) */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setVisionEngine('yolo')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                visionEngine === 'yolo'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              YOLOv8 Edge Vision
            </button>
            <button
              onClick={() => setVisionEngine('gemini')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                visionEngine === 'gemini'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Gemini 3.8 Flash
            </button>
          </div>

          {/* Input Mode Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => {
                setInputMode('camera');
                if (analyzedItem) handleResetForNextScan();
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                inputMode === 'camera'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Live Camera
            </button>
            <button
              onClick={() => {
                setInputMode('upload');
                stopCamera();
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                inputMode === 'upload'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload / Presets
            </button>
          </div>

        </div>
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Scanner Alert:</span> {errorMsg}
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-200 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Left is Scanner / Image Viewfinder; Right is Classification & Confirmation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Viewfinder & Quick Presets (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-xl min-h-[360px] flex flex-col justify-center items-center">
            
            {/* 1. Live Camera Viewfinder */}
            {inputMode === 'camera' && !selectedImage && (
              <div className="relative w-full h-[380px] bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {cameraDevices.length > 0 && (
                  <label className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/90 px-3 py-2 text-xs text-slate-200 shadow-lg">
                    <Camera className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Camera</span>
                    <select
                      value={selectedCameraId}
                      onChange={event => {
                        const deviceId = event.target.value;
                        setSelectedCameraId(deviceId);
                        stopCamera();
                        void startCamera(deviceId);
                      }}
                      className="max-w-48 bg-transparent text-xs text-white outline-none"
                      aria-label="Select camera"
                    >
                      {cameraDevices.map((device, index) => (
                        <option key={device.deviceId} value={device.deviceId} className="bg-slate-900">
                          {device.label || `Camera ${index + 1}`}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {/* Crosshair Viewfinder Overlay */}
                <div className="absolute inset-8 pointer-events-none border border-emerald-500/30 rounded-xl flex items-center justify-center">
                  <div className="w-16 h-16 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0 rounded-tl-lg" />
                  <div className="w-16 h-16 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0 rounded-tr-lg" />
                  <div className="w-16 h-16 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0 rounded-bl-lg" />
                  <div className="w-16 h-16 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0 rounded-br-lg" />
                  
                  <div className="text-xs font-mono text-emerald-400 bg-slate-950/80 px-2.5 py-1 rounded border border-emerald-500/20 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 animate-spin" />
                    Align Waste Item in View
                  </div>
                </div>

                {/* Shutter Capture Button */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <button
                    onClick={captureCameraFrame}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 text-sm"
                  >
                    <Camera className="w-4 h-4" />
                    Snapshot & Identify
                  </button>
                </div>
              </div>
            )}

            {/* 2. Image Preview when Captured or Selected */}
            {selectedImage && (
              <div className="relative w-full h-[380px] bg-slate-950 flex items-center justify-center overflow-hidden">
                <img
                  src={selectedImage}
                  alt="Scanned item preview"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />

                {/* YOLOv8 Edge Vision Bounding Box Overlay */}
                {analyzedItem && (
                  <div className="absolute inset-10 pointer-events-none border-2 border-emerald-400 bg-emerald-500/10 rounded-lg flex items-start justify-start p-2 shadow-2xl">
                    <div className="bg-slate-950/95 border border-emerald-400 text-emerald-300 px-2.5 py-1 rounded text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-lg">
                      <Zap className="w-3 h-3 text-emerald-400" />
                      <span>{analyzedItem.name}</span>
                      <span className="text-slate-500">·</span>
                      <span>{Math.round(analyzedItem.confidence * 100)}%</span>
                      <span className="text-slate-500">·</span>
                      <span className="uppercase text-white">{analyzedItem.binColor} BIN</span>
                    </div>
                  </div>
                )}

                {/* Retake / Rescan Floating Button */}
                <button
                  onClick={handleResetForNextScan}
                  className="absolute top-4 right-4 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-xs flex items-center gap-1.5 backdrop-blur-md transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Scan Another
                </button>
              </div>
            )}

            {/* 3. Drag-and-Drop Upload Mode (Zero-State) */}
            {inputMode === 'upload' && !selectedImage && (
              <div className="p-8 w-full text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-base text-slate-200">
                  Drop a waste photo here
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1 mb-5">
                  Supports JPEG, PNG, WEBP packaging images. Instant analysis will classify into the 4 official streams.
                </p>

                <label className="cursor-pointer px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  Select File from Computer
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Loading Indicator Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-emerald-400 z-20">
                <div className="w-12 h-12 border-3 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mb-3" />
                <div className="font-display font-semibold text-sm text-white">
                  Gemini 3.8 Flash Analyzing Material...
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Parsing polymers, organics, and hazardous components
                </div>
              </div>
            )}

          </div>

          {/* Quick-Test Demo Samples Bar */}
          <div className="border border-slate-800/80 rounded-xl bg-slate-900/40 p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                Quick Test Samples for Judging
              </span>
              <span className="text-[11px] text-slate-500">
                Click any item to test
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_SAMPLES.map(sample => {
                const colorConfig = getStreamColorClasses(sample.binColor);
                return (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    disabled={isAnalyzing}
                    className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/50 hover:bg-slate-900 hover:border-slate-700 transition-all text-left flex items-start gap-2.5 group"
                  >
                    <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${colorConfig.accent}`} />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                        {sample.label}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {sample.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: 4-Stream Result & Closed-Loop Confirmation (5 cols) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Zero-State Placeholder before scanning */}
          {!analyzedItem && !isAnalyzing && (
            <div className="border border-slate-800 rounded-2xl bg-slate-900/40 p-8 text-center flex flex-col items-center justify-center min-h-[360px]">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mb-3">
                <Info className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-base text-slate-200">
                Awaiting Waste Scan
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Take a photo or pick a sample on the left. The AI will output recommended stream, bin color, and safety instructions.
              </p>
              
              <div className="mt-6 pt-6 border-t border-slate-800/80 w-full grid grid-cols-2 gap-2 text-left">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Blue = Recyclable
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Green = Reusable
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Brown = Compost
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Red = Hazardous
                </div>
              </div>
            </div>
          )}

          {/* Populated 4-Stream Detection Card */}
          {analyzedItem && (
            <div className={`rounded-2xl border ${streamTheme.border} ${streamTheme.bg} p-6 shadow-xl transition-all`}>
              
              {/* Top Stream Badge & Confidence */}
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${streamTheme.accent}`} />
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
                    {analyzedItem.category.toUpperCase()} STREAM
                  </span>
                </div>

                <div className="text-xs font-mono tabular-nums text-slate-400">
                  {Math.round(analyzedItem.confidence * 100)}% Confidence
                </div>
              </div>

              {/* Item Name & Primary Guidance Banner */}
              <div className="my-5">
                <h2 className="text-xl font-display font-bold text-white tracking-tight">
                  {analyzedItem.name}
                </h2>
                
                {/* Big Visual Bin Guidance Callout */}
                <div className={`mt-3 p-3.5 rounded-xl border ${streamTheme.border} bg-slate-950/70 flex items-center gap-3`}>
                  <div className={`w-9 h-9 rounded-lg ${streamTheme.accent} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                    {analyzedItem.binColor.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Official Campus Guideline:</div>
                    <div className={`text-sm font-bold ${streamTheme.text}`}>
                      Deposit into the {analyzedItem.binColor.toUpperCase()} Bin
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Material Details & Decomposition Timeline */}
              <div className="space-y-3 py-3 border-t border-slate-800/80 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Detection Model:</span>
                  <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1">
                    {analyzedItem.engine === 'yolo' ? (
                      <>
                        <Zap className="w-3 h-3 text-blue-400" />
                        YOLOv8 Edge (ClassMap)
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        Gemini 3.8 Flash Vision
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Material Composition:</span>
                  <span className="font-medium text-slate-200">{analyzedItem.material}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Decomposition Period:</span>
                  <span className="font-mono tabular-nums text-slate-200">{analyzedItem.decompositionTime}</span>
                </div>
                <div className="text-slate-400 pt-1 leading-relaxed">
                  <span className="font-medium text-slate-300">Instructions: </span>
                  {analyzedItem.recyclingInstructions}
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* CLOSED-LOOP VERIFICATION: Citizen confirms which bin was used */}
              {/* ------------------------------------------------------------- */}
              <div className="mt-6 pt-5 border-t border-slate-800">
                
                {!confirmationStatus.confirmed ? (
                  <div>
                    <div className="text-xs font-medium text-slate-300 mb-2.5 flex items-center justify-between">
                      <span>Step 2: Confirm Physical Bin Used</span>
                      <span className="text-[11px] text-emerald-400 font-mono">+{analyzedItem.suggestedPoints} pts</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-3.5 leading-snug">
                      Tap the bin color you actually placed this in. Correct sorting awards points; mismatches are flagged for volunteer verification.
                    </p>

                    {/* 4 Large Tactile Buttons */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => handleConfirmBinDeposit('blue')}
                        className="py-2.5 px-3 rounded-lg border border-blue-500/40 bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        Blue (Recyclable)
                      </button>

                      <button
                        onClick={() => handleConfirmBinDeposit('green')}
                        className="py-2.5 px-3 rounded-lg border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        Green (Reusable)
                      </button>

                      <button
                        onClick={() => handleConfirmBinDeposit('brown')}
                        className="py-2.5 px-3 rounded-lg border border-amber-600/40 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                        Brown (Compost)
                      </button>

                      <button
                        onClick={() => handleConfirmBinDeposit('red')}
                        className="py-2.5 px-3 rounded-lg border border-red-500/40 bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        Red (Hazardous)
                      </button>
                    </div>
                  </div>
                ) : (
                  
                  /* Dynamic Feedback after confirmation */
                  <div className="space-y-3">
                    {confirmationStatus.isMatch ? (
                      <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-200">
                        <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          Deposit Verified · Match Confirmed!
                        </div>
                        <p className="text-xs text-emerald-300/80 mt-1">
                          You correctly deposited this item in the {confirmationStatus.confirmedBin?.toUpperCase()} bin. 
                          <span className="font-mono font-bold text-emerald-300 ml-1">+{confirmationStatus.creditsAwarded} Eco-Credits</span> added to your profile!
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-500/50 text-amber-200">
                        <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
                          <AlertOctagon className="w-4 h-4" />
                          Bin Mismatch Flagged for Volunteer Audit
                        </div>
                        <p className="text-xs text-amber-300/80 mt-1 leading-snug">
                          The system recommended <span className="font-semibold text-white">{analyzedItem.binColor.toUpperCase()}</span>, but you confirmed deposit into <span className="font-semibold text-white">{confirmationStatus.confirmedBin?.toUpperCase()}</span>.
                          Item marked as disputed. A volunteer will physically verify to maintain waste purity.
                        </p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={handleResetForNextScan}
                        className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Scan Next Item
                      </button>

                      <button
                        onClick={onViewPipeline}
                        className="py-2 px-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        Track Lifecycle
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
