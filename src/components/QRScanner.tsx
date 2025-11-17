import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { QrCode, X, CheckCircle2, Camera as CameraIcon, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const sliderStyles = `
  .zoom-slider::-webkit-slider-thumb {
    appearance: none; height: 20px; width: 20px; border-radius: 50%;
    background: #10b981; cursor: pointer; border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  .zoom-slider::-moz-range-thumb {
    height: 20px; width: 20px; border-radius: 50%; background: #10b981;
    cursor: pointer; border: 2px solid white; box-sizing: border-box;
  }
`;

interface QRScannerProps {
  onScanSuccess?: (transaction: { type: 'scan'; points: number; description: string; location?: string }) => void;
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [supportsZoom, setSupportsZoom] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScannerRunning = useRef(false);
  
  const token = localStorage.getItem("token");
  const API_BASE = window.location.hostname === 'localhost' ? '/api' : 'https://ecopoints.hvd.lat/api';

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 5;
  const ZOOM_STEP = 0.5;

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  });

  const setTransparentBackground = (isTransparent: boolean) => {
    if (Capacitor.isNativePlatform()) {
        document.body.style.backgroundColor = isTransparent ? 'transparent' : '';
        document.getElementById('root')!.style.backgroundColor = isTransparent ? 'transparent' : '';
    }
  };

  const startScanning = async () => {
    if (showSuccess) return;
    setPermissionError(false);

    try {
      if (Capacitor.isNativePlatform()) {
        const permission = await Camera.requestPermissions({ permissions: ['camera'] });
        if (permission.camera !== 'granted') {
          toast.error("Permiso de cámara denegado.");
          setPermissionError(true);
          return;
        }
      }

      setTransparentBackground(true);
      setIsScanning(true);

      const scanner = new Html5Qrcode("qr-reader", { verbose: false });
      scannerRef.current = scanner;
      
      const qrboxFunction = (viewfinderWidth: number, viewfinderHeight: number): { width: number; height: number; } => {
        const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
        const qrboxSize = Math.floor(minEdge * 0.7);
        return { width: qrboxSize, height: qrboxSize };
      };

      const config: any = {
        fps: 10,
        qrbox: qrboxFunction,
        supportedFormats: [Html5QrcodeSupportedFormats.QR_CODE],
      };

      // For native apps, we add advanced constraints for better quality and zoom.
      if (Capacitor.isNativePlatform()) {
        config.videoConstraints = {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            advanced: [{ focusMode: 'continuous' }, { zoom: MIN_ZOOM }]
        };
      }

      // --- SIMPLIFIED FIX: Directly request the rear camera ---
      // The first argument requests the camera. `{ facingMode: "environment" }` is the standard way to ask for the rear camera.
      // This avoids guessing based on camera labels.
      await scanner.start(
        { facingMode: "environment" },
        config,
        (decodedText) => { handleScanSuccess(decodedText); },
        (errorMessage) => { /* ignore */ }
      );
      // --- END OF FIX ---

      isScannerRunning.current = true;
      setTimeout(() => setupZoom(scanner), 500);

    } catch (err: any) {
      console.error("Scanner initialization error:", err);
      setIsScanning(false);
      setTransparentBackground(false);
      if (err.name === 'NotAllowedError' || err.message?.includes('permission')) {
        toast.error("Permiso de cámara denegado. Actívalo en los ajustes.");
        setPermissionError(true);
      } else {
        // Try to get camera list to provide more debug info
        Html5Qrcode.getCameras().then(cameras => {
            console.error("Available cameras on error:", cameras);
            toast.error(`Error al iniciar cámara. Cámaras encontradas: ${cameras.length}. Revisa la consola.`);
        }).catch(() => {
            toast.error(`Error al iniciar cámara: ${err.message || 'Desconocido'}`);
        });
      }
    }
  };

  const setupZoom = (scanner: Html5Qrcode) => {
    try {
      const capabilities = scanner.getRunningTrackCapabilities() as any;
      if (capabilities?.zoom) {
        const settings = scanner.getRunningTrackSettings() as any;
        setZoomLevel(settings.zoom ?? MIN_ZOOM);
        setSupportsZoom(true);
      } else {
        setSupportsZoom(false);
      }
    } catch (error) {
      console.warn("Zoom control not available:", error);
      setSupportsZoom(false);
    }
  };

  const applyZoom = (zoomValue: number) => {
    if (!supportsZoom || !scannerRef.current || !isScannerRunning.current) return;
    try {
      scannerRef.current.applyVideoConstraints({ advanced: [{ zoom: zoomValue }] } as any);
      setZoomLevel(zoomValue);
    } catch (error) {
      console.warn("Failed to apply zoom:", error);
    }
  };
  
  const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    applyZoom(parseFloat(event.target.value));
  };

  const increaseZoom = () => applyZoom(Math.min(zoomLevel + ZOOM_STEP, MAX_ZOOM));
  const decreaseZoom = () => applyZoom(Math.max(zoomLevel - ZOOM_STEP, MIN_ZOOM));

  const stopScanning = async () => {
    setTransparentBackground(false);
    if (scannerRef.current && isScannerRunning.current) {
      try { await scannerRef.current.stop(); } 
      catch (error) { console.warn("Scanner stop error", error); } 
      finally { isScannerRunning.current = false; scannerRef.current = null; }
    }
    setIsScanning(false);
  };

  const handleScanSuccess = async (qrData: string) => {
    await stopScanning();
    if (!token) {
      toast.error("No estás autenticado."); return;
    }
    try {
      const response = await fetch(`${API_BASE}/validarQR`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify({ codigo_qr: qrData }) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const puntosGanados = data.puntos_obtenidos || 0;
      setEarnedPoints(puntosGanados);
      setShowSuccess(true);
      onScanSuccess?.({ type: 'scan', points: puntosGanados, description: data.mensaje || 'QR', location: data.ubicacion });
      toast.success(`¡${data.mensaje || "Éxito"}! Ganaste ${puntosGanados} ecopoints 🎉`);
    } catch (error) {
      console.error("Error processing QR:", error);
      toast.error("Error al procesar el QR.");
    } finally {
        setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  useEffect(() => { return () => { stopScanning(); }; }, []);

  return (
    <div className="p-6 space-y-6">
      <style>{sliderStyles}</style>

      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
          <QrCode className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Escanear QR</h1>
        <p className="text-gray-500">Escanea el código QR del punto de reciclaje para ganar ecopoints</p>
        
        {permissionError && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-yellow-700 text-sm">Permiso de cámara denegado. Habilítalo en los ajustes de la app y reiníciala.</p>
          </div>
        )}
      </div>

      <Card className="overflow-hidden border-2 border-gray-200">
         <div className="relative aspect-square bg-gray-900">
          {!isScanning && !showSuccess && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <CameraIcon className="w-16 h-16 text-gray-400 mx-auto" />
                <p className="text-gray-400">Toca el botón para iniciar</p>
              </div>
            </div>
          )}
          <div id="qr-reader" className={`w-full h-full ${isScanning ? '' : 'hidden'}`}></div>
          {isScanning && (
             <div className="absolute inset-0 pointer-events-none border-8 border-transparent" style={{ borderColor: 'rgba(0,0,0,0.4)'}}>
                <div className="absolute top-1/2 left-1/2 w-full h-full transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className='w-[70vw] h-[70vw] max-w-[280px] max-h-[280px] relative'>
                          <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                          <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                          <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                          <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>
                          <motion.div className="absolute left-0 right-0 h-1 bg-emerald-400/80 rounded-full shadow-[0_0_15px_2px_#34d399]" style={{ top: '5%' }} animate={{ top: ['5%', '95%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }} />
                        </div>
                    </div>
                </div>
            </div>
          )}
          <AnimatePresence>
            {showSuccess && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute inset-0 bg-emerald-600 flex items-center justify-center z-20">
                <div className="text-center text-white space-y-4">
                  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200 }}><CheckCircle2 className="w-20 h-20 mx-auto" /></motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">¡Escaneo exitoso!</h2>
                    <p className="text-emerald-100 mb-4">Has ganado</p>
                    <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 200 }} className="text-white text-5xl font-bold">+{earnedPoints}</motion.p>
                    <p className="text-emerald-100 mt-2">ecopoints</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {isScanning && (
        <Card className="p-4 bg-gray-800 border-gray-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Control de Zoom</span>
              <span className="text-sm font-bold text-white bg-gray-600 px-2 py-1 rounded">{zoomLevel.toFixed(1)}x</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button size="icon" onClick={decreaseZoom} disabled={!supportsZoom || zoomLevel <= MIN_ZOOM} variant="outline" className="bg-gray-700 border-gray-600 text-white h-10 w-10"><Minus className="w-5 h-5" /></Button>
              <input type="range" min={MIN_ZOOM} max={MAX_ZOOM} step={0.1} value={zoomLevel} onChange={handleZoomChange} disabled={!supportsZoom} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer zoom-slider"/>
              <Button size="icon" onClick={increaseZoom} disabled={!supportsZoom || zoomLevel >= MAX_ZOOM} variant="outline" className="bg-gray-700 border-gray-600 text-white h-10 w-10"><Plus className="w-5 h-5" /></Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {!isScanning ? (
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg font-semibold" onClick={startScanning} disabled={showSuccess || permissionError}>
            <CameraIcon className="w-6 h-6 mr-3" />
            {permissionError ? "Permiso denegado" : "Iniciar escaneo con cámara"}
          </Button>
        ) : (
          <Button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold" onClick={stopScanning}>
            <X className="w-6 h-6 mr-3" />
            Detener escaneo
          </Button>
        )}
      </div>
    </div>
  );
}
